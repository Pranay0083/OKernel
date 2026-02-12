import json
import os
import pytest
from okernel import Trace, trace


def test_trace_object_initialization():
    events = [{"type": "Trace", "event": "call"}]
    t = Trace(events)
    assert t.events == events


def test_trace_summary():
    events = [
        {"type": "Trace", "memory_peak": 1024, "process_time": 100},
        {"type": "Trace", "memory_peak": 2048, "process_time": 200},
        {"type": "Trace", "memory_peak": 2048, "process_time": 300},
    ]
    t = Trace(events)
    summary = t.summary()
    assert "Total Steps: 3" in summary
    assert "Peak Memory: 2048 bytes" in summary
    assert "Duration" in summary


def test_trace_to_json(tmp_path):
    events = [{"type": "Trace", "event": "call"}]
    t = Trace(events)

    output_file = tmp_path / "trace.json"
    t.to_json(str(output_file))

    assert output_file.exists()
    with open(output_file) as f:
        data = json.load(f)
        assert data == events


def test_trace_to_html(tmp_path):
    events = [{"type": "Trace", "event": "call"}]
    t = Trace(events)

    output_file = tmp_path / "trace.html"
    t.to_html(str(output_file))

    assert output_file.exists()
    with open(output_file) as f:
        content = f.read()
        assert "<!DOCTYPE html>" in content
        assert "OKernel Trace Visualizer" in content


def test_trace_function():
    code = "x = 42"
    result = trace(code)

    assert isinstance(result, Trace)
    assert len(result.events) > 0
    # Check if we have trace events
    assert any(e["type"] == "Trace" for e in result.events)


def test_trace_function_capture_stdout():
    code = "print('hello')"
    result = trace(code)

    assert any(e["type"] == "Stdout" and "hello" in e["data"] for e in result.events)
