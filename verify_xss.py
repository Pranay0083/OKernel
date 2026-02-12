import sys
import os

# Ensure we import the local okernel, not an installed one
sys.path.insert(0, os.getcwd())

from okernel import trace

# Create a trace with a malicious payload
t = trace('x = "</script><script>alert(1)</script>"\nprint(x)')

# Render it
output_path = "/tmp/xss_test.html"
t.to_html(output_path)

print(f"Generated {output_path}")
