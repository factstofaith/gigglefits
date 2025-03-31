#!/usr/bin/env python3
"""
Script to convert Mermaid diagram markdown files to PNG images.
Requires node.js and the @mermaid-js/mermaid-cli package to be installed.

Usage:
    python convert-diagrams.py

This will convert all .md files in the assets directory that contain Mermaid diagrams.
"""

import os
import subprocess
import sys
import re

# Configuration
ASSETS_DIR = "assets"
OUTPUT_DIR = "assets/images"
DIAGRAM_FILES = [
    "architecture-diagram.md",
    "architecture-detailed.md",
    "database-erd.md",
    "security-architecture.md",
]


def check_requirements():
    """Check if required tools are installed"""
    try:
        subprocess.run(["npx", "--version"], check=True, stdout=subprocess.PIPE)
        print("✓ Node.js/npx is installed")
    except (subprocess.SubprocessError, FileNotFoundError):
        print("✗ Node.js/npx is not installed. Please install it first.")
        print("  See https://nodejs.org/")
        return False

    # Check if mermaid-cli is installed
    try:
        subprocess.run(["npx", "@mermaid-js/mermaid-cli", "--version"], 
                      check=True, stdout=subprocess.PIPE)
        print("✓ @mermaid-js/mermaid-cli is installed")
    except subprocess.SubprocessError:
        print("✗ @mermaid-js/mermaid-cli is not installed.")
        print("  Installing temporarily...")
        try:
            subprocess.run(["npx", "@mermaid-js/mermaid-cli", "--version"], 
                          check=False, stdout=subprocess.PIPE)
            print("✓ @mermaid-js/mermaid-cli installed temporarily")
        except subprocess.SubprocessError:
            print("✗ Failed to install @mermaid-js/mermaid-cli")
            return False

    return True


def extract_mermaid_diagram(file_path):
    """Extract Mermaid diagram from markdown file"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            
        # Look for ```mermaid ... ``` block
        match = re.search(r'```mermaid\s+(.*?)```', content, re.DOTALL)
        if match:
            return match.group(1)
        else:
            print(f"✗ No mermaid diagram found in {file_path}")
            return None
    except Exception as e:
        print(f"✗ Error reading file {file_path}: {e}")
        return None


def save_temp_mermaid_file(diagram_content, temp_file="temp_diagram.mmd"):
    """Save diagram content to a temporary file"""
    try:
        with open(temp_file, 'w') as f:
            f.write(diagram_content)
        return True
    except Exception as e:
        print(f"✗ Error saving temporary diagram file: {e}")
        return False


def convert_mermaid_to_png(mermaid_file, output_file):
    """Convert Mermaid file to PNG using mermaid-cli"""
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Run the conversion
        cmd = [
            "npx", "@mermaid-js/mermaid-cli",
            "-i", mermaid_file,
            "-o", output_file,
            "--backgroundColor", "white"
        ]
        
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
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("Converting Mermaid diagrams to PNG images...")
    print("=" * 60)
    
    success_count = 0
    
    for diagram_file in DIAGRAM_FILES:
        input_path = os.path.join(ASSETS_DIR, diagram_file)
        output_name = os.path.splitext(diagram_file)[0] + ".png"
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        print(f"Processing {input_path}...")
        
        # Extract diagram
        diagram_content = extract_mermaid_diagram(input_path)
        if not diagram_content:
            continue
        
        # Save to temp file
        temp_file = "temp_diagram.mmd"
        if not save_temp_mermaid_file(diagram_content, temp_file):
            continue
        
        # Convert to PNG
        if convert_mermaid_to_png(temp_file, output_path):
            success_count += 1
        
        # Clean up temp file
        try:
            os.remove(temp_file)
        except:
            pass
    
    print("=" * 60)
    print(f"Diagram conversion complete: {success_count}/{len(DIAGRAM_FILES)} diagrams converted successfully.")
    
    if success_count == len(DIAGRAM_FILES):
        print(f"\nAll diagrams have been converted to PNG images in the {OUTPUT_DIR} directory.")
    else:
        print(f"\nSome diagrams failed to convert. Please check the error messages above.")


if __name__ == "__main__":
    main()