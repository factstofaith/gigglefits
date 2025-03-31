#!/usr/bin/env python3
"""
Test Coverage Report Generator

This script generates a comprehensive coverage report for the TAP Integration Platform
by analyzing test execution results and code coverage information.
"""

import os
import sys
import json
import datetime
import subprocess
import re
from collections import defaultdict

# Directory paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TEST_DIR = os.path.join(PROJECT_ROOT, 'test')
REPORT_OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'test', 'reports')

# Ensure report directory exists
os.makedirs(REPORT_OUTPUT_DIR, exist_ok=True)

# Test categories
TEST_CATEGORIES = {
    'e2e': ['test_*_e2e*.py', 'test_user_workflow_validation.py'],
    'security': ['test_api_authorization.py', 'test_credential_manager*.py', 'test_mfa_integration*.py', 
                 'test_oauth_integration*.py'],
    'service': ['test_*_service*.py'],
    'error_handling': ['test_service_error_handling.py', 'test_error_handling_recovery.py'],
    'adapter': ['test_*_adapter.py', 'test_*_connector.py'],
    'performance': ['test_performance_validation.py'],
    'isolation': ['test_tenant_isolation.py', 'test_tenant_validation.py'],
    'helpers': ['test_file_type_utilities*.py', 'test_helpers*.py', 'test_scheduler*.py', 
                'test_transformation_registry*.py']
}

def find_test_files(category_patterns):
    """Find test files matching the category patterns."""
    matches = []
    for pattern in category_patterns:
        for root, _, files in os.walk(TEST_DIR):
            for file in files:
                if re.match(pattern.replace('*', '.*'), file):
                    matches.append(os.path.join(root, file))
    return matches

def collect_test_information():
    """Collect test information by category."""
    test_info = {}
    for category, patterns in TEST_CATEGORIES.items():
        test_files = find_test_files(patterns)
        test_count = 0
        for test_file in test_files:
            # Count test methods in each file
            try:
                with open(test_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Count test methods using regex
                    test_methods = re.findall(r'def\s+test_\w+\s*\(', content)
                    test_count += len(test_methods)
            except UnicodeDecodeError:
                # Try with latin-1 encoding as fallback
                try:
                    with open(test_file, 'r', encoding='latin-1') as f:
                        content = f.read()
                        # Count test methods using regex
                        test_methods = re.findall(r'def\s+test_\w+\s*\(', content)
                        test_count += len(test_methods)
                except Exception as e:
                    print(f"Error reading file {test_file}: {e}")
                    continue
            except Exception as e:
                print(f"Error reading file {test_file}: {e}")
                continue
        
        test_info[category] = {
            'files': test_files,
            'test_count': test_count
        }
    
    return test_info

def run_pytest_coverage():
    """Run pytest with coverage and return the results."""
    try:
        # Run pytest with coverage
        subprocess.run([
            'python', '-m', 'pytest', '--cov=adapters', '--cov=core', '--cov=db', 
            '--cov=modules', '--cov=utils', '--cov-report=term', '--cov-report=xml:coverage.xml'
        ], cwd=PROJECT_ROOT, check=True)
        
        # Parse coverage XML report
        coverage_xml_path = os.path.join(PROJECT_ROOT, 'coverage.xml')
        if not os.path.exists(coverage_xml_path):
            print("Coverage XML report not found. Coverage analysis will be limited.")
            return {}
        
        # Parse coverage data
        import xml.etree.ElementTree as ET
        tree = ET.parse(coverage_xml_path)
        root = tree.getroot()
        
        coverage_data = {}
        for package in root.findall('.//package'):
            package_name = package.attrib['name']
            coverage_data[package_name] = {
                'line_rate': float(package.attrib['line-rate']),
                'branch_rate': float(package.attrib.get('branch-rate', '0')),
                'classes': {}
            }
            
            for class_elem in package.findall('.//class'):
                class_name = class_elem.attrib['name']
                coverage_data[package_name]['classes'][class_name] = {
                    'line_rate': float(class_elem.attrib['line-rate']),
                    'branch_rate': float(class_elem.attrib.get('branch-rate', '0')),
                    'lines': len(class_elem.findall('.//line'))
                }
        
        return coverage_data
    
    except Exception as e:
        print(f"Error running pytest coverage: {e}")
        return {}

def generate_test_summary(test_info, coverage_data):
    """Generate summary of test coverage."""
    total_tests = sum(info['test_count'] for info in test_info.values())
    total_files = sum(len(info['files']) for info in test_info.values())
    
    # Calculate overall coverage if coverage data is available
    overall_line_coverage = 0
    overall_branch_coverage = 0
    total_packages = 0
    
    if coverage_data:
        total_coverage_rate = 0
        for package_name, package_data in coverage_data.items():
            total_coverage_rate += package_data['line_rate']
            total_packages += 1
        
        if total_packages > 0:
            overall_line_coverage = total_coverage_rate / total_packages
    
    summary = {
        'total_tests': total_tests,
        'total_test_files': total_files,
        'tests_by_category': {category: info['test_count'] for category, info in test_info.items()},
        'test_files_by_category': {category: len(info['files']) for category, info in test_info.items()},
        'overall_line_coverage': overall_line_coverage,
        'overall_branch_coverage': overall_branch_coverage,
        'coverage_by_package': {}
    }
    
    if coverage_data:
        for package_name, package_data in coverage_data.items():
            summary['coverage_by_package'][package_name] = {
                'line_coverage': package_data['line_rate'],
                'branch_coverage': package_data['branch_rate'],
                'classes': len(package_data['classes'])
            }
    
    return summary

def generate_coverage_report(summary):
    """Generate a markdown coverage report."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    report = f"""# TAP Integration Platform Test Coverage Report

## Overview

This report provides a comprehensive analysis of test coverage for the TAP Integration Platform.

**Generated:** {timestamp}

## Test Summary

- **Total Tests:** {summary['total_tests']}
- **Total Test Files:** {summary['total_test_files']}
- **Overall Line Coverage:** {summary['overall_line_coverage']*100:.2f}%

## Tests by Category

| Category | Tests | Files |
|----------|-------|-------|
"""
    
    # Add tests by category
    for category, count in summary['tests_by_category'].items():
        report += f"| {category.replace('_', ' ').title()} | {count} | {summary['test_files_by_category'][category]} |\n"
    
    report += """
## Coverage by Package

| Package | Line Coverage | Branch Coverage | Classes |
|---------|--------------|----------------|---------|
"""
    
    # Add coverage by package
    for package_name, package_data in summary.get('coverage_by_package', {}).items():
        report += f"| {package_name} | {package_data['line_coverage']*100:.2f}% | {package_data['branch_coverage']*100:.2f}% | {package_data['classes']} |\n"
    
    if not summary.get('coverage_by_package'):
        report += "| No coverage data available | - | - | - |\n"
    
    report += """
## Recommendations

Based on the coverage analysis, here are recommendations for improving test coverage:

1. Focus on packages with lower coverage percentages
2. Add more tests for core business logic components
3. Expand E2E test scenarios to cover more user workflows
4. Enhance security test coverage, especially for authentication and authorization flows
5. Add performance benchmarks for critical operations

## Next Steps

1. Address coverage gaps identified in this report
2. Implement continuous coverage monitoring in CI/CD pipeline
3. Establish minimum coverage thresholds for new code
4. Regular coverage reviews during sprint retrospectives

"""
    
    return report

def main():
    """Main function to generate coverage report."""
    print("Collecting test information...")
    test_info = collect_test_information()
    
    print("Running pytest with coverage...")
    coverage_data = run_pytest_coverage()
    
    print("Generating test summary...")
    summary = generate_test_summary(test_info, coverage_data)
    
    print("Generating coverage report...")
    report = generate_coverage_report(summary)
    
    # Save report to file
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    report_path = os.path.join(REPORT_OUTPUT_DIR, f'coverage_report_{timestamp}.md')
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"Coverage report generated and saved to: {report_path}")
    
    # Also save summary as JSON for programmatic use
    summary_path = os.path.join(REPORT_OUTPUT_DIR, f'coverage_summary_{timestamp}.json')
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"Coverage summary saved to: {summary_path}")

if __name__ == "__main__":
    main()