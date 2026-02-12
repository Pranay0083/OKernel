import sys
import unittest
from okernel.syscore.memory import MemoryTracker


class TestMemoryTracker(unittest.TestCase):
    def setUp(self):
        self.tracker = MemoryTracker()

    def test_initial_state(self):
        self.assertEqual(self.tracker.get_current(), 0)
        self.assertEqual(self.tracker.get_peak(), 0)

    def test_track_object(self):
        s = "hello"
        size = sys.getsizeof(s)
        self.tracker.track(s)
        self.assertEqual(self.tracker.get_current(), size)
        self.assertEqual(self.tracker.get_peak(), size)

    def test_track_multiple(self):
        s1 = "a"
        s2 = "b"
        size1 = sys.getsizeof(s1)
        size2 = sys.getsizeof(s2)

        self.tracker.track(s1)
        self.tracker.track(s2)

        self.assertEqual(self.tracker.get_current(), size1 + size2)
        self.assertEqual(self.tracker.get_peak(), size1 + size2)

    def test_deduplication(self):
        # Tracking the same object id twice should not double count
        s = "unique"
        size = sys.getsizeof(s)
        self.tracker.track(s)
        self.tracker.track(s)
        self.assertEqual(self.tracker.get_current(), size)

    def test_reset(self):
        self.tracker.track("temp")
        self.assertTrue(self.tracker.get_current() > 0)
        self.tracker.reset()
        self.assertEqual(self.tracker.get_current(), 0)
        self.assertEqual(self.tracker.get_peak(), 0)
