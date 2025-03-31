#!/usr/bin/env python3
"""
Script to generate PDF reports from markdown files using pandoc.
Requires pandoc and a PDF engine like wkhtmltopdf to be installed.

Usage:
    python generate-reports.py

This will generate PDF versions of the C-level and Developer Team reports.
"""

import os
import subprocess
import sys
from datetime import datetime

# Configuration
REPORTS = [
    {
        "input": "TAP_Executive_Assessment_Report.md",
        "output": "PDF_TAP_Executive_Assessment_Report.pdf",
        "title": "TAP Integration Platform: Executive Assessment",
        "toc": True,
        "highlight_style": "tango",
        "template": "eisvogel",  # Requires the Eisvogel template to be installed
    },
    {
        "input": "TAP_Technical_Assessment_Report.md",
        "output": "PDF_TAP_Technical_Assessment_Report.pdf",
        "title": "TAP Integration Platform: Technical Assessment",
        "toc": True,
        "number_sections": True,
        "highlight_style": "tango",
        "template": "eisvogel",  # Requires the Eisvogel template to be installed
    },
]

def check_requirements():
    """Check if required tools are installed"""
    try:
        subprocess.run(["pandoc", "--version"], check=True, stdout=subprocess.PIPE)
        print("✓ Pandoc is installed")
    except (subprocess.SubprocessError, FileNotFoundError):
        print("✗ Pandoc is not installed. Please install it first.")
        print("  See https://pandoc.org/installing.html")
        return False

    return True

def generate_report(report_config):
    """Generate a PDF report using pandoc"""
    input_file = report_config["input"]
    output_file = report_config["output"]
    
    if not os.path.exists(input_file):
        print(f"✗ Input file not found: {input_file}")
        return False
    
    print(f"Generating {output_file} from {input_file}...")
    
    cmd = ["pandoc", input_file, "-o", output_file]
    
    # Add metadata
    if "title" in report_config:
        cmd.extend(["--metadata", f"title={report_config['title']}"])
    
    cmd.extend(["--metadata", f"date={datetime.now().strftime('%B %d, %Y')}"])
    cmd.extend(["--metadata", "author=Technical Evaluation Team"])
    
    # Add options
    if report_config.get("toc", False):
        cmd.append("--toc")
    
    if report_config.get("number_sections", False):
        cmd.append("--number-sections")
    
    if "highlight_style" in report_config:
        cmd.extend(["--highlight-style", report_config["highlight_style"]])
    
    if "template" in report_config:
        cmd.extend(["--template", report_config["template"]])
    
    # Convert to PDF
    cmd.extend(["-f", "markdown", "-t", "pdf"])
    
    try:
        subprocess.run(cmd, check=True)
        print(f"✓ Successfully generated {output_file}")
        return True
    except subprocess.SubprocessError as e:
        print(f"✗ Failed to generate {output_file}: {e}")
        return False

def main():
    """Main function"""
    if not check_requirements():
        sys.exit(1)
    
    print("Generating TAP Integration Platform Assessment Reports...")
    print("=" * 60)
    
    success_count = 0
    total_reports = len(REPORTS)
    
    # Generate main reports
    for report in REPORTS:
        if generate_report(report):
            success_count += 1
    
    print("=" * 60)
    print(f"Report generation complete: {success_count}/{total_reports} reports generated successfully.")
    
    if success_count == total_reports:
        print("\nAll reports have been generated in the current directory.")
        print("The PDF files are prefixed with 'PDF_' as requested.")
    else:
        print("\nSome reports failed to generate. Please check the error messages above.")

if __name__ == "__main__":
    main()