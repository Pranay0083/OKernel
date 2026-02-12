import pytest
from okernel.syscore.runner import run_code


def test_stdout_capture():
    code = "print('Hello, World!')"
    events = run_code(code)

    stdout_events = [e for e in events if e["type"] == "Stdout"]
    assert len(stdout_events) > 0
    assert "Hello, World!" in stdout_events[0]["data"]


def test_stderr_capture():
    # We can simulate stderr using sys.stderr.write
    code = "import sys; sys.stderr.write('Error output')"
    events = run_code(code)

    stderr_events = [e for e in events if e["type"] == "Stderr"]
    assert len(stderr_events) > 0
    assert "Error output" in stderr_events[0]["data"]


def test_exception_handling():
    code = "1 / 0"
    events = run_code(code)

    # Check for Error event
    error_events = [e for e in events if e["type"] == "Error"]
    assert len(error_events) > 0
    assert error_events[0]["class"] == "ZeroDivisionError"

    # Check for exception trace event
    exception_events = [
        e for e in events if e.get("type") == "Trace" and e.get("event") == "exception"
    ]
    assert len(exception_events) > 0


def test_trace_generation():
    code = """
x = 10
y = 20
z = x + y
"""
    events = run_code(code)

    # Check if we have trace events
    trace_events = [e for e in events if e["type"] == "Trace"]
    assert len(trace_events) > 0

    # Verify local variables were captured
    last_event = trace_events[-1]
    # We might not catch the very last state depending on when trace stops,
    # but we should see z defined in one of the later events.

    # Search for an event where z is defined
    z_found = False
    for event in trace_events:
        if "locals" in event and "z" in event["locals"]:
            if event["locals"]["z"]["value"] == "30":
                z_found = True
                break

    assert z_found


def test_runner_syntax_error():
    code = "def foo("  # Invalid syntax
    events = run_code(code)

    error_events = [e for e in events if e["type"] == "Error"]
    assert len(error_events) > 0
    assert error_events[0]["class"] == "SyntaxError"
