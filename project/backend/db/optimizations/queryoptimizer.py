"""
QueryOptimizer

Query optimization utilities with execution plan analysis and profiling
"""
import logging
import time
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from datetime import datetime
import re
from sqlalchemy import create_engine, text, inspect, Table, Column, MetaData
from sqlalchemy.engine import Engine, Connection
from sqlalchemy.orm import Session
from sqlalchemy.sql import select, explain
from sqlalchemy.exc import SQLAlchemyError

# Configure logging
logger = logging.getLogger(__name__)

class QueryOptimizer:
    """
    Query optimization utilities with execution plan analysis and profiling
    
    Features:
    - Query execution plan analysis
    - Performance bottleneck detection
    - Index recommendation
    - Query rewriting suggestions
    - Query caching support
    """
    
    def __init__(self, engine: Engine, config: Dict[str, Any] = None):
        """
        Initialize the query optimizer.
        
        Args:
            engine: SQLAlchemy engine
            config: Optional configuration dictionary
        """
        self.engine = engine
        self.config = config or {}
        self.dialect = engine.dialect.name
        self.query_cache = {}
        self.query_stats = {}
        self.metadata = MetaData()
        self.inspector = inspect(engine)
        self.last_error = None
        
        # Default settings
        self.cache_enabled = self.config.get('cache_enabled', True)
        self.cache_ttl = self.config.get('cache_ttl', 300)  # 5 minutes
        self.query_timeout = self.config.get('query_timeout', 30)  # 30 seconds
        
        # Reflection settings
        self.auto_reflect = self.config.get('auto_reflect', True)
        
        # Initialize table metadata
        if self.auto_reflect:
            self.reflect_metadata()
    
    def reflect_metadata(self):
        """Reflect all tables from the database"""
        try:
            self.metadata.reflect(bind=self.engine)
            logger.info(f"Successfully reflected {len(self.metadata.tables)} tables")
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to reflect database metadata: {str(e)}")
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """
        Analyze a SQL query and provide optimization recommendations.
        
        Args:
            query: SQL query string to analyze
            
        Returns:
            Analysis result with recommendations
        """
        start_time = time.time()
        
        try:
            # Get query execution plan
            execution_plan = self.get_execution_plan(query)
            
            # Analyze execution plan
            plan_analysis = self.analyze_execution_plan(execution_plan)
            
            # Identify potential indexes
            missing_indexes = self.identify_missing_indexes(query, execution_plan)
            
            # Optimize query if possible
            optimized_query = self.optimize_query(query)
            
            # Build result
            result = {
                'original_query': query,
                'optimized_query': optimized_query if optimized_query != query else None,
                'execution_plan': execution_plan,
                'analysis': plan_analysis,
                'missing_indexes': missing_indexes,
                'analysis_time': time.time() - start_time
            }
            
            # Update query stats
            self._update_query_stats(query, result)
            
            return result
            
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to analyze query: {str(e)}")
            return {
                'original_query': query,
                'error': str(e),
                'analysis_time': time.time() - start_time
            }
    
    def get_execution_plan(self, query: str) -> List[Dict[str, Any]]:
        """
        Get the execution plan for a SQL query.
        
        Args:
            query: SQL query string
            
        Returns:
            Execution plan details
        """
        if self.dialect == 'postgresql':
            return self._get_postgres_execution_plan(query)
        elif self.dialect == 'mysql':
            return self._get_mysql_execution_plan(query)
        elif self.dialect == 'sqlite':
            return self._get_sqlite_execution_plan(query)
        else:
            logger.warning(f"Execution plan retrieval not implemented for dialect: {self.dialect}")
            return []
    
    def _get_postgres_execution_plan(self, query: str) -> List[Dict[str, Any]]:
        """Get execution plan for PostgreSQL"""
        try:
            with self.engine.connect() as conn:
                explain_results = conn.execute(text(f"EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS) {query}")).scalar()
                if isinstance(explain_results, str):
                    import json
                    explain_results = json.loads(explain_results)
                return explain_results
        except Exception as e:
            logger.error(f"Error getting PostgreSQL execution plan: {str(e)}")
            return []
    
    def _get_mysql_execution_plan(self, query: str) -> List[Dict[str, Any]]:
        """Get execution plan for MySQL"""
        try:
            with self.engine.connect() as conn:
                explain_results = conn.execute(text(f"EXPLAIN FORMAT=JSON {query}")).scalar()
                if isinstance(explain_results, str):
                    import json
                    explain_results = json.loads(explain_results)
                return explain_results
        except Exception as e:
            logger.error(f"Error getting MySQL execution plan: {str(e)}")
            return []
    
    def _get_sqlite_execution_plan(self, query: str) -> List[Dict[str, Any]]:
        """Get execution plan for SQLite"""
        try:
            with self.engine.connect() as conn:
                explain_results = conn.execute(text(f"EXPLAIN QUERY PLAN {query}")).fetchall()
                # Format SQLite results into a standardized structure
                return [dict(row) for row in explain_results]
        except Exception as e:
            logger.error(f"Error getting SQLite execution plan: {str(e)}")
            return []
    
    def analyze_execution_plan(self, plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze a query execution plan and identify bottlenecks.
        
        Args:
            plan: Query execution plan
            
        Returns:
            Analysis results with bottlenecks and recommendations
        """
        if not plan:
            return {'status': 'error', 'message': 'No execution plan provided'}
            
        # Analysis result
        analysis = {
            'status': 'success',
            'bottlenecks': [],
            'recommendations': [],
            'performance_impact': 'low'  # Default impact assessment
        }
        
        # Dialect-specific plan analysis
        if self.dialect == 'postgresql':
            self._analyze_postgres_plan(plan, analysis)
        elif self.dialect == 'mysql':
            self._analyze_mysql_plan(plan, analysis)
        elif self.dialect == 'sqlite':
            self._analyze_sqlite_plan(plan, analysis)
        else:
            analysis['status'] = 'warning'
            analysis['message'] = f"Plan analysis not implemented for dialect: {self.dialect}"
            
        return analysis
    
    def _analyze_postgres_plan(self, plan: List[Dict[str, Any]], analysis: Dict[str, Any]):
        """Analyze PostgreSQL execution plan"""
        # Extract the plan node
        if not plan or 'Plan' not in plan[0]:
            analysis['status'] = 'error'
            analysis['message'] = 'Invalid PostgreSQL execution plan format'
            return
            
        plan_node = plan[0]['Plan']
        
        # Look for sequential scans on large tables
        self._find_sequential_scans(plan_node, analysis)
        
        # Look for high-cost operations
        self._find_high_cost_operations(plan_node, analysis)
        
        # Check for missing indexes
        self._check_index_usage(plan_node, analysis)
        
        # Set performance impact based on findings
        if len(analysis['bottlenecks']) > 2:
            analysis['performance_impact'] = 'high'
        elif len(analysis['bottlenecks']) > 0:
            analysis['performance_impact'] = 'medium'
    
    def _find_sequential_scans(self, plan_node: Dict[str, Any], analysis: Dict[str, Any]):
        """Find sequential scans in the execution plan"""
        if 'Node Type' in plan_node and plan_node['Node Type'] == 'Seq Scan':
            if 'Relation Name' in plan_node and 'Total Cost' in plan_node:
                table_name = plan_node['Relation Name']
                cost = plan_node['Total Cost']
                
                # Check if table is large enough to warrant an index
                is_large = self._is_large_table(table_name)
                
                if is_large:
                    bottleneck = {
                        'type': 'sequential_scan',
                        'table': table_name,
                        'cost': cost,
                        'description': f"Sequential scan on potentially large table '{table_name}'"
                    }
                    analysis['bottlenecks'].append(bottleneck)
                    
                    # Add recommendation
                    analysis['recommendations'].append({
                        'type': 'add_index',
                        'table': table_name,
                        'description': f"Consider adding an index to table '{table_name}' to avoid sequential scans"
                    })
        
        # Recursively check child nodes
        if 'Plans' in plan_node:
            for child in plan_node['Plans']:
                self._find_sequential_scans(child, analysis)
    
    def _find_high_cost_operations(self, plan_node: Dict[str, Any], analysis: Dict[str, Any]):
        """Find high-cost operations in the execution plan"""
        if 'Total Cost' in plan_node and plan_node['Total Cost'] > 1000:
            if 'Node Type' in plan_node:
                node_type = plan_node['Node Type']
                cost = plan_node['Total Cost']
                
                bottleneck = {
                    'type': 'high_cost_operation',
                    'operation': node_type,
                    'cost': cost,
                    'description': f"High-cost operation: {node_type} (cost: {cost})"
                }
                analysis['bottlenecks'].append(bottleneck)
        
        # Recursively check child nodes
        if 'Plans' in plan_node:
            for child in plan_node['Plans']:
                self._find_high_cost_operations(child, analysis)
    
    def _check_index_usage(self, plan_node: Dict[str, Any], analysis: Dict[str, Any]):
        """Check index usage in the execution plan"""
        # Look for inefficient index usage
        if 'Node Type' in plan_node and plan_node['Node Type'] == 'Index Scan':
            if 'Index Cond' in plan_node and 'Filter' in plan_node:
                # Index is being used but with additional filtering
                # This might indicate the index isn't optimal
                index_name = plan_node.get('Index Name', 'unknown')
                
                analysis['recommendations'].append({
                    'type': 'optimize_index',
                    'index': index_name,
                    'description': f"Consider optimizing index '{index_name}' to include filter conditions"
                })
        
        # Recursively check child nodes
        if 'Plans' in plan_node:
            for child in plan_node['Plans']:
                self._check_index_usage(child, analysis)
    
    def _analyze_mysql_plan(self, plan: List[Dict[str, Any]], analysis: Dict[str, Any]):
        """Analyze MySQL execution plan"""
        # MySQL-specific plan analysis logic
        # Similar to PostgreSQL but with different node structure
        pass
        
    def _analyze_sqlite_plan(self, plan: List[Dict[str, Any]], analysis: Dict[str, Any]):
        """Analyze SQLite execution plan"""
        # SQLite-specific plan analysis logic
        pass
    
    def _is_large_table(self, table_name: str) -> bool:
        """
        Determine if a table is large enough to warrant indexing.
        
        Args:
            table_name: Name of the table
            
        Returns:
            True if table is considered large
        """
        try:
            # This is a simplified approach - would need refinement
            # based on actual database statistics
            with self.engine.connect() as conn:
                if self.dialect == 'postgresql':
                    result = conn.execute(text(
                        f"SELECT count(*) FROM {table_name}"
                    )).scalar()
                    return result and result > 1000
                
                # Default fallback
                result = conn.execute(text(
                    f"SELECT count(*) FROM {table_name}"
                )).scalar()
                return result and result > 1000
                
        except Exception as e:
            logger.error(f"Error checking table size: {str(e)}")
            return False
    
    def identify_missing_indexes(self, query: str, execution_plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify potential missing indexes based on query and execution plan.
        
        Args:
            query: SQL query string
            execution_plan: Query execution plan
            
        Returns:
            List of recommended indexes
        """
        recommended_indexes = []
        
        try:
            # Parse the query to identify tables and columns used in WHERE clauses
            tables_columns = self._extract_where_conditions(query)
            
            # Identify existing indexes
            existing_indexes = self._get_existing_indexes(tables_columns.keys())
            
            # For each table and its columns in WHERE clauses
            for table, columns in tables_columns.items():
                # Skip if no columns found
                if not columns:
                    continue
                    
                # Skip if table not found in database
                if table not in self.metadata.tables:
                    continue
                
                # Check existing indexes to see if they cover these columns
                table_indexes = existing_indexes.get(table, [])
                
                # Find columns not covered by existing indexes
                uncovered_columns = self._find_uncovered_columns(columns, table_indexes)
                
                if uncovered_columns:
                    recommended_indexes.append({
                        'table': table,
                        'columns': list(uncovered_columns),
                        'reason': f"Columns used in WHERE clause but not indexed"
                    })
            
            return recommended_indexes
            
        except Exception as e:
            logger.error(f"Error identifying missing indexes: {str(e)}")
            return []
    
    def _extract_where_conditions(self, query: str) -> Dict[str, Set[str]]:
        """
        Extract tables and columns used in WHERE clauses.
        
        Args:
            query: SQL query
            
        Returns:
            Dict mapping tables to sets of columns used in WHERE clauses
        """
        tables_columns = {}
        
        # Very basic SQL parsing - would need a proper SQL parser for production
        # This is simplified and only works for basic queries
        where_clauses = re.findall(r'WHEREs+(.+?)(?:ORDER BY|GROUP BY|LIMIT|;|$)', query, re.IGNORECASE | re.DOTALL)
        
        if not where_clauses:
            return tables_columns
            
        where_clause = where_clauses[0].strip()
        conditions = re.split(r's+ANDs+|s+ORs+', where_clause)
        
        for condition in conditions:
            # Look for table.column or just column patterns
            table_column_match = re.search(r'([a-zA-Z0-9_]+).([a-zA-Z0-9_]+)', condition)
            if table_column_match:
                table, column = table_column_match.groups()
                if table not in tables_columns:
                    tables_columns[table] = set()
                tables_columns[table].add(column)
            else:
                # Try to match just column
                column_match = re.search(r'([a-zA-Z0-9_]+)s*(?:=|<|>|<=|>=|!=)', condition)
                if column_match:
                    column = column_match.group(1)
                    # Can't determine table, add to a special entry
                    if 'unknown' not in tables_columns:
                        tables_columns['unknown'] = set()
                    tables_columns['unknown'].add(column)
        
        return tables_columns
    
    def _get_existing_indexes(self, tables: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get existing indexes for specified tables.
        
        Args:
            tables: List of table names
            
        Returns:
            Dict mapping tables to their indexes
        """
        existing_indexes = {}
        
        for table in tables:
            if table == 'unknown':
                continue
                
            try:
                indexes = self.inspector.get_indexes(table)
                existing_indexes[table] = indexes
            except Exception as e:
                logger.error(f"Error getting indexes for table {table}: {str(e)}")
                existing_indexes[table] = []
        
        return existing_indexes
    
    def _find_uncovered_columns(self, columns: Set[str], indexes: List[Dict[str, Any]]) -> Set[str]:
        """
        Find columns not covered by existing indexes.
        
        Args:
            columns: Set of column names
            indexes: List of index dictionaries
            
        Returns:
            Set of column names not covered by existing indexes
        """
        uncovered = set(columns)
        
        for index in indexes:
            # Check if index covers any of our columns
            index_columns = set(index['column_names'])
            
            # Single-column indexes
            uncovered -= index_columns
            
            # For multi-column indexes, check if our column is the first in the index
            if index_columns and len(index_columns) > 1:
                first_column = index['column_names'][0]
                if first_column in uncovered:
                    uncovered.remove(first_column)
            
            if not uncovered:
                break
                
        return uncovered
    
    def optimize_query(self, query: str) -> str:
        """
        Attempt to optimize a SQL query.
        
        Args:
            query: Original SQL query
            
        Returns:
            Optimized SQL query or original if no optimizations found
        """
        optimized = query
        
        try:
            # Optimize SELECT * to specific columns if possible
            optimized = self._optimize_select_star(optimized)
            
            # Add LIMIT if missing to prevent excessive data retrieval
            optimized = self._optimize_add_limit(optimized)
            
            # Optimize JOIN conditions
            optimized = self._optimize_joins(optimized)
            
            return optimized
            
        except Exception as e:
            logger.error(f"Error optimizing query: {str(e)}")
            return query
    
    def _optimize_select_star(self, query: str) -> str:
        """Optimize SELECT * to specific columns"""
        # Very basic implementation - would need a proper SQL parser
        if re.search(r'SELECTs+*s+FROM', query, re.IGNORECASE):
            # Extract table name
            table_match = re.search(r'FROMs+([a-zA-Z0-9_]+)', query, re.IGNORECASE)
            if table_match and table_match.group(1) in self.metadata.tables:
                table_name = table_match.group(1)
                table = self.metadata.tables[table_name]
                
                # Get column names
                columns = [c.name for c in table.columns]
                
                # Replace SELECT * with specific columns
                if columns:
                    column_str = ', '.join(columns)
                    query = re.sub(
                        r'SELECTs+*', 
                        f'SELECT {column_str}', 
                        query, 
                        flags=re.IGNORECASE
                    )
        
        return query
    
    def _optimize_add_limit(self, query: str) -> str:
        """Add LIMIT if missing"""
        if not re.search(r'LIMITs+d+', query, re.IGNORECASE) and not re.search(r'COUNTs*(', query, re.IGNORECASE):
            # Only add LIMIT to SELECT queries
            if re.search(r'^SELECT', query.strip(), re.IGNORECASE):
                query = f"{query} LIMIT 1000"
        
        return query
    
    def _optimize_joins(self, query: str) -> str:
        """Optimize JOIN conditions"""
        # This would require a proper SQL parser to implement correctly
        return query
    
    def execute_query(self, query: str, params: Dict[str, Any] = None, use_cache: bool = True) -> Tuple[List[Dict[str, Any]], float]:
        """
        Execute a SQL query with optional caching.
        
        Args:
            query: SQL query string
            params: Optional query parameters
            use_cache: Whether to use query cache
            
        Returns:
            Tuple of (result rows, execution time in seconds)
        """
        # Generate cache key if caching is enabled
        cache_key = None
        if self.cache_enabled and use_cache:
            cache_key = self._generate_cache_key(query, params)
            
            # Check if query is in cache and not expired
            if cache_key in self.query_cache:
                cache_entry = self.query_cache[cache_key]
                if time.time() - cache_entry['timestamp'] < self.cache_ttl:
                    logger.debug(f"Cache hit for query: {query[:100]}...")
                    return cache_entry['results'], 0.0
        
        # Execute query
        start_time = time.time()
        try:
            with self.engine.connect() as conn:
                # Execute with timeout if supported
                if params:
                    result = conn.execute(text(query), params)
                else:
                    result = conn.execute(text(query))
                
                # Fetch all results and convert to dictionaries
                rows = [dict(row) for row in result]
                
                execution_time = time.time() - start_time
                
                # Cache results if caching is enabled
                if self.cache_enabled and use_cache and cache_key:
                    self.query_cache[cache_key] = {
                        'results': rows,
                        'timestamp': time.time(),
                        'execution_time': execution_time
                    }
                
                # Update query stats
                self._update_query_stats(query, {
                    'execution_time': execution_time,
                    'result_size': len(rows)
                })
                
                return rows, execution_time
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Error executing query: {str(e)}")
            execution_time = time.time() - start_time
            
            # Update query stats
            self._update_query_stats(query, {
                'execution_time': execution_time,
                'error': str(e)
            })
            
            return [], execution_time
    
    def _generate_cache_key(self, query: str, params: Dict[str, Any] = None) -> str:
        """
        Generate a cache key for a query.
        
        Args:
            query: SQL query string
            params: Query parameters
            
        Returns:
            Cache key string
        """
        # Normalize query (remove whitespace, make lowercase)
        normalized_query = re.sub(r's+', ' ', query.strip().lower())
        
        # Include params in cache key if provided
        if params:
            import json
            return f"{normalized_query}::{json.dumps(params, sort_keys=True)}"
        else:
            return normalized_query
    
    def _update_query_stats(self, query: str, stats: Dict[str, Any]):
        """
        Update statistics for a query.
        
        Args:
            query: SQL query
            stats: Statistics to update
        """
        # Normalize query for stats
        normalized_query = re.sub(r's+', ' ', query.strip())
        
        # Truncate very long queries for stats storage
        if len(normalized_query) > 200:
            normalized_query = normalized_query[:197] + '...'
        
        # Initialize or update stats
        if normalized_query not in self.query_stats:
            self.query_stats[normalized_query] = {
                'count': 0,
                'total_time': 0,
                'min_time': float('inf') if 'execution_time' in stats else None,
                'max_time': 0,
                'avg_time': 0,
                'errors': 0,
                'last_executed': time.time()
            }
        
        # Update stats
        self.query_stats[normalized_query]['count'] += 1
        self.query_stats[normalized_query]['last_executed'] = time.time()
        
        if 'execution_time' in stats:
            exec_time = stats['execution_time']
            self.query_stats[normalized_query]['total_time'] += exec_time
            
            if exec_time < self.query_stats[normalized_query]['min_time']:
                self.query_stats[normalized_query]['min_time'] = exec_time
                
            if exec_time > self.query_stats[normalized_query]['max_time']:
                self.query_stats[normalized_query]['max_time'] = exec_time
                
            self.query_stats[normalized_query]['avg_time'] = (
                self.query_stats[normalized_query]['total_time'] / 
                self.query_stats[normalized_query]['count']
            )
        
        if 'error' in stats:
            self.query_stats[normalized_query]['errors'] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get metrics about query execution.
        
        Returns:
            Dict containing query metrics
        """
        return {
            'component': 'QueryOptimizer',
            'timestamp': datetime.utcnow().isoformat(),
            'query_count': sum(stats['count'] for stats in self.query_stats.values()),
            'cache_entries': len(self.query_cache),
            'cache_size_bytes': sum(len(str(entry)) for entry in self.query_cache.values()),
            'queries': self.query_stats,
            'last_error': self.last_error
        }
    
    def clear_cache(self):
        """Clear the query cache"""
        self.query_cache.clear()
        logger.info("Query cache cleared")
