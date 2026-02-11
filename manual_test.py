import sys

sys.path.insert(0, "/Users/vaiditya/Desktop/PROJECTS/OKernel")
from okernel import trace

t = trace("x = [1,2,3]\nfor i in x:\n    print(i)")
t.to_html("/tmp/okernel_test.html")
print("File created!")
