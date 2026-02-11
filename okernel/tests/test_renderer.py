import os
import json
import tempfile
from okernel.visualizer.renderer import render_html
from okernel import Trace


def test_render_html_basic():
    """Test that render_html creates a file with injected data."""
    events = [
        {"type": "Trace", "line": 1, "function": "<module>", "timestamp": 1000},
        {"type": "Stdout", "data": "Hello", "timestamp": 1001},
        {"type": "Trace", "line": 2, "function": "<module>", "timestamp": 1002},
    ]

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp:
        output_path = tmp.name

    try:
        render_html(events, output_path)

        assert os.path.exists(output_path)

        with open(output_path, "r") as f:
            content = f.read()

        # Check for key markers
        assert "<!DOCTYPE html>" in content
        assert "OKernel Visualizer" in content

        # Check data injection
        assert "const rawEvents =" in content
        # We need to make sure the JSON is there.
        # Since it's injected as raw JSON, we can search for a unique string from events
        assert '"data": "Hello"' in content
        assert '"function": "<module>"' in content

    finally:
        if os.path.exists(output_path):
            os.remove(output_path)


def test_trace_integration():
    """Test Trace.to_html method (mocking the renderer import if needed, but here testing end-to-end)"""
    # Create a real trace object
    events = [{"type": "Trace", "timestamp": 0}]
    t = Trace(events)

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp:
        output_path = tmp.name

    try:
        # This will fail until we implement Trace.to_html
        t.to_html(output_path)

        assert os.path.exists(output_path)
        with open(output_path, "r") as f:
            content = f.read()
            assert "OKernel Visualizer" in content

    except NotImplementedError:
        # Expected failure for now if not implemented, but we want the test to fail if it stays NotImplemented
        raise AssertionError("Trace.to_html raised NotImplementedError")
    except Exception as e:
        raise e
    finally:
        if os.path.exists(output_path):
            os.remove(output_path)
