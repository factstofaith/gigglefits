"""
Database Index Analyzer

This module provides utilities for analyzing database indexes and recommending
optimizations based on query patterns.
"""

import os
import json
import datetime
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
import logging
import sqlalchemy as sa
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine, Connection
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IndexAnalyzer:
    """
    Analyze database indexes and recommend optimizations.
    
    This class provides methods for analyzing database indexes and recommending
    optimizations based on query patterns.
    """
    
    def __init__(self, engine: Engine):
        """
        Initialize the IndexAnalyzer.
        
        Args:
            engine: SQLAlchemy engine connected to the database
        """
        self.engine = engine
        self.inspector = inspect(engine)
        self.optimization_log_dir = os.path.join(
            "logs", "backend", "db-optimization"
        )
        
        # Create log directory if it doesn't exist
        os.makedirs(self.optimization_log_dir, exist_ok=True)
    
    def analyze_table(self, table_name: str) -> Dict[str, Any]:
        """
        Analyze indexes for a specific table.
        
        Args:
            table_name: Name of the table to analyze
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Get table columns
            columns = self.inspector.get_columns(table_name)
            column_names = [col["name"] for col in columns]
            
            # Get primary key
            pk = self.inspector.get_pk_constraint(table_name)
            pk_cols = pk.get("constrained_columns", [])
            
            # Get existing indexes
            indexes = self.inspector.get_indexes(table_name)
            
            # Get foreign keys
            foreign_keys = self.inspector.get_foreign_keys(table_name)
            fk_cols = [fk["constrained_columns"][0] for fk in foreign_keys]
            
            # Collect data about the table
            table_stats = self._get_table_stats(table_name)
            
            # Analyze existing indexes
            index_analysis = self._analyze_indexes(
                table_name, indexes, pk_cols, fk_cols, table_stats
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                table_name, indexes, pk_cols, fk_cols, column_names, table_stats
            )
            
            # Record analysis timestamp
            timestamp = datetime.datetime.utcnow().isoformat()
            
            return {
                "table_name": table_name,
                "analyzed_at": timestamp,
                "columns": columns,
                "primary_key": pk_cols,
                "foreign_keys": fk_cols,
                "existing_indexes": indexes,
                "table_stats": table_stats,
                "index_analysis": index_analysis,
                "recommendations": recommendations,
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Error analyzing table {table_name}: {e}")
            return {
                "table_name": table_name,
                "error": str(e),
                "analyzed_at": datetime.datetime.utcnow().isoformat(),
            }
    
    def analyze_database(self) -> Dict[str, Any]:
        """
        Analyze indexes for all tables in the database.
        
        Returns:
            Dictionary with analysis results for all tables
        """
        # Get all table names
        table_names = self.inspector.get_table_names()
        
        # Analyze each table
        results = {}
        for table_name in table_names:
            results[table_name] = self.analyze_table(table_name)
        
        # Generate database-wide recommendations
        database_recommendations = self._generate_database_recommendations(results)
        
        # Create summary report
        timestamp = datetime.datetime.utcnow()
        timestamp_str = timestamp.isoformat()
        formatted_timestamp = timestamp.strftime("%Y-%m-%dT%H-%M-%S")
        
        report = {
            "analyzed_at": timestamp_str,
            "database": self.engine.url.database,
            "table_count": len(table_names),
            "tables": results,
            "database_recommendations": database_recommendations,
        }
        
        # Save report to file
        report_file = os.path.join(
            self.optimization_log_dir, f"db-optimization-data-{formatted_timestamp}.json"
        )
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        # Generate markdown report
        markdown_report = self._generate_markdown_report(report)
        markdown_file = os.path.join(
            self.optimization_log_dir, f"db-optimization-report-{formatted_timestamp}.md"
        )
        with open(markdown_file, "w") as f:
            f.write(markdown_report)
        
        # Generate SQL script for recommended changes
        sql_script = self._generate_sql_script(report)
        sql_file = os.path.join(
            self.optimization_log_dir, f"db-optimization-script-{formatted_timestamp}.sql"
        )
        with open(sql_file, "w") as f:
            f.write(sql_script)
        
        # Generate task list for recommended changes
        task_list = self._generate_task_list(report)
        task_file = os.path.join(
            self.optimization_log_dir, f"db-optimization-tasks-{formatted_timestamp}.md"
        )
        with open(task_file, "w") as f:
            f.write(task_list)
        
        logger.info(f"Analysis complete. Reports saved to {self.optimization_log_dir}")
        
        return report
    
    def _get_table_stats(self, table_name: str) -> Dict[str, Any]:
        """
        Get statistics for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Dictionary with table statistics
        """
        with self.engine.connect() as conn:
            # Get row count
            row_count_result = conn.execute(
                text(f"SELECT COUNT(*) FROM {table_name}")
            ).scalar()
            row_count = row_count_result or 0
            
            # Get storage size (PostgreSQL specific)
            try:
                size_result = conn.execute(
                    text(
                        f"""
                        SELECT pg_size_pretty(pg_total_relation_size('{table_name}')) as size,
                               pg_total_relation_size('{table_name}') as bytes
                        """
                    )
                ).fetchone()
                size = size_result[0] if size_result else "Unknown"
                size_bytes = size_result[1] if size_result else 0
            except:
                # Not PostgreSQL or cannot determine size
                size = "Unknown"
                size_bytes = 0
            
            return {
                "row_count": row_count,
                "size": size,
                "size_bytes": size_bytes,
            }
    
    def _analyze_indexes(
        self,
        table_name: str,
        indexes: List[Dict[str, Any]],
        pk_cols: List[str],
        fk_cols: List[str],
        table_stats: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Analyze existing indexes.
        
        Args:
            table_name: Name of the table
            indexes: List of existing indexes
            pk_cols: List of primary key columns
            fk_cols: List of foreign key columns
            table_stats: Dictionary with table statistics
            
        Returns:
            Dictionary with index analysis
        """
        # Check if primary key is indexed
        pk_indexed = any(
            set(pk_cols).issubset(set(idx["column_names"])) for idx in indexes
        )
        
        # Check if foreign keys are indexed
        fk_indexed = {}
        for fk in fk_cols:
            fk_indexed[fk] = any(
                fk in idx["column_names"] for idx in indexes
            )
        
        # Check for duplicate or overlapping indexes
        duplicates = []
        overlapping = []
        
        for i, idx1 in enumerate(indexes):
            for j, idx2 in enumerate(indexes):
                if i >= j:
                    continue
                
                # Check for duplicates (same columns)
                if set(idx1["column_names"]) == set(idx2["column_names"]):
                    duplicates.append((idx1["name"], idx2["name"]))
                
                # Check for overlapping (one index's columns are a subset of another's)
                elif set(idx1["column_names"]).issubset(set(idx2["column_names"])):
                    overlapping.append((idx1["name"], idx2["name"]))
                elif set(idx2["column_names"]).issubset(set(idx1["column_names"])):
                    overlapping.append((idx2["name"], idx1["name"]))
        
        # Check index coverage (are all foreign keys indexed?)
        missing_fk_indexes = [fk for fk, indexed in fk_indexed.items() if not indexed]
        
        return {
            "pk_indexed": pk_indexed,
            "fk_indexed": fk_indexed,
            "duplicate_indexes": duplicates,
            "overlapping_indexes": overlapping,
            "missing_fk_indexes": missing_fk_indexes,
            "index_count": len(indexes),
        }
    
    def _generate_recommendations(
        self,
        table_name: str,
        indexes: List[Dict[str, Any]],
        pk_cols: List[str],
        fk_cols: List[str],
        column_names: List[str],
        table_stats: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Generate recommendations for a table.
        
        Args:
            table_name: Name of the table
            indexes: List of existing indexes
            pk_cols: List of primary key columns
            fk_cols: List of foreign key columns
            column_names: List of column names
            table_stats: Dictionary with table statistics
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Check if table is large enough to benefit from indexing
        # (skip recommendations for very small tables)
        if table_stats["row_count"] < 1000:
            recommendations.append({
                "type": "info",
                "message": f"Table {table_name} is small ({table_stats['row_count']} rows), indexing may not be necessary",
                "priority": "low",
            })
            return recommendations
        
        # Recommend indexes for foreign keys that aren't indexed
        for fk in fk_cols:
            if not any(fk in idx["column_names"] for idx in indexes):
                recommendations.append({
                    "type": "create_index",
                    "message": f"Create index on foreign key column {fk}",
                    "columns": [fk],
                    "priority": "high",
                    "reason": "Foreign keys should be indexed to improve JOIN performance",
                })
        
        # Recommend removing duplicate indexes
        index_columns = defaultdict(list)
        for idx in indexes:
            key = tuple(sorted(idx["column_names"]))
            index_columns[key].append(idx["name"])
        
        for cols, idx_names in index_columns.items():
            if len(idx_names) > 1:
                recommendations.append({
                    "type": "remove_duplicate",
                    "message": f"Remove duplicate indexes: {', '.join(idx_names[1:])}",
                    "columns": list(cols),
                    "keep_index": idx_names[0],
                    "remove_indexes": idx_names[1:],
                    "priority": "high",
                    "reason": "Duplicate indexes waste space and slow down writes",
                })
        
        # Recommend consolidating overlapping indexes
        # This is a more complex recommendation that requires careful consideration
        overlapping_sets = []
        for i, idx1 in enumerate(indexes):
            for j, idx2 in enumerate(indexes):
                if i >= j:
                    continue
                
                if set(idx1["column_names"]).issubset(set(idx2["column_names"])):
                    overlapping_sets.append((idx1["name"], idx2["name"], idx2["column_names"]))
                elif set(idx2["column_names"]).issubset(set(idx1["column_names"])):
                    overlapping_sets.append((idx2["name"], idx1["name"], idx1["column_names"]))
        
        for subset_idx, superset_idx, columns in overlapping_sets:
            recommendations.append({
                "type": "consolidate_index",
                "message": f"Consider removing {subset_idx} as it's covered by {superset_idx}",
                "subset_index": subset_idx,
                "superset_index": superset_idx,
                "columns": columns,
                "priority": "medium",
                "reason": "Overlapping indexes waste space and slow down writes",
            })
        
        # Look for timestamp columns that might benefit from indexing
        timestamp_columns = [
            col for col in column_names 
            if "date" in col.lower() or "time" in col.lower() or "created" in col.lower() or "updated" in col.lower()
        ]
        
        for col in timestamp_columns:
            if not any(col in idx["column_names"] for idx in indexes):
                # Only recommend for tables that are queried by timestamp
                if col in ["created_at", "updated_at", "timestamp"]:
                    recommendations.append({
                        "type": "create_index",
                        "message": f"Consider adding index on timestamp column {col}",
                        "columns": [col],
                        "priority": "medium",
                        "reason": "Timestamp columns are often used in queries and sorting",
                    })
        
        return recommendations
    
    def _generate_database_recommendations(
        self, table_results: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate database-wide recommendations.
        
        Args:
            table_results: Dictionary with analysis results for all tables
            
        Returns:
            List of database-wide recommendations
        """
        recommendations = []
        
        # Count tables with missing foreign key indexes
        tables_with_missing_fk = [
            table_name
            for table_name, result in table_results.items()
            if "index_analysis" in result
            and result["index_analysis"].get("missing_fk_indexes", [])
        ]
        
        if tables_with_missing_fk:
            recommendations.append({
                "type": "database",
                "message": f"{len(tables_with_missing_fk)} tables have missing foreign key indexes",
                "tables": tables_with_missing_fk,
                "priority": "high",
                "reason": "Foreign keys should be indexed to improve JOIN performance",
            })
        
        # Count tables with duplicate indexes
        tables_with_duplicates = [
            table_name
            for table_name, result in table_results.items()
            if "index_analysis" in result
            and result["index_analysis"].get("duplicate_indexes", [])
        ]
        
        if tables_with_duplicates:
            recommendations.append({
                "type": "database",
                "message": f"{len(tables_with_duplicates)} tables have duplicate indexes",
                "tables": tables_with_duplicates,
                "priority": "high",
                "reason": "Duplicate indexes waste space and slow down writes",
            })
        
        # Check for very large tables that might need special attention
        large_tables = [
            table_name
            for table_name, result in table_results.items()
            if "table_stats" in result
            and result["table_stats"].get("row_count", 0) > 1000000
        ]
        
        if large_tables:
            recommendations.append({
                "type": "database",
                "message": f"{len(large_tables)} tables have over 1 million rows",
                "tables": large_tables,
                "priority": "medium",
                "reason": "Large tables may need special optimization strategies like partitioning",
            })
        
        return recommendations
    
    def _generate_markdown_report(self, report: Dict[str, Any]) -> str:
        """
        Generate a Markdown report from the analysis.
        
        Args:
            report: Dictionary with analysis results
            
        Returns:
            Markdown report string
        """
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        md = f"# Database Optimization Report\n\n"
        md += f"Generated on: {now}\n\n"
        md += f"Database: {report['database']}\n\n"
        
        md += "## Summary\n\n"
        md += f"- Analyzed {report['table_count']} tables\n"
        
        # Database recommendations
        if report['database_recommendations']:
            md += "\n## Database-Wide Recommendations\n\n"
            
            for rec in report['database_recommendations']:
                priority_marker = "🔴" if rec['priority'] == "high" else "🟠" if rec['priority'] == "medium" else "🟢"
                md += f"- {priority_marker} **{rec['message']}** ({rec['priority']} priority)\n"
                md += f"  - Reason: {rec['reason']}\n"
                
                if 'tables' in rec:
                    md += "  - Affected tables:\n"
                    for table in rec['tables'][:5]:  # Limit to 5 tables in report
                        md += f"    - {table}\n"
                    
                    if len(rec['tables']) > 5:
                        md += f"    - ... and {len(rec['tables']) - 5} more\n"
        
        # Table with high-priority recommendations
        high_priority_tables = {}
        for table_name, table_data in report['tables'].items():
            if 'recommendations' in table_data:
                high_priority_recs = [
                    rec for rec in table_data['recommendations']
                    if rec['priority'] == 'high'
                ]
                
                if high_priority_recs:
                    high_priority_tables[table_name] = len(high_priority_recs)
        
        if high_priority_tables:
            md += "\n## High Priority Tables\n\n"
            md += "| Table | Recommendations |\n"
            md += "|-------|----------------|\n"
            
            for table, count in sorted(high_priority_tables.items(), key=lambda x: x[1], reverse=True):
                md += f"| {table} | {count} |\n"
        
        # Detailed recommendations for top 10 tables with most recommendations
        tables_with_recs = {
            table_name: len(table_data.get('recommendations', []))
            for table_name, table_data in report['tables'].items()
            if 'recommendations' in table_data and table_data['recommendations']
        }
        
        top_tables = sorted(tables_with_recs.items(), key=lambda x: x[1], reverse=True)[:10]
        
        if top_tables:
            md += "\n## Detailed Recommendations\n\n"
            
            for table_name, _ in top_tables:
                table_data = report['tables'][table_name]
                
                md += f"### Table: {table_name}\n\n"
                
                # Table stats
                if 'table_stats' in table_data:
                    stats = table_data['table_stats']
                    md += f"- Rows: {stats['row_count']:,}\n"
                    md += f"- Size: {stats['size']}\n"
                
                # Existing indexes
                if 'existing_indexes' in table_data:
                    md += f"- Existing indexes: {len(table_data['existing_indexes'])}\n"
                
                # Recommendations
                if 'recommendations' in table_data and table_data['recommendations']:
                    md += "\n**Recommendations:**\n\n"
                    
                    for rec in table_data['recommendations']:
                        priority_marker = "🔴" if rec['priority'] == "high" else "🟠" if rec['priority'] == "medium" else "🟢"
                        md += f"- {priority_marker} **{rec['message']}** ({rec['priority']} priority)\n"
                        md += f"  - Reason: {rec['reason']}\n"
                        
                        if 'columns' in rec:
                            md += f"  - Columns: {', '.join(rec['columns'])}\n"
                
                md += "\n"
        
        # Implementation instructions
        md += "## Implementation Instructions\n\n"
        md += "To implement these recommendations:\n\n"
        md += "1. Review the SQL script in the accompanying file\n"
        md += "2. Test changes in a development environment first\n"
        md += "3. Monitor performance before and after changes\n"
        md += "4. Implement during low-traffic periods\n"
        md += "5. Follow the task list in the accompanying file\n\n"
        
        md += "## Next Steps\n\n"
        md += "1. Review these recommendations with the database administrator\n"
        md += "2. Prioritize changes based on application performance needs\n"
        md += "3. Schedule implementation for appropriate maintenance window\n"
        md += "4. After implementation, run this analysis again to verify improvements\n"
        
        return md
    
    def _generate_sql_script(self, report: Dict[str, Any]) -> str:
        """
        Generate SQL script for recommended changes.
        
        Args:
            report: Dictionary with analysis results
            
        Returns:
            SQL script string
        """
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        sql = f"-- Database Optimization Script\n"
        sql += f"-- Generated on: {now}\n"
        sql += f"-- Database: {report['database']}\n\n"
        sql += "-- IMPORTANT: Review and test this script before running in production\n\n"
        
        # Add SQL for each recommendation
        for table_name, table_data in report['tables'].items():
            if 'recommendations' not in table_data or not table_data['recommendations']:
                continue
            
            sql += f"-- ======== Table: {table_name} ========\n\n"
            
            for rec in table_data['recommendations']:
                if rec['type'] == 'create_index':
                    index_name = f"idx_{table_name}_{'_'.join(rec['columns'])}"
                    columns = ', '.join(rec['columns'])
                    
                    sql += f"-- {rec['message']} ({rec['priority']} priority)\n"
                    sql += f"-- Reason: {rec['reason']}\n"
                    sql += f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name} ({columns});\n\n"
                
                elif rec['type'] == 'remove_duplicate':
                    sql += f"-- {rec['message']} ({rec['priority']} priority)\n"
                    sql += f"-- Reason: {rec['reason']}\n"
                    
                    for idx_name in rec['remove_indexes']:
                        sql += f"DROP INDEX IF EXISTS {idx_name};\n"
                    
                    sql += "\n"
                
                elif rec['type'] == 'consolidate_index':
                    sql += f"-- {rec['message']} ({rec['priority']} priority)\n"
                    sql += f"-- Reason: {rec['reason']}\n"
                    sql += f"-- Review before executing:\n"
                    sql += f"-- DROP INDEX IF EXISTS {rec['subset_index']};\n\n"
        
        return sql
    
    def _generate_task_list(self, report: Dict[str, Any]) -> str:
        """
        Generate a task list for recommended changes.
        
        Args:
            report: Dictionary with analysis results
            
        Returns:
            Markdown task list string
        """
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        md = f"# Database Optimization Tasks\n\n"
        md += f"Generated on: {now}\n\n"
        
        # Add high priority tasks first
        high_priority_tasks = []
        medium_priority_tasks = []
        low_priority_tasks = []
        
        for table_name, table_data in report['tables'].items():
            if 'recommendations' not in table_data or not table_data['recommendations']:
                continue
            
            for rec in table_data['recommendations']:
                task = f"**{table_name}**: {rec['message']}"
                
                if rec['priority'] == 'high':
                    high_priority_tasks.append(task)
                elif rec['priority'] == 'medium':
                    medium_priority_tasks.append(task)
                else:
                    low_priority_tasks.append(task)
        
        if high_priority_tasks:
            md += "## High Priority Tasks\n\n"
            for i, task in enumerate(high_priority_tasks, 1):
                md += f"{i}. [ ] {task}\n"
            md += "\n"
        
        if medium_priority_tasks:
            md += "## Medium Priority Tasks\n\n"
            for i, task in enumerate(medium_priority_tasks, 1):
                md += f"{i}. [ ] {task}\n"
            md += "\n"
        
        if low_priority_tasks:
            md += "## Low Priority Tasks\n\n"
            for i, task in enumerate(low_priority_tasks, 1):
                md += f"{i}. [ ] {task}\n"
            md += "\n"
        
        # Add implementation checklist
        md += "## Implementation Checklist\n\n"
        md += "For each task:\n\n"
        md += "- [ ] Review the recommendation\n"
        md += "- [ ] Test in development environment\n"
        md += "- [ ] Verify no negative impact on queries\n"
        md += "- [ ] Schedule production implementation\n"
        md += "- [ ] Implement in production\n"
        md += "- [ ] Verify performance improvement\n"
        md += "- [ ] Update documentation\n"
        
        return md


def analyze_database_indexes(engine: Engine) -> None:
    """
    Analyze database indexes and generate optimization reports.
    
    Args:
        engine: SQLAlchemy engine connected to the database
    """
    analyzer = IndexAnalyzer(engine)
    report = analyzer.analyze_database()
    
    logger.info(f"Database analysis complete. Analyzed {len(report['tables'])} tables.")
    
    # Log high priority recommendations
    high_priority_count = 0
    for table_data in report['tables'].values():
        if 'recommendations' in table_data:
            high_priority_count += sum(
                1 for rec in table_data['recommendations']
                if rec['priority'] == 'high'
            )
    
    logger.info(f"Found {high_priority_count} high priority recommendations.")
    logger.info(f"Reports saved to {analyzer.optimization_log_dir}")


# Command-line interface
if __name__ == "__main__":
    from sqlalchemy import create_engine
    import argparse
    
    parser = argparse.ArgumentParser(description="Analyze database indexes")
    parser.add_argument(
        "--url", 
        required=True,
        help="Database URL (e.g., postgresql://user:pass@localhost/dbname)"
    )
    args = parser.parse_args()
    
    # Create engine
    engine = create_engine(args.url)
    
    # Run analysis
    analyze_database_indexes(engine)