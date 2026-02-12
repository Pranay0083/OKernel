import sys
import unittest
import gc
from okernel.syscore.tracer import Tracer


class TestTracer(unittest.TestCase):
    def test_trace_simple_function(self):
        tracer = Tracer()

        def simple_func():
            x = 1
            y = 2
            return x + y

        tracer.start()
        simple_func()
        tracer.stop()

        events = tracer.events
        self.assertTrue(len(events) > 0)

        # Check for specific events
        call_events = [
            e for e in events if e["event"] == "call" and e["function"] == "simple_func"
        ]
        self.assertEqual(len(call_events), 1)

        return_events = [
            e
            for e in events
            if e["event"] == "return" and e["function"] == "simple_func"
        ]
        self.assertEqual(len(return_events), 1)

        # Check locals capture
        # Find the last line event where y is defined
        line_events = [
            e for e in events if e["event"] == "line" and e["function"] == "simple_func"
        ]
        self.assertTrue(len(line_events) >= 2)

        last_line = line_events[-1]
        self.assertIn("x", last_line["locals"])
        self.assertIn("y", last_line["locals"])
        self.assertEqual(last_line["locals"]["x"]["value"], "1")
        self.assertEqual(last_line["locals"]["y"]["value"], "2")

    def test_opcode_tracing(self):
        tracer = Tracer()

        def math_op():
            return 1 + 1

        tracer.start()
        math_op()
        tracer.stop()

        events = tracer.events
        opcode_events = [e for e in events if e["event"] == "opcode"]
        self.assertTrue(len(opcode_events) > 0)

        # Verify schema fields for opcode
        op = opcode_events[0]
        self.assertIn("bytecode", op)
        self.assertIn("opcode", op["bytecode"])
        self.assertIn("offset", op["bytecode"])

    def test_schema_conformance(self):
        tracer = Tracer()

        def noop():
            pass

        tracer.start()
        noop()
        tracer.stop()

        required_keys = {
            "type",
            "event",
            "line",
            "function",
            "filename",
            "locals",
            "memory_curr",
            "memory_peak",
            "stack_depth",
            "timestamp",
            "process_time",
        }

        for e in tracer.events:
            self.assertTrue(
                required_keys.issubset(e.keys()), f"Missing keys in {e.keys()}"
            )

    def test_gc_tracking(self):
        tracer = Tracer()
        tracer.start()

        # Create garbage
        for _ in range(100):
            _ = [i for i in range(100)]

        gc.collect()

        tracer.stop()

        gc_events = [e for e in tracer.events if e.get("type") == "GC"]
        self.assertTrue(len(gc_events) > 0, "No GC events captured")

        event = gc_events[0]
        self.assertIn("generation", event)
        self.assertIn("collected", event)
        self.assertIn("timestamp", event)
        self.assertIn("process_time", event)

    def test_locals_truncation(self):
        tracer = Tracer()

        def huge_string_func():
            long_str = "a" * 200
            return long_str

        tracer.start()
        huge_string_func()
        tracer.stop()

        line_events = [
            e
            for e in tracer.events
            if e["event"] == "return" and e["function"] == "huge_string_func"
        ]
        self.assertTrue(len(line_events) > 0)

        event = line_events[0]
        val = event["locals"]["long_str"]["value"]
        self.assertTrue(len(val) <= 105)  # 100 + "..." (approx)
        self.assertTrue(val.endswith("..."))
