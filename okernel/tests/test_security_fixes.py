import os
import tempfile
import json
from okernel.visualizer.renderer import render_html


def test_renderer_xss_prevention():
    """
    Test that the renderer escapes </script> tags in the JSON output
    to prevent XSS via script injection.
    """
    # Malicious payload that attempts to close the script tag and alert
    payload = "</script><script>alert('XSS')</script>"
    events = [{"type": "Stdout", "data": payload, "timestamp": 1000}]

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp:
        output_path = tmp.name

    try:
        render_html(events, output_path)

        with open(output_path, "r", encoding="utf-8") as f:
            content = f.read()

        # The raw payload MUST NOT be present as-is in the HTML source
        # specifically the closing script tag which breaks the JSON context
        assert "</script><script>" not in content

        # It should be escaped, e.g. <\/script>
        assert "<\\/script>" in content or "\\u003c/script\\u003e" in content

    finally:
        if os.path.exists(output_path):
            os.remove(output_path)


def test_template_no_unsafe_innerhtml():
    """
    Test that the template.html file does not contain unsafe innerHTML assignments.
    This is a static analysis test to prevent regression.
    """
    # Locate template
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to okernel, then visualizer/template.html
    template_path = os.path.join(current_dir, "..", "visualizer", "template.html")

    with open(template_path, "r", encoding="utf-8") as f:
        content = f.read()

    # We allow innerHTML = '' (clearing)
    # We flag other usages
    lines = content.splitlines()
    for i, line in enumerate(lines):
        if ".innerHTML =" in line:
            # Allow clearing
            if "innerHTML = ''" in line or 'innerHTML = ""' in line:
                continue

            # Allow known safe static HTML if absolutely necessary (though we prefer not to)
            # But for this task, we want to ensure we replaced dynamic ones.
            # Any usage with ${...} is definitely bad.
            if "${" in line:
                raise AssertionError(
                    f"Unsafe innerHTML usage found at line {i + 1}: {line.strip()}"
                )

            # Ideally we want to ban it entirely except for clearing, but let's be strict about interpolation
