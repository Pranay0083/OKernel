import sys

sys.path.insert(0, "/Users/vaiditya/Desktop/PROJECTS/OKernel")
from okernel import trace

# malicious variable
code = "x = '<img src=x onerror=alert(1)>'"
t = trace(code)
t.to_html("/tmp/xss_var_test.html")
