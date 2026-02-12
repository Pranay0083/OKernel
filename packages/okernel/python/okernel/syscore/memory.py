import sys


class MemoryTracker:
    """
    Custom memory tracker using sys.getsizeof() and id().
    Tracks cumulative size of unique objects seen.
    """

    def __init__(self):
        self._tracked_ids = set()
        self._current_memory = 0
        self._peak_memory = 0

    def track(self, obj: object) -> None:
        """
        Track an object's memory usage.
        Only adds to count if object ID hasn't been seen since last reset.
        """
        obj_id = id(obj)
        if obj_id not in self._tracked_ids:
            size = sys.getsizeof(obj)
            self._tracked_ids.add(obj_id)
            self._current_memory += size
            if self._current_memory > self._peak_memory:
                self._peak_memory = self._current_memory

    def get_current(self) -> int:
        """Return current tracked memory in bytes."""
        return self._current_memory

    def get_peak(self) -> int:
        """Return peak tracked memory in bytes."""
        return self._peak_memory

    def reset(self) -> None:
        """Reset all tracking stats."""
        self._tracked_ids.clear()
        self._current_memory = 0
        self._peak_memory = 0
