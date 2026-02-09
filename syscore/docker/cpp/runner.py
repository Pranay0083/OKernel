
import sys
import subprocess
import json
import time
import os

def run_cpp_code(code_string):
    # 1. Write Code
    with open("main.cpp", "w") as f:
        f.write(code_string)

    # 2. Compile
    compile_proc = subprocess.run(
        ["g++", "-g", "-O0", "main.cpp", "-o", "app"],
        capture_output=True,
        text=True
    )

    if compile_proc.returncode != 0:
        err_event = {
            "type": "Error",
            "content": f"Compilation Error:\n{compile_proc.stderr}",
            "timestamp": time.time_ns()
        }
        sys.stdout.write(f"__SYSCORE_EVENT__{json.dumps(err_event)}\n")
        return

    # 3. Generate GDB Python Script
    # This script runs INSIDE GDB via `source trace.py`
    gdb_script = """
import gdb
import json
import time
import sys

def get_stack_depth():
    depth = 0
    f = gdb.newest_frame()
    while f:
        depth += 1
        f = f.older()
    return depth

def trace():
    # Set up
    gdb.execute("set pagination off")
    gdb.execute("set confirm off")
    
    # Break at main
    gdb.execute("break main")
    
    # Run
    try:
        gdb.execute("run")
    except gdb.error as e:
        print(f"DEBUG: Run failed: {e}")
        return

    # Step Loop
    while True:
        try:
            frame = gdb.selected_frame()
        except gdb.error:
            break # Execution finished

        sal = frame.find_sal()
        if not sal:
             # Can't determine source line, likely deep system code or optimized out
             # Try to return to caller
             try:
                 gdb.execute("finish")
             except:
                 gdb.execute("step") # Fallback
             continue

        filename = sal.symtab.filename if sal.symtab else "unknown"
        if filename != "main.cpp":
             # We are in system code (e.g. iostream). Fast forward out.
             try:
                 gdb.execute("finish") 
             except:
                 # 'finish' fails if we are the outermost frame or other issues
                 gdb.execute("step")
             continue

        # Extract Info
        line = sal.line
        func = frame.name()
        filename = sal.symtab.filename if sal.symtab else "unknown"
        
        # Locals
        locals_data = {}
        block = frame.block()
        while block:
            if block.function: break
            block = block.superblock
            
        # Iterate variables in block (if possible? GDB Python API implies iterating symbol table?)
        # Actually frame.read_var(name) works if we know names.
        # But to list locals, we need to iterate block symbols.
        try:
            block = frame.block()
            for symbol in block:
                if symbol.is_argument or symbol.is_variable:
                    val = symbol.value(frame)
                    locals_data[symbol.name] = {
                        "value": str(val),
                        "type": str(symbol.type),
                        "address": hex(int(val.address)) if val.address else "0x0"
                    }
        except:
             pass # Block might be global or issues

        # Emit Event
        event_data = {
            "type": "Trace",
            "event": "line",
            "line": line,
            "function": func,
            "filename": filename,
            "locals": locals_data,
            "stack_depth": get_stack_depth(),
            "memory_curr": 0, # Could try to estimate heap?
            "timestamp": int(time.time() * 1e9), # Approximate ns
            "process_time": int(time.process_time() * 1e9)
        }
        
        # DIRECTLY WRITE TO STDOUT (Mixed with GDB output but prefixed)
        print(f"__SYSCORE_EVENT__{json.dumps(event_data)}")
        sys.stdout.flush()

        # Step
        try:
            gdb.execute("step")
        except gdb.error:
            break # Program exited

# Run the trace
trace()
gdb.execute("quit")
"""
    with open("trace.py", "w") as f:
        f.write(gdb_script)

    # 4. Run GDB
    process = subprocess.Popen(
        ["gdb", "--batch", "-x", "trace.py", "./app"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT, 
        text=True,
        bufsize=1
    )

    print("DEBUG: GDB-Python Runner Started", flush=True)
    
    # Proxy output
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if not line:
            continue
        
        # Directly print GDB output (it contains our __SYSCORE_EVENT__ lines)
        sys.stdout.write(line)
        sys.stdout.flush()

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            run_cpp_code(sys.argv[1])
        else:
            print("DEBUG: No code argument provided", flush=True)
    except Exception as e:
        import traceback
        traceback.print_exc()
        err = {"type": "Error", "content": str(e), "timestamp": time.time_ns()}
        sys.stdout.write(f"__SYSCORE_EVENT__{json.dumps(err)}\n")
