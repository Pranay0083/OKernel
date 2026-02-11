import unittest
import sys
import os
import inspect
from typing import Dict, Any, List

# Ensure we can import okernel
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import okernel
from okernel.syscore.tracer import Tracer


class TestCompliance(unittest.TestCase):
    def test_api_existence(self):
        """Rejection 2: Check for version and public API stubs"""
        self.assertTrue(hasattr(okernel, "__version__"), "__version__ missing")
        self.assertTrue(hasattr(okernel, "trace"), "trace() function missing")
        self.assertTrue(hasattr(okernel, "Trace"), "Trace class missing")

    def test_schema_compliance(self):
        """Rejection 3: Check that ALL trace events have ALL fields"""
        tracer = Tracer()
        tracer.start()

        # Run some code to generate events
        a = 1
        b = 2
        c = a + b

        tracer.stop()

        required_fields = [
            "type",
            "event",
            "line",
            "function",
            "filename",
            "locals",
            "memory_curr",
            "memory_peak",
            "stack_depth",
            "bytecode",
            "hardware",
            "timestamp",
            "process_time",
        ]

        for event in tracer.events:
            for field in required_fields:
                self.assertIn(
                    field, event, f"Event {event['event']} missing field {field}"
                )

            # Specific check for bytecode and hardware which were missing
            if event["event"] != "opcode":
                self.assertIsNone(
                    event["bytecode"], "bytecode should be None for non-opcode events"
                )
                self.assertIsNone(
                    event["hardware"], "hardware should be None for non-opcode events"
                )
            else:
                # Basic sanity check for opcode events
                if event.get("bytecode"):
                    self.assertIn("opcode", event["bytecode"])
                    self.assertIn("offset", event["bytecode"])
                if event.get("hardware"):
                    self.assertIn("type", event["hardware"])
                    self.assertIn("cost", event["hardware"])
                    self.assertIn("opcode", event["hardware"])

    def test_type_hints_profiler(self):
        """Rejection 1: Check type hints in profiler.py"""
        from okernel.syscore import profiler

        sig = inspect.signature(profiler.get_hardware_info)
        self.assertNotEqual(
            sig.parameters["opname"].annotation,
            inspect.Parameter.empty,
            "Missing type hint for opname",
        )
        self.assertNotEqual(
            sig.return_annotation, inspect.Signature.empty, "Missing return type hint"
        )

    def test_type_hints_memory(self):
        """Rejection 1: Check type hints in memory.py"""
        from okernel.syscore import memory

        sig = inspect.signature(memory.MemoryTracker.track)
        self.assertNotEqual(
            sig.parameters["obj"].annotation,
            inspect.Parameter.empty,
            "Missing type hint for obj",
        )

        sig = inspect.signature(memory.MemoryTracker.get_current)
        self.assertNotEqual(
            sig.return_annotation, inspect.Signature.empty, "Missing return type hint"
        )


class TestFullPipeline(unittest.TestCase):
    def setUp(self):
        self.test_file = "test_output.html"
        if os.path.exists(self.test_file):
            os.remove(self.test_file)

    def tearDown(self):
        if os.path.exists(self.test_file):
            os.remove(self.test_file)

    def test_trace_to_html_pipeline(self):
        code = """
def fact(n):
    if n <= 1: return 1
    return n * fact(n-1)
print(fact(3))
"""
        # 1. Trace
        trace = okernel.trace(code)
        self.assertIsInstance(trace, okernel.Trace)
        self.assertGreater(len(trace.events), 0)

        # 2. Check Summary
        summary = trace.summary()
        self.assertIn("Total Steps", summary)
        self.assertIn("Peak Memory", summary)
        self.assertIn("Duration", summary)

        # 3. Generate HTML
        trace.to_html(self.test_file)

        # 4. Verify HTML
        self.assertTrue(os.path.exists(self.test_file))
        self.assertGreater(os.path.getsize(self.test_file), 0)

        with open(self.test_file, "r") as f:
            content = f.read()
            self.assertIn("<!DOCTYPE html>", content)
            self.assertIn("const rawEvents =", content)
            self.assertIn("OKernel Visualizer", content)
            # We expect the renderer to inject json data.
            # Let's check if "fact" string is inside the file (in the JSON payload)
            self.assertIn("fact", content)

    def test_edge_case_empty_code(self):
        trace = okernel.trace("")
        self.assertIsInstance(trace, okernel.Trace)
        self.assertIsInstance(trace.events, list)
        # We don't enforce 0 events as some runtime overhead events might occur

    def test_edge_case_syntax_error(self):
        code = "def broken_code(:)"
        trace = okernel.trace(code)
        # Should contain an Error event
        error_events = [e for e in trace.events if e.get("type") == "Error"]
        self.assertEqual(len(error_events), 1)
        self.assertEqual(error_events[0]["class"], "SyntaxError")

    def test_edge_case_runtime_error(self):
        code = "1 / 0"
        trace = okernel.trace(code)
        error_events = [e for e in trace.events if e.get("type") == "Error"]
        self.assertEqual(len(error_events), 1)
        self.assertEqual(error_events[0]["class"], "ZeroDivisionError")

    def test_edge_case_recursive(self):
        code = """
def rec(n):
    if n == 0: return
    rec(n-1)
rec(5)
"""
        trace = okernel.trace(code)
        # Just ensure it runs and captures depth
        self.assertGreater(len(trace.events), 10)
        max_depth = max(e.get("stack_depth", 0) for e in trace.events)
        self.assertGreater(max_depth, 4)

    def test_edge_case_imports(self):
        code = """
import math
print(math.pi)
"""
        trace = okernel.trace(code)
        # Should capture stdout
        stdout_events = [e for e in trace.events if e.get("type") == "Stdout"]
        self.assertTrue(any("3.14" in e["data"] for e in stdout_events))


if __name__ == "__main__":
    unittest.main()
