import sys
import os

sys.path.insert(0, "/Users/vaiditya/Desktop/PROJECTS/OKernel")
from okernel import trace, Trace, __version__

print(f"okernel v{__version__}")

# Test 1: Simple code
t = trace("x = 1 + 2\nprint(x)")
assert isinstance(t, Trace)
assert len(t.events) > 0
print(f"Test 1 passed: {len(t.events)} events")

# Test 2: Summary
s = t.summary()
assert "Steps" in s or "steps" in s
print(f"Test 2 passed: summary works")

# Test 3: to_json
json_path = "/tmp/test.json"
if os.path.exists(json_path):
    os.remove(json_path)
t.to_json(json_path)
import json

with open(json_path) as f:
    data = json.load(f)
assert isinstance(data, list)
print(f"Test 3 passed: JSON export works")

# Test 4: to_html
html_path = "/tmp/test.html"
if os.path.exists(html_path):
    os.remove(html_path)
t.to_html(html_path)
with open(html_path) as f:
    html = f.read()
assert "<html" in html.lower()
assert "TRACE_DATA" not in html  # Placeholder should be replaced
print(f"Test 4 passed: HTML export works")

print("ALL MANUAL TESTS PASSED!")
