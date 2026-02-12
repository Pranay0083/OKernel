import unittest
from okernel.syscore.profiler import get_hardware_info


class TestProfiler(unittest.TestCase):
    def test_known_opcodes(self):
        hw_type, cost = get_hardware_info("LOAD_CONST")
        self.assertEqual(hw_type, "MEM_READ")
        self.assertEqual(cost, 2)

        hw_type, cost = get_hardware_info("BINARY_ADD")
        self.assertEqual(hw_type, "ALU")
        self.assertEqual(cost, 1)

    def test_heuristics(self):
        hw_type, cost = get_hardware_info("LOAD_UNKNOWN_THING")
        self.assertEqual(hw_type, "MEM_READ")

        hw_type, cost = get_hardware_info("UNKNOWN_CALL")
        self.assertEqual(hw_type, "FUNCTION")

    def test_fallback(self):
        hw_type, cost = get_hardware_info("WEIRD_OPCODE_XYZ")
        self.assertEqual(hw_type, "OTHER")
        self.assertEqual(cost, 1)
