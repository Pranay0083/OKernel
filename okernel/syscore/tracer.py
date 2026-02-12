import sys
import time
import dis
import gc
from types import FrameType
from typing import Any, List, Dict, Optional, Set, Callable
from .memory import MemoryTracker
from .profiler import get_hardware_info


class Tracer:
    """
    Traces Python code execution, memory usage, and bytecode operations.

    This class sets up a system trace function to capture call events,
    line execution, and opcode execution, along with memory snapshots.
    """

    def __init__(self) -> None:
        self.events: List[Dict[str, Any]] = []
        self.memory_tracker: MemoryTracker = MemoryTracker()
        self.stack_depth: int = 0
        self._ignore_files: Set[str] = {__file__}

    def start(self) -> None:
        """
        Start the tracer.

        Resets event logs and memory tracker, then registers the trace function
        with sys.settrace().
        """
        self.events = []
        self.memory_tracker.reset()
        self.stack_depth = 0
        sys.settrace(self._trace_func)
        gc.callbacks.append(self._gc_callback)

    def stop(self) -> None:
        """
        Stop the tracer.

        Unregisters the trace function from sys.settrace().
        """
        sys.settrace(None)
        if self._gc_callback in gc.callbacks:
            gc.callbacks.remove(self._gc_callback)

    def _gc_callback(self, phase: str, info: Dict[str, Any]) -> None:
        """
        Callback for garbage collection events.
        """
        if phase == "stop":
            timestamp: int = time.time_ns()
            process_time: int = time.process_time_ns()

            self.events.append(
                {
                    "type": "GC",
                    "generation": info.get("generation"),
                    "collected": info.get("collected"),
                    "uncollectable": info.get("uncollectable"),
                    "timestamp": timestamp,
                    "process_time": process_time,
                }
            )

    def _trace_func(self, frame: FrameType, event: str, arg: Any) -> Optional[Callable]:
        """
        Internal trace function called by Python for each event.

        Args:
            frame: The current stack frame.
            event: The event type (e.g., 'call', 'line', 'return', 'opcode').
            arg: Event-specific argument (e.g., return value).

        Returns:
            The trace function itself to continue tracing, or None to stop.
        """
        if frame.f_code.co_filename in self._ignore_files:
            return None

        # Enable per-instruction tracing for this frame
        frame.f_trace_opcodes = True
        frame.f_trace_lines = True

        if event == "call":
            self.stack_depth += 1
        elif event == "return":
            self.stack_depth = max(0, self.stack_depth - 1)

        timestamp: int = time.time_ns()
        process_time: int = time.process_time_ns()

        # Capture locals
        local_vars: Dict[str, Dict[str, Any]] = {}
        for k, v in frame.f_locals.items():
            self.memory_tracker.track(v)

            # Safe string conversion with truncation
            val_str = str(v)
            if len(val_str) > 100:
                val_str = val_str[:100] + "..."

            local_vars[k] = {
                "value": val_str,
                "type": type(v).__name__,
                "address": hex(id(v)),
                "size": sys.getsizeof(v),
            }

        trace_event: Dict[str, Any] = {
            "type": "Trace",
            "event": event,
            "line": frame.f_lineno,
            "function": frame.f_code.co_name,
            "filename": frame.f_code.co_filename,
            "locals": local_vars,
            "memory_curr": self.memory_tracker.get_current(),
            "memory_peak": self.memory_tracker.get_peak(),
            "stack_depth": self.stack_depth,
            "timestamp": timestamp,
            "process_time": process_time,
            "bytecode": None,
            "hardware": None,
        }

        if event == "opcode":
            code = frame.f_code
            lasti = frame.f_lasti
            try:
                # Python 3.11+ changed co_code format slightly but indexing bytes still works
                opcode = code.co_code[lasti]
                opname = dis.opname[opcode]
                trace_event["bytecode"] = {"opcode": opname, "offset": lasti}

                # Hardware Info
                hw_type, cost = get_hardware_info(opname)
                trace_event["hardware"] = {
                    "type": hw_type,
                    "cost": cost,
                    "opcode": opname,
                }
            except Exception:
                pass

        self.events.append(trace_event)
        return self._trace_func
