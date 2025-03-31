"""
Performance Benchmark Adapter

This module provides a comprehensive adapter for performance benchmarking
in the TAP Integration Platform, implementing the functionality defined in
the performance_benchmark_framework.py module.
"""

import time
import os
import json
import logging
import statistics
import importlib
import platform
import sys
import gc
from datetime import datetime
from typing import Dict, List, Any, Callable, Optional, Union, Tuple
import tracemalloc

# Import framework components
from test_adapters.performance_benchmark_framework import PerformanceBenchmark

# Set up logging
logger = logging.getLogger("performance_benchmark_adapter")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class PerformanceBenchmarkAdapter:
    """
    Adapter for performance benchmarking in the TAP Integration Platform.
    
    This adapter provides a simplified interface for running performance
    benchmarks and analyzing results.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the performance benchmark adapter.
        
        Args:
            registry: Entity registry for cross-adapter communication
        """
        self.registry = registry
        self.benchmarks = {}
        self.active_profiling = {}
        self.performance_thresholds = self._load_thresholds()
        self.system_info = self._collect_system_info()
        self.results_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "benchmark_results"
        )
        
        # Create results directory if it doesn't exist
        if not os.path.exists(self.results_dir):
            os.makedirs(self.results_dir)
        
        logger.info("PerformanceBenchmarkAdapter initialized")
    
    def _load_thresholds(self) -> Dict[str, float]:
        """
        Load performance thresholds from configuration.
        
        Returns:
            Dictionary of operation names to threshold values in milliseconds
        """
        # Default thresholds
        thresholds = {
            # API operations
            "api_get_tenant": 100,
            "api_get_tenants": 200,
            "api_create_tenant": 150,
            "api_get_integration": 100,
            "api_get_integrations": 300,
            "api_create_integration": 200,
            "api_run_integration": 500,
            
            # Storage operations
            "storage_upload_small": 100,
            "storage_upload_medium": 500,
            "storage_upload_large": 2000,
            "storage_download_small": 50,
            "storage_download_medium": 300,
            "storage_download_large": 1500,
            "storage_batch_upload": 1000,
            "storage_batch_download": 800,
            
            # Transformation operations
            "transform_small": 50,
            "transform_medium": 500,
            "transform_large": 2000,
            
            # Authentication operations
            "auth_login": 200,
            "auth_token_validation": 20,
            "auth_mfa_validation": 100,
            
            # Database operations
            "db_query_simple": 50,
            "db_query_complex": 300,
            "db_insert": 100,
            "db_update": 100,
            "db_transaction": 200
        }
        
        # Try to load thresholds from configuration file
        threshold_path = os.path.join(self.results_dir, "performance_thresholds.json")
        if os.path.exists(threshold_path):
            try:
                with open(threshold_path, 'r') as f:
                    loaded_thresholds = json.load(f)
                    thresholds.update(loaded_thresholds)
                logger.info(f"Loaded performance thresholds from {threshold_path}")
            except Exception as e:
                logger.warning(f"Failed to load performance thresholds: {e}")
        
        return thresholds
    
    def _collect_system_info(self) -> Dict[str, Any]:
        """
        Collect system information for benchmark context.
        
        Returns:
            Dictionary of system information
        """
        info = {
            "platform": platform.platform(),
            "python_version": sys.version,
            "cpu_count": os.cpu_count(),
            "timestamp": datetime.now().isoformat()
        }
        
        # Try to get more detailed system info
        try:
            import psutil
            memory = psutil.virtual_memory()
            info["memory_total"] = memory.total
            info["memory_available"] = memory.available
        except ImportError:
            logger.warning("psutil not available, detailed system info will be limited")
        
        return info
    
    def create_benchmark(self, name: str) -> str:
        """
        Create a new benchmark suite.
        
        Args:
            name: Name of the benchmark suite
            
        Returns:
            Benchmark ID
        """
        benchmark_id = f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.benchmarks[benchmark_id] = PerformanceBenchmark(benchmark_id)
        
        logger.info(f"Created benchmark suite: {benchmark_id}")
        return benchmark_id
    
    def start_profiling(self, name: str, track_memory: bool = False) -> str:
        """
        Start profiling a code block.
        
        Args:
            name: Name of the profiling session
            track_memory: Whether to track memory usage
            
        Returns:
            Profiling session ID
        """
        profile_id = f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        # Start memory tracking if requested
        if track_memory:
            tracemalloc.start()
        
        # Record starting info
        self.active_profiling[profile_id] = {
            "name": name,
            "start_time": time.time(),
            "track_memory": track_memory,
            "start_memory": tracemalloc.get_traced_memory()[0] if track_memory else None
        }
        
        logger.debug(f"Started profiling: {profile_id}")
        return profile_id
    
    def stop_profiling(self, profile_id: str) -> Dict[str, Any]:
        """
        Stop profiling and get results.
        
        Args:
            profile_id: Profiling session ID
            
        Returns:
            Dictionary with profiling results
        """
        if profile_id not in self.active_profiling:
            logger.warning(f"Unknown profile ID: {profile_id}")
            return {"error": "Unknown profile ID"}
        
        profile_data = self.active_profiling[profile_id]
        end_time = time.time()
        duration = end_time - profile_data["start_time"]
        
        results = {
            "name": profile_data["name"],
            "duration": duration,
            "start_time": profile_data["start_time"],
            "end_time": end_time
        }
        
        # Get memory usage if tracking was enabled
        if profile_data["track_memory"]:
            current, peak = tracemalloc.get_traced_memory()
            results["current_memory"] = current
            results["peak_memory"] = peak
            results["memory_increase"] = current - profile_data["start_memory"]
            results["max_memory_increase"] = peak - profile_data["start_memory"]
            
            # Stop memory tracking
            tracemalloc.stop()
        
        # Clean up
        del self.active_profiling[profile_id]
        
        logger.debug(
            f"Profiling complete: {profile_data['name']} - "
            f"Duration: {duration:.3f}s"
        )
        
        return results
    
    def record_benchmark(self, operation: str, duration: float, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Record a benchmark measurement.
        
        Args:
            operation: Name of the operation
            duration: Duration in seconds
            metadata: Additional metadata about the operation
            
        Returns:
            Dictionary with benchmark results and analysis
        """
        # Convert to milliseconds for consistency
        duration_ms = duration * 1000
        
        # Get threshold if available
        threshold_ms = self.performance_thresholds.get(operation)
        
        # Create result
        result = {
            "operation": operation,
            "duration_ms": duration_ms,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        # Add threshold information if available
        if threshold_ms is not None:
            result["threshold_ms"] = threshold_ms
            result["within_threshold"] = duration_ms <= threshold_ms
            result["threshold_percentage"] = (duration_ms / threshold_ms) * 100
        
        # Save to benchmark results file
        self._save_benchmark_result(result)
        
        # Log result
        if threshold_ms is not None:
            if duration_ms <= threshold_ms:
                logger.info(
                    f"Benchmark '{operation}': {duration_ms:.2f}ms "
                    f"(within threshold of {threshold_ms:.2f}ms)"
                )
            else:
                logger.warning(
                    f"Benchmark '{operation}': {duration_ms:.2f}ms "
                    f"exceeds threshold of {threshold_ms:.2f}ms "
                    f"by {duration_ms - threshold_ms:.2f}ms"
                )
        else:
            logger.info(f"Benchmark '{operation}': {duration_ms:.2f}ms (no threshold defined)")
        
        return result
    
    def _save_benchmark_result(self, result: Dict[str, Any]):
        """
        Save a benchmark result to file.
        
        Args:
            result: Benchmark result to save
        """
        # Create a timestamped file name
        operation = result["operation"]
        timestamp = datetime.now().strftime('%Y%m%d')
        result_file = os.path.join(self.results_dir, f"benchmark_{operation}_{timestamp}.jsonl")
        
        # Append to file
        try:
            with open(result_file, 'a') as f:
                f.write(json.dumps(result) + '\n')
        except Exception as e:
            logger.error(f"Failed to save benchmark result: {e}")
    
    def measure_operation(self, operation: str, func: Callable, *args, 
                        iterations: int = 3, warmup: int = 1, 
                        metadata: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """
        Measure the performance of an operation.
        
        Args:
            operation: Name of the operation
            func: Function to measure
            *args: Arguments to pass to the function
            iterations: Number of iterations to run
            warmup: Number of warmup iterations
            metadata: Additional metadata about the operation
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Dictionary with benchmark results
        """
        # Run warmup iterations
        for _ in range(warmup):
            func(*args, **kwargs)
        
        # Run timed iterations
        durations = []
        for i in range(iterations):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            duration = end_time - start_time
            durations.append(duration)
        
        # Calculate statistics
        mean_duration = statistics.mean(durations)
        
        # Record benchmark
        metadata = metadata or {}
        metadata.update({
            "iterations": iterations,
            "min_duration": min(durations),
            "max_duration": max(durations),
            "median_duration": statistics.median(durations),
            "stdev_duration": statistics.stdev(durations) if len(durations) > 1 else 0
        })
        
        benchmark_result = self.record_benchmark(operation, mean_duration, metadata)
        benchmark_result["result"] = result
        
        return benchmark_result
    
    def run_standard_benchmarks(self) -> Dict[str, Dict[str, Any]]:
        """
        Run a standard set of performance benchmarks.
        
        Returns:
            Dictionary mapping benchmark names to results
        """
        results = {}
        
        # Define standard benchmark setup
        standard_benchmarks = {
            "storage_operations": self._run_storage_benchmarks,
            "transformation_operations": self._run_transformation_benchmarks,
            "api_operations": self._run_api_benchmarks,
            "database_operations": self._run_database_benchmarks
        }
        
        # Run each standard benchmark
        for name, benchmark_func in standard_benchmarks.items():
            logger.info(f"Running standard benchmark: {name}")
            benchmark_results = benchmark_func()
            results[name] = benchmark_results
        
        # Generate and save report
        self._generate_benchmark_report(results)
        
        return results
    
    def _run_storage_benchmarks(self) -> Dict[str, Any]:
        """
        Run storage operation benchmarks.
        
        Returns:
            Dictionary with benchmark results
        """
        # This would be implemented to test various storage operations
        # such as upload, download, list, delete across different connectors
        # and with different file sizes
        
        logger.info("Storage benchmark implementation would go here")
        return {"status": "not_implemented"}
    
    def _run_transformation_benchmarks(self) -> Dict[str, Any]:
        """
        Run data transformation benchmarks.
        
        Returns:
            Dictionary with benchmark results
        """
        # This would be implemented to test various data transformation
        # operations with different data sizes and transformation types
        
        logger.info("Transformation benchmark implementation would go here")
        return {"status": "not_implemented"}
    
    def _run_api_benchmarks(self) -> Dict[str, Any]:
        """
        Run API endpoint benchmarks.
        
        Returns:
            Dictionary with benchmark results
        """
        # This would be implemented to test various API endpoints
        # for performance and response time
        
        logger.info("API benchmark implementation would go here")
        return {"status": "not_implemented"}
    
    def _run_database_benchmarks(self) -> Dict[str, Any]:
        """
        Run database operation benchmarks.
        
        Returns:
            Dictionary with benchmark results
        """
        # This would be implemented to test various database operations
        # such as queries, inserts, updates, transactions
        
        logger.info("Database benchmark implementation would go here")
        return {"status": "not_implemented"}
    
    def _generate_benchmark_report(self, results: Dict[str, Dict[str, Any]]) -> str:
        """
        Generate a comprehensive benchmark report.
        
        Args:
            results: Dictionary of benchmark results
            
        Returns:
            String containing the benchmark report
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = os.path.join(self.results_dir, f"benchmark_report_{timestamp}.md")
        
        # Generate report content
        report_lines = [
            "# TAP Integration Platform Performance Benchmark Report",
            f"Generated: {datetime.now().isoformat()}",
            "",
            "## System Information",
            f"- Platform: {self.system_info['platform']}",
            f"- Python Version: {self.system_info['python_version']}",
            f"- CPU Count: {self.system_info['cpu_count']}",
        ]
        
        if "memory_total" in self.system_info:
            memory_gb = self.system_info["memory_total"] / (1024 * 1024 * 1024)
            report_lines.append(f"- Memory: {memory_gb:.2f} GB")
        
        report_lines.extend([
            "",
            "## Benchmark Results",
            ""
        ])
        
        # Add results sections
        for category, category_results in results.items():
            report_lines.extend([
                f"### {category.replace('_', ' ').title()}",
                ""
            ])
            
            if category_results.get("status") == "not_implemented":
                report_lines.append("This benchmark is not yet implemented.")
            else:
                # Format category-specific results
                report_lines.extend(self._format_category_results(category, category_results))
            
            report_lines.append("")
        
        # Add conclusion
        report_lines.extend([
            "## Conclusion",
            "",
            "This report provides a baseline for performance monitoring and optimization efforts.",
            "Regular benchmark testing should be conducted to track performance changes over time.",
            "",
            "### Recommendations",
            "",
            "1. Address any operations that exceed their performance thresholds",
            "2. Consider optimizing the slowest operations identified in this report",
            "3. Continue to monitor performance as new features are added to the platform",
            ""
        ])
        
        # Write report to file
        report_content = "\n".join(report_lines)
        try:
            with open(report_path, 'w') as f:
                f.write(report_content)
            logger.info(f"Benchmark report saved to {report_path}")
        except Exception as e:
            logger.error(f"Failed to save benchmark report: {e}")
        
        return report_content
    
    def _format_category_results(self, category: str, results: Dict[str, Any]) -> List[str]:
        """
        Format category-specific benchmark results for the report.
        
        Args:
            category: Benchmark category
            results: Category results
            
        Returns:
            List of formatted report lines
        """
        # This would be implemented to format category-specific results
        # For now, we'll just return a placeholder
        return ["Detailed results would be shown here in a complete implementation."]
    
    def analyze_performance_trends(self, operation: str, days: int = 30) -> Dict[str, Any]:
        """
        Analyze performance trends for an operation over time.
        
        Args:
            operation: Name of the operation
            days: Number of days to analyze
            
        Returns:
            Dictionary with trend analysis
        """
        # Get relevant benchmark files
        benchmark_files = []
        for filename in os.listdir(self.results_dir):
            if filename.startswith(f"benchmark_{operation}_") and filename.endswith(".jsonl"):
                benchmark_files.append(os.path.join(self.results_dir, filename))
        
        # Sort by timestamp
        benchmark_files.sort()
        
        # Load benchmark data
        all_benchmarks = []
        for file_path in benchmark_files:
            try:
                with open(file_path, 'r') as f:
                    for line in f:
                        benchmark = json.loads(line.strip())
                        all_benchmarks.append(benchmark)
            except Exception as e:
                logger.error(f"Error loading benchmark file {file_path}: {e}")
        
        # Sort benchmarks by timestamp
        all_benchmarks.sort(key=lambda b: b["timestamp"])
        
        # Calculate trends
        if len(all_benchmarks) < 2:
            return {
                "operation": operation,
                "status": "insufficient_data",
                "message": "Need at least 2 data points for trend analysis"
            }
        
        # Calculate basic statistics
        durations = [b["duration_ms"] for b in all_benchmarks]
        latest_duration = durations[-1]
        earliest_duration = durations[0]
        mean_duration = statistics.mean(durations)
        
        # Calculate trend
        trend_percentage = ((latest_duration - earliest_duration) / earliest_duration) * 100
        
        # Determine status
        if trend_percentage > 10:
            trend_status = "degrading"
        elif trend_percentage < -10:
            trend_status = "improving"
        else:
            trend_status = "stable"
        
        # Create result
        result = {
            "operation": operation,
            "trend_percentage": trend_percentage,
            "trend_status": trend_status,
            "data_points": len(all_benchmarks),
            "earliest_duration_ms": earliest_duration,
            "latest_duration_ms": latest_duration,
            "mean_duration_ms": mean_duration,
            "min_duration_ms": min(durations),
            "max_duration_ms": max(durations)
        }
        
        # Add threshold information if available
        threshold_ms = self.performance_thresholds.get(operation)
        if threshold_ms is not None:
            result["threshold_ms"] = threshold_ms
            result["current_vs_threshold_percentage"] = (latest_duration / threshold_ms) * 100
        
        logger.info(
            f"Performance trend for '{operation}': {trend_status} "
            f"({trend_percentage:.2f}%), latest: {latest_duration:.2f}ms"
        )
        
        return result
    
    def reset(self):
        """Reset the adapter state."""
        self.benchmarks = {}
        self.active_profiling = {}
        logger.info("PerformanceBenchmarkAdapter reset")