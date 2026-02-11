import json
import os
from typing import List, Dict, Any


def render_html(events: List[Dict[str, Any]], output_path: str) -> None:
    """
    Render trace events to a self-contained HTML visualizer.

    Args:
        events: List of trace events
        output_path: Path to write the HTML file
    """
    from pathlib import Path

    # Locate template
    template_path = Path(__file__).parent / "template.html"

    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    # Serialize data
    # Ensure json is safe for embedding in HTML <script>
    json_data = json.dumps(events)
    # Prevent script injection by escaping the closing script tag
    json_data = json_data.replace("</script>", "<\\/script>")

    # Injection
    # We replace the comment placeholder
    html_content = template.replace("<!-- TRACE_DATA -->", json_data)

    # Write output
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
