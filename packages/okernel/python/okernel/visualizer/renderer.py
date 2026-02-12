import json
import os
from typing import List, Dict, Any


def render_html(
    events: List[Dict[str, Any]], output_path: str, source: str = ""
) -> None:
    """
    Render trace events to a self-contained HTML visualizer.

    Args:
        events: List of trace events
        output_path: Path to write the HTML file
        source: Source code of the traced program
    """
    from pathlib import Path
    import json

    # Locate template
    template_path = Path(__file__).parent / "template.html"

    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    # Serialize data
    json_events = json.dumps(events)
    json_source = json.dumps(source)

    # Prevent script injection
    json_events = json_events.replace("</script>", "<\\/script>")
    json_source = json_source.replace("</script>", "<\\/script>")

    # Injection
    html_content = template.replace("<!-- TRACE_DATA -->", json_events)
    html_content = html_content.replace("<!-- SOURCE_DATA -->", json_source)

    # Write output
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
