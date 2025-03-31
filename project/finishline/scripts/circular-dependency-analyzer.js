#!/usr/bin/env node

/**
 * Circular Dependency Analyzer
 * 
 * Analyzes the codebase to identify and visualize circular dependencies,
 * providing recommendations for resolving them through proper abstractions
 * and dependency injection patterns.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  targetDirs: ['../src', '../../frontend/src', '../../backend'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.git/**'],
  languages: {
    javascript: {
      extensions: ['.js', '.jsx'],
      importRegex: /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g
    },
    typescript: {
      extensions: ['.ts', '.tsx'],
      importRegex: /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g
    },
    python: {
      extensions: ['.py'],
      importRegex: /(?:from\s+(\S+)\s+import|import\s+(\S+))/g
    }
  },
  reportsDir: '../cleanup-reports',
  fixCircularDeps: false  // Set to true to automatically apply fixes
};

/**
 * Format date as YYYY-MM-DD_HH-MM-SS
 */
function getFormattedDate() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
}

/**
 * Normalize file path to module identifier
 */
function normalizeModuleId(filePath, basePath) {
  let moduleId = path.relative(basePath, filePath);
  
  // Remove extension
  moduleId = moduleId.replace(/\.(js|jsx|ts|tsx|py)$/, '');
  
  // Convert path separators to forward slashes
  moduleId = moduleId.replace(/\\/g, '/');
  
  // Handle index files
  if (moduleId.endsWith('/index')) {
    moduleId = moduleId.replace(/\/index$/, '');
  }
  
  return moduleId;
}

/**
 * Resolve an import path to its absolute file path
 */
function resolveImport(importPath, currentFile, basePath) {
  // Handle node_modules imports (not local)
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }
  
  const currentDir = path.dirname(currentFile);
  
  // Handle absolute imports (from project root)
  if (importPath.startsWith('/')) {
    return path.join(basePath, importPath.slice(1));
  }
  
  // Handle relative imports
  let resolvedPath = path.resolve(currentDir, importPath);
  
  // Check if import has an extension
  const hasExtension = ['.js', '.jsx', '.ts', '.tsx', '.py'].some(ext => 
    importPath.endsWith(ext)
  );
  
  if (!hasExtension) {
    // Try to resolve extensions
    const possibleExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py',
      '/index.js', '/index.jsx', '/index.ts', '/index.tsx', '/index.py'
    ];
    
    for (const ext of possibleExtensions) {
      const pathWithExt = resolvedPath + ext;
      if (fs.existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }
  }
  
  // If file exists with given path, return it
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }
  
  // Could not resolve import
  return null;
}

/**
 * Extract imports from file content
 */
function extractImports(filePath, content, language, basePath) {
  const imports = [];
  const regex = CONFIG.languages[language].importRegex;
  let match;
  
  // Reset regex
  regex.lastIndex = 0;
  
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    if (importPath) {
      const resolvedPath = resolveImport(importPath, filePath, basePath);
      
      if (resolvedPath) {
        imports.push({
          source: normalizeModuleId(filePath, basePath),
          target: normalizeModuleId(resolvedPath, basePath)
        });
      }
    }
  }
  
  return imports;
}

/**
 * Build dependency graph for all files
 */
function buildDependencyGraph() {
  console.log('Building dependency graph...');
  
  const graph = {
    nodes: new Set(),
    edges: [],
    adjacencyList: {}
  };
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      console.warn(`Warning: Target directory does not exist: ${basePath}`);
      return;
    }
    
    // Get all files with supported extensions
    const extensions = [
      ...CONFIG.languages.javascript.extensions,
      ...CONFIG.languages.typescript.extensions,
      ...CONFIG.languages.python.extensions
    ];
    
    const extPattern = extensions.map(ext => `*${ext}`).join(',');
    const pattern = `${basePath}/**/*.{${extPattern.replace(/\./g, '')}}`;
    
    const files = glob.sync(pattern, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    console.log(`Found ${files.length} files to analyze in ${targetDir}`);
    
    // Process each file
    files.forEach(filePath => {
      let language;
      const ext = path.extname(filePath).toLowerCase();
      
      if (CONFIG.languages.javascript.extensions.includes(ext)) {
        language = 'javascript';
      } else if (CONFIG.languages.typescript.extensions.includes(ext)) {
        language = 'typescript';
      } else if (CONFIG.languages.python.extensions.includes(ext)) {
        language = 'python';
      } else {
        return; // Unsupported file type
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const imports = extractImports(filePath, content, language, basePath);
        
        // Add node to graph
        const moduleId = normalizeModuleId(filePath, basePath);
        graph.nodes.add(moduleId);
        
        // Add edges to graph
        imports.forEach(({ source, target }) => {
          graph.edges.push({ source, target });
          
          // Add to adjacency list
          if (!graph.adjacencyList[source]) {
            graph.adjacencyList[source] = [];
          }
          graph.adjacencyList[source].push(target);
          
          // Ensure target node exists
          graph.nodes.add(target);
        });
      } catch (error) {
        console.warn(`Warning: Error processing file ${filePath}:`, error.message);
      }
    });
  });
  
  console.log(`Dependency graph built with ${graph.nodes.size} nodes and ${graph.edges.length} edges`);
  
  return graph;
}

/**
 * Find circular dependencies in the graph using DFS
 */
function findCircularDependencies(graph) {
  console.log('Finding circular dependencies...');
  
  const cycles = [];
  
  const visited = new Set();
  const recursionStack = new Set();
  
  function detectCycle(node, path = []) {
    // Already completely explored this node
    if (visited.has(node)) {
      return;
    }
    
    // Check if we've found a cycle
    if (recursionStack.has(node)) {
      // Find where the cycle starts
      const cycleStartIndex = path.indexOf(node);
      if (cycleStartIndex !== -1) {
        // Extract the cycle
        const cycle = path.slice(cycleStartIndex);
        cycle.push(node); // Close the cycle
        
        // Add to cycles list (as a string to allow deduplication)
        const cycleKey = [...cycle].sort().join('->');
        if (!cycles.some(c => c.key === cycleKey)) {
          cycles.push({
            path: cycle,
            key: cycleKey
          });
        }
      }
      return;
    }
    
    // Mark node as being explored
    recursionStack.add(node);
    path.push(node);
    
    // Explore neighbors
    const neighbors = graph.adjacencyList[node] || [];
    for (const neighbor of neighbors) {
      detectCycle(neighbor, [...path]);
    }
    
    // Done exploring this node
    recursionStack.delete(node);
    visited.add(node);
  }
  
  // Start DFS from each node
  for (const node of graph.nodes) {
    detectCycle(node);
  }
  
  console.log(`Found ${cycles.length} circular dependencies`);
  
  return cycles;
}

/**
 * Analyze circular dependencies and generate recommendations
 */
function analyzeCircularDependencies(cycles, graph) {
  console.log('Analyzing circular dependencies...');
  
  const analysis = [];
  
  cycles.forEach(cycle => {
    // Count incoming edges for each node in the cycle
    const incomingEdges = {};
    graph.edges.forEach(edge => {
      if (cycle.path.includes(edge.target) && !cycle.path.includes(edge.source)) {
        incomingEdges[edge.target] = (incomingEdges[edge.target] || 0) + 1;
      }
    });
    
    // Count outgoing edges for each node in the cycle
    const outgoingEdges = {};
    graph.edges.forEach(edge => {
      if (cycle.path.includes(edge.source) && !cycle.path.includes(edge.target)) {
        outgoingEdges[edge.source] = (outgoingEdges[edge.source] || 0) + 1;
      }
    });
    
    // Identify best candidate for abstraction
    // (node with highest combined incoming and outgoing edges)
    let bestCandidate = null;
    let bestScore = -1;
    
    cycle.path.forEach(node => {
      const score = (incomingEdges[node] || 0) + (outgoingEdges[node] || 0);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = node;
      }
    });
    
    // Generate recommendations
    const recommendations = [];
    
    // If we found a good candidate
    if (bestCandidate) {
      recommendations.push({
        type: 'abstraction',
        node: bestCandidate,
        description: `Create an interface/abstract class for ${bestCandidate}`
      });
      
      // Add dependency injection recommendation if appropriate
      if (cycle.path.length > 2) {
        recommendations.push({
          type: 'dependency-injection',
          description: `Use dependency injection to provide ${bestCandidate} to dependent modules`
        });
      }
    }
    
    // Add general recommendation
    recommendations.push({
      type: 'restructure',
      description: `Consider restructuring these modules to eliminate circular dependency`
    });
    
    // Add analysis
    analysis.push({
      cycle: cycle.path,
      incomingEdges,
      outgoingEdges,
      recommendations
    });
  });
  
  return analysis;
}

/**
 * Generate visualization for dependency graph
 */
function generateVisualization(graph, cycles) {
  console.log('Generating visualization...');
  
  // Create a simple HTML visualization with D3.js
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dependency Graph Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    #graph { width: 100%; height: 800px; border: 1px solid #ccc; }
    .node { fill: #69b3a2; }
    .node.cycle { fill: #e15759; }
    .link { stroke: #999; stroke-opacity: 0.6; stroke-width: 1px; }
    .link.cycle { stroke: #e15759; stroke-opacity: 0.8; stroke-width: 2px; }
    .label { font-size: 10px; }
  </style>
</head>
<body>
  <h1>Dependency Graph Visualization</h1>
  <div id="graph"></div>
  <script>
    // Graph data
    const nodes = ${JSON.stringify(Array.from(graph.nodes).map(id => ({ id })))};
    const links = ${JSON.stringify(graph.edges)};
    const cycles = ${JSON.stringify(cycles.map(c => c.path))};
    
    // Identify nodes and links in cycles
    const cycleNodes = new Set();
    const cycleLinks = new Set();
    
    cycles.forEach(cycle => {
      cycle.forEach(node => {
        cycleNodes.add(node);
      });
      
      for (let i = 0; i < cycle.length - 1; i++) {
        cycleLinks.add(cycle[i] + '->' + cycle[i+1]);
      }
      if (cycle.length > 0) {
        cycleLinks.add(cycle[cycle.length - 1] + '->' + cycle[0]);
      }
    });
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(window.innerWidth / 2, 400));
    
    // Create SVG
    const svg = d3.select("#graph")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .call(d3.zoom().on("zoom", function(event) {
        svg.attr("transform", event.transform);
      }))
      .append("g");
    
    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", d => cycleLinks.has(d.source.id + '->' + d.target.id) ? "link cycle" : "link")
      .attr("marker-end", "url(#arrow)");
    
    // Add arrow marker
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .join("marker")
      .attr("id", d => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");
    
    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("class", d => cycleNodes.has(d.id) ? "node cycle" : "node")
      .attr("r", 5)
      .call(drag(simulation));
    
    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("class", "label")
      .text(d => d.id.split('/').pop())
      .attr("dx", 12)
      .attr("dy", ".35em");
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
    
    // Drag function
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  </script>
</body>
</html>
  `;
  
  return html;
}

/**
 * Generate circular dependency report
 */
function generateReport(data) {
  console.log('Generating circular dependency report...');
  
  const {
    timestamp,
    cycles,
    analysis,
    visualizationFile
  } = data;
  
  const reportFile = path.join(CONFIG.reportsDir, `circular-dependencies-analysis-${timestamp}.md`);
  const visualizationPath = path.relative(path.dirname(reportFile), visualizationFile);
  
  let report = `# Circular Dependency Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total circular dependencies found: ${cycles.length}\n`;
  report += `- Visualization: [View Dependency Graph](${visualizationPath})\n\n`;
  
  if (cycles.length === 0) {
    report += `No circular dependencies found. Great job!\n\n`;
  } else {
    report += `## Detailed Analysis\n\n`;
    
    analysis.forEach((item, index) => {
      report += `### Circular Dependency ${index + 1}\n\n`;
      report += `**Path:** ${item.cycle.join(' → ')}\n\n`;
      
      report += `**Key Modules:**\n`;
      Object.entries(item.incomingEdges).forEach(([node, count]) => {
        report += `- \`${node}\` (${count} incoming, ${item.outgoingEdges[node] || 0} outgoing)\n`;
      });
      
      report += `\n**Recommendations:**\n`;
      item.recommendations.forEach(rec => {
        if (rec.type === 'abstraction') {
          report += `1. **Create Abstraction:** Extract an interface or abstract class from \`${rec.node}\`\n`;
        } else if (rec.type === 'dependency-injection') {
          report += `2. **Dependency Injection:** ${rec.description}\n`;
        } else {
          report += `3. **Restructure:** ${rec.description}\n`;
        }
      });
      
      report += `\n**Refactoring Approach:**\n`;
      report += `1. Extract interfaces or abstract classes for key components\n`;
      report += `2. Move shared functionality to a common module\n`;
      report += `3. Use dependency injection to invert control flow\n`;
      report += `4. Consider applying the mediator pattern for complex interactions\n\n`;
      
      report += `---\n\n`;
    });
    
    report += `## Best Practices for Avoiding Circular Dependencies\n\n`;
    report += `1. **Follow the Dependency Inversion Principle:**\n`;
    report += `   - Depend on abstractions, not concretions\n`;
    report += `   - Use interfaces or abstract classes to decouple modules\n\n`;
    
    report += `2. **Apply Separation of Concerns:**\n`;
    report += `   - Keep modules focused on a single responsibility\n`;
    report += `   - Extract shared functionality to common utility modules\n\n`;
    
    report += `3. **Use Dependency Injection:**\n`;
    report += `   - Pass dependencies as parameters rather than importing directly\n`;
    report += `   - Consider using a dependency injection framework for complex applications\n\n`;
    
    report += `4. **Implement Mediator Pattern:**\n`;
    report += `   - Create a mediator module that coordinates between dependent modules\n`;
    report += `   - Allows modules to communicate without direct dependencies\n\n`;
    
    report += `5. **Restructure Module Hierarchy:**\n`;
    report += `   - Organize modules in a clear hierarchy to prevent circular imports\n`;
    report += `   - Keep dependencies flowing in one direction (e.g., core → utils → features)\n\n`;
  }
  
  report += `## Next Steps\n\n`;
  report += `1. Review circular dependencies identified in this report\n`;
  report += `2. Implement recommended refactoring approaches\n`;
  report += `3. Set up regular dependency analysis in your CI/CD pipeline\n`;
  report += `4. Update coding guidelines to prevent creation of new circular dependencies\n`;
  
  fs.writeFileSync(reportFile, report);
  
  console.log(`Circular dependency report generated: ${reportFile}`);
  
  return reportFile;
}

/**
 * Main execution function
 */
async function main() {
  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }
  
  // Get timestamp for file names
  const timestamp = getFormattedDate();
  
  // Build dependency graph
  const graph = buildDependencyGraph();
  
  // Find circular dependencies
  const cycles = findCircularDependencies(graph);
  
  // Analyze circular dependencies
  const analysis = analyzeCircularDependencies(cycles, graph);
  
  // Generate visualization
  const visualization = generateVisualization(graph, cycles);
  const visualizationFile = path.join(CONFIG.reportsDir, `circular-dependencies-visualization-${timestamp}.html`);
  fs.writeFileSync(visualizationFile, visualization);
  
  // Generate report
  const reportFile = generateReport({
    timestamp,
    cycles,
    analysis,
    visualizationFile
  });
  
  console.log('\nCircular dependency analysis complete!');
  console.log(`Report: ${reportFile}`);
  console.log(`Visualization: ${visualizationFile}`);
  
  // Summary stats
  console.log('\nAnalysis Stats:');
  console.log(`- Total nodes: ${graph.nodes.size}`);
  console.log(`- Total edges: ${graph.edges.length}`);
  console.log(`- Circular dependencies found: ${cycles.length}`);
  
  if (cycles.length > 0) {
    console.log('\nFound circular dependencies:');
    cycles.forEach((cycle, index) => {
      console.log(`${index + 1}. ${cycle.path.join(' → ')}`);
    });
  } else {
    console.log('\nNo circular dependencies found. Great job!');
  }
}

// Run the script
main().catch(error => {
  console.error('Error executing circular dependency analysis:', error);
  process.exit(1);
});