import sys
import json
import tracemalloc
import os
import io
import threading
import gc
import dis
import time

# Initialize tracemalloc
tracemalloc.start()

class TraceRunner:
    def __init__(self):
        self.events = []
        self.app_thread_id = threading.get_ident()
        self.last_instruction = -1

    def trace_calls(self, frame, event, arg):
        # Allow opcode tracing
        frame.f_trace_opcodes = True
        frame.f_trace_lines = True
        
        # We want to trace 'call', 'line', 'return', 'exception', 'opcode'
        if event not in ['call', 'line', 'return', 'exception', 'opcode']:
            return self.trace_calls
        
        co = frame.f_code
        filename = co.co_filename
        
        if "user_code.py" not in filename:
            return self.trace_calls

        # Capture rich locals with address and size
        safe_locals = {}
        for k, v in frame.f_locals.items():
            try:
                s_val = str(v)
                if len(s_val) > 200: s_val = s_val[:200] + "..."
                safe_locals[k] = {
                    "value": s_val,
                    "type": type(v).__name__,
                    "address": hex(id(v)),
                    "size": sys.getsizeof(v)
                }
            except:
                safe_locals[k] = {"value": "<error>", "type": "unknown", "address": "0x0", "size": 0}

        # Capture memory
        mem_curr, mem_peak = tracemalloc.get_traced_memory()

        # Calculate stack depth
        depth = 0
        f = frame
        while f:
            depth += 1
            f = f.f_back

        # Opcode details
        opcode_name = ""
        opcode_arg = ""
        
        if event == 'opcode':
            try:
                # frame.f_lasti is the index of the *next* instruction (or current executing?)
                # Actually f_lasti is the index of the instruction being executed.
                code_bytes = co.co_code
                lasti = frame.f_lasti
                
                # Use dis to find the opcode name
                if lasti >= 0 and lasti < len(code_bytes):
                    op = code_bytes[lasti]
                    opcode_name = dis.opname[op]
                    # This implies we might want to decode the arg, but for now just the name is huge progress
                    
                    # Optional: Getting the argument is complex without full disassembly, 
                    # but dis.get_instructions(co) could be cached to map offset -> instruction
            except Exception as e:
                opcode_name = "ERROR_OP"

        event_data = {
            "type": "Trace",
            "event": event,
            "line": frame.f_lineno,
            "function": co.co_name,
            "filename": filename,
            "locals": safe_locals,
            "memory_curr": mem_curr,
            "memory_peak": mem_peak,
            "stack_depth": depth,
            "bytecode": {
                "opcode": opcode_name,
                "offset": frame.f_lasti
            },
            "timestamp": time.time_ns() 
        }
        
        # Emit event
        sys.__stdout__.write(f"__SYSCORE_EVENT__{json.dumps(event_data)}\n")
        sys.__stdout__.flush()
        
        return self.trace_calls

def gc_callback(phase, info):
    # Monitor Garbage Collection
    event_data = {
        "type": "GC",
        "phase": phase, # 'start' or 'stop'
        "info": info,
        "timestamp": time.time_ns(),
        "memory_curr": tracemalloc.get_traced_memory()[0]
    }
    sys.__stdout__.write(f"__SYSCORE_EVENT__{json.dumps(event_data)}\n")
    sys.__stdout__.flush()

def run_user_code(code_string):
    # Write to file
    with open("user_code.py", "w") as f:
        f.write(code_string)

    # Custom stdout/stderr
    real_stdout = sys.stdout
    real_stderr = sys.stderr
    
    class EventWriter:
        def __init__(self, stream_type):
            self.type = stream_type
        def write(self, text):
            if not text: return
            event = {"type": self.type, "content": text, "timestamp": time.time_ns()}
            sys.__stdout__.write(f"__SYSCORE_EVENT__{json.dumps(event)}\n")
            sys.__stdout__.flush()
        def flush(self):
            pass

    sys.stdout = EventWriter('Stdout')
    sys.stderr = EventWriter('Stderr')

    runner = TraceRunner()
    
    # Register GC callback
    gc.callbacks.append(gc_callback)
    
    try:
        sys.settrace(runner.trace_calls)
        exec(compile(code_string, "user_code.py", "exec"), {'__name__': '__main__'})
    except Exception as e:
        err_event = {"type": "Error", "content": str(e), "timestamp": time.time_ns()}
        sys.__stdout__.write(f"__SYSCORE_EVENT__{json.dumps(err_event)}\n")
    finally:
        sys.settrace(None)
        sys.stdout = real_stdout
        sys.stderr = real_stderr
        # Remove GC callback to avoid side effects if reused (though container dies)
        if gc_callback in gc.callbacks:
            gc.callbacks.remove(gc_callback)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_user_code(sys.argv[1])
    else:
        print("No code provided")
