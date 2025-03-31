#!/usr/bin/env python3

import os
import sys
import pypandoc
from pathlib import Path

# Define file paths
project_root = Path('/home/ai-dev/Desktop/tap-integration-platform')
input_file = project_root / 'project' / 'sunlight' / 'EXECUTIVE_REPORT.md'
output_file = project_root / 'project' / 'sunlight' / 'TAP_INNOVATIONS_EXECUTIVE_REPORT.pdf'
html_output = project_root / 'project' / 'sunlight' / 'TAP_INNOVATIONS_EXECUTIVE_REPORT.html'

# Enhanced Markdown with YAML frontmatter
enhanced_markdown = """---
title: "TAP Integration Platform"
subtitle: "Executive Report"
author: "TAP INNOVATIONS"
date: "March 29, 2025"
geometry: margin=1in
colorlinks: true
linkcolor: blue
---

# TAP INNOVATIONS
## Integration Platform Executive Report

*CONFIDENTIAL EXECUTIVE SUMMARY*

*Generated on March 29, 2025*

"""

# Read the existing content (skipping the title)
with open(input_file, 'r') as f:
    content = f.read()
    # Skip the first two lines (title and date)
    content_lines = content.split('\n')[2:]
    content = '\n'.join(content_lines)

# Combine the enhanced header with the original content
final_markdown = enhanced_markdown + content

# Write the enhanced markdown back to a temporary file
temp_file = project_root / 'project' / 'sunlight' / 'ENHANCED_REPORT.md'
with open(temp_file, 'w') as f:
    f.write(final_markdown)

print(f"Enhanced Markdown created at {temp_file}")

# Try to convert to HTML (more likely to succeed than PDF)
try:
    # First try HTML conversion as it's more likely to work
    html = pypandoc.convert_file(
        str(temp_file),
        'html',
        format='markdown',
        extra_args=[
            '--standalone',
            '--template=default',
            '--toc',
        ]
    )
    
    with open(html_output, 'w') as f:
        f.write(html)
    print(f"HTML report created at {html_output}")
    
    # Try PDF conversion if HTML worked
    try:
        pypandoc.convert_file(
            str(temp_file),
            'pdf',
            outputfile=str(output_file),
            extra_args=[
                '--standalone',
                '--template=default',
                '--toc',
                '--highlight-style=tango',
            ]
        )
        print(f"PDF report created at {output_file}")
    except Exception as e:
        print(f"PDF conversion failed: {e}")
        print("Please note: PDF conversion requires a LaTeX engine like XeLaTeX to be installed.")
        
except Exception as e:
    print(f"HTML conversion failed: {e}")
    print("The enhanced Markdown is still available for manual conversion later.")

print("\nYou can manually convert the enhanced Markdown file with Pandoc using:")
print(f"pandoc {temp_file} -o report.pdf --from markdown --toc")