"""
OKernel: Zero-dependency local Python tracer.

This package provides tools to trace Python code execution, track memory usage,
and generate visualization reports.
"""

__version__ = "0.1.3"

import json
from typing import List, Dict, Any
from .syscore.runner import run_code
from .visualizer.renderer import render_html


class Trace:
    def __init__(self, events: List[Dict[str, Any]]):
        self._events = events

    @property
    def events(self) -> List[Dict[str, Any]]:
        return self._events

    def summary(self) -> str:
        # Calculate stats
        trace_events = [e for e in self._events if e.get("type") == "Trace"]
        total_steps = len(trace_events)

        peak_memory = 0

        start_time = None
        end_time = None

        for e in self._events:
            if "memory_peak" in e:
                peak_memory = max(peak_memory, e["memory_peak"])

            if "timestamp" in e:
                ts = e["timestamp"]
                if start_time is None:
                    start_time = ts
                end_time = ts

        duration_ns = 0
        if start_time is not None and end_time is not None:
            duration_ns = end_time - start_time

        return f"Total Steps: {total_steps}\nPeak Memory: {peak_memory} bytes\nDuration: {duration_ns / 1e9:.4f}s"

    def to_json(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self._events, f, indent=2)

    def to_html(self, path: str) -> None:
        render_html(self._events, path)


def trace(code: str) -> Trace:
    """
    Execute code and return a Trace object containing execution events.
    """
    events = run_code(code)
    return Trace(events)


__all__ = ["trace", "Trace", "__version__"]
