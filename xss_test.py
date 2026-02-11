import sys
import os

sys.path.insert(0, "/Users/vaiditya/Desktop/PROJECTS/OKernel")
from okernel.visualizer.renderer import render_html

# malicious event
events = [{"type": "Stdout", "data": "</script><script>alert('xss')</script>"}]
output = "/tmp/xss_test.html"
render_html(events, output)

with open(output, "r") as f:
    content = f.read()
    if (
        "</script><script>alert('xss')</script>" in content
        and "const rawEvents =" in content
    ):
        # Check if it was escaped. json.dumps escapes quotes, but not < or > or / by default usually
        # but let's see how it looks in the file context
        print("Vulnerability confirmed")
        print(content[-300:])
    else:
        print("Safe?")
