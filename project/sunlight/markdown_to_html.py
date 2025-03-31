#!/usr/bin/env python3

import os
import sys
import markdown
import codecs
from pathlib import Path

# Define file paths
project_root = Path('/home/ai-dev/Desktop/tap-integration-platform')
input_file = project_root / 'project' / 'sunlight' / 'ENHANCED_REPORT.md'
html_output = project_root / 'project' / 'sunlight' / 'TAP_INNOVATIONS_REPORT.html'

# Read the Markdown content
with codecs.open(input_file, mode="r", encoding="utf-8") as f:
    text = f.read()

# Strip YAML frontmatter if present
if text.startswith('---'):
    end_frontmatter = text.find('---', 3)
    if end_frontmatter != -1:
        text = text[end_frontmatter + 3:]

# Convert to HTML
html = markdown.markdown(text, extensions=['extra', 'tables'])

# Add styling
html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TAP INNOVATIONS Executive Report</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }}
        h1, h2, h3, h4, h5, h6 {{
            color: #0057B7;
            margin-top: 1.5em;
        }}
        h1 {{
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 0.5em;
            color: #003366;
        }}
        h2 {{
            font-size: 2em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #eaecef;
        }}
        code, pre {{
            font-family: Consolas, Monaco, 'Courier New', monospace;
            background-color: #f6f8fa;
            border-radius: 3px;
        }}
        pre {{
            padding: 16px;
            overflow: auto;
            line-height: 1.45;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }}
        table, th, td {{
            border: 1px solid #ddd;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #0057B7;
            color: white;
        }}
        tr:nth-child(even) {{
            background-color: #f2f2f2;
        }}
        .page-break {{
            page-break-before: always;
        }}
        .container {{
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }}
        .center {{
            text-align: center;
        }}
        .emoji {{
            font-size: 1.2em;
        }}
        .highlight {{
            background-color: #fffacd;
            padding: 2px 4px;
            border-radius: 3px;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eaecef;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }}
        .confidential {{
            border: 2px solid #0057B7;
            padding: 15px; 
            background-color: #f8f9fa;
            text-align: center;
            margin: 20px 0;
        }}
        .star-divider {{
            text-align: center;
            color: #0057B7;
            margin: 30px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        {html}
    </div>
</body>
</html>
"""

# Process HTML to improve styling
# Replace pre blocks with styled versions
styled_html = html_template.replace('<pre>\n★', '<div class="star-divider"><pre>\n★')
styled_html = styled_html.replace('</pre>\n</div>\n\n<div style="page-break-before: always;">', '</pre></div>\n\n<div class="page-break">')

# Fix emojis
for emoji in ['🏆', '📊', '🛡️', '🏗️', '⚡', '🧰', '💪', '👨‍💻', '📈', '🚀']:
    styled_html = styled_html.replace(emoji, f'<span class="emoji">{emoji}</span>')

# Write the HTML to a file
with codecs.open(html_output, mode="w", encoding="utf-8") as f:
    f.write(styled_html)

print(f"HTML report created at {html_output}")