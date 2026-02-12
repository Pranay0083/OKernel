import sys
import time
import traceback
from typing import List, Dict, Any, TextIO
from .tracer import Tracer


class StreamCapturer:
    """
    Captures stdout/stderr streams and records them as trace events.
    """

    def __init__(self, event_type: str, events_list: List[Dict[str, Any]]):
        self.event_type = event_type
        self.events = events_list

    def write(self, data: str) -> int:
        if not data:
            return 0

        self.events.append(
            {"type": self.event_type, "data": data, "timestamp": time.time_ns()}
        )
        return len(data)

    def flush(self) -> None:
        pass


def run_code(code: str) -> List[Dict[str, Any]]:
    """
    Execute Python code and capture trace events.

    Args:
        code: The Python source code to execute.

    Returns:
        A list of trace event dictionaries conforming to the SysCore schema.
        Events include traces, stdout/stderr writes, and errors.
    """
    tracer = Tracer()
    # Add runner.py to ignore list to avoid tracing the capture logic
    tracer._ignore_files.add(__file__)
    tracer.start()

    old_stdout = sys.stdout
    old_stderr = sys.stderr

    # We must access tracer.events after start(), as start() re-initializes it.
    capture_stdout = StreamCapturer("Stdout", tracer.events)
    capture_stderr = StreamCapturer("Stderr", tracer.events)

    sys.stdout = capture_stdout  # type: ignore
    sys.stderr = capture_stderr  # type: ignore

    try:
        # Create a fresh global namespace
        global_ns: Dict[str, Any] = {}
        exec(code, global_ns)
    except SyntaxError as e:
        tracer.stop()
        tracer.events.append(
            {
                "type": "Error",
                "class": type(e).__name__,
                "message": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": time.time_ns(),
            }
        )
    except Exception as e:
        tracer.stop()
        tracer.events.append(
            {
                "type": "Error",
                "class": type(e).__name__,
                "message": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": time.time_ns(),
            }
        )
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        tracer.stop()

    return tracer.events
