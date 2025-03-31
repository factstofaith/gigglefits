/**
 * Documentation Generator Script
 * 
 * This script generates comprehensive documentation from source code
 * and documentation config files. It ensures our zero technical debt approach
 * by creating thorough documentation.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import the documentation utilities
const apiDocGenerator = require('../src/utils/docs/apiDocGenerator');
const documentationBuilder = require('../src/utils/docs/documentationBuilder');

// Configuration
const CONFIG = {
  sourceDirs: [
    'src/components',
    'src/hooks',
    'src/utils',
    'src/contexts'
  ],
  outputDir: 'docs/generated',
  exampleDir: 'src/examples',
  userGuideDir: 'docs/guides',
  componentDocsDir: 'docs/components'
};

// Create output directory if it doesn't exist
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * Find all JS/JSX/TS/TSX files in the specified directories
 * 
 * @returns {Array<string>} List of file paths
 */
function findSourceFiles() {
  let files = [];
  
  CONFIG.sourceDirs.forEach(dir => {
    const pattern = path.join(dir, '**/*.{js,jsx,ts,tsx}');
    const matches = glob.sync(pattern, { ignore: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'] });
    files = files.concat(matches);
  });
  
  return files;
}

/**
 * Process all source files for documentation
 * 
 * @param {Array<string>} files - List of file paths
 */
function processSourceFiles(files) {
  console.log(`Processing ${files.length} source files for documentation...`);
  
  files.forEach(filePath => {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const docItems = apiDocGenerator.extractDocsFromSource(sourceCode, filePath);
      
      if (docItems.length > 0) {
        apiDocGenerator.processDocsFromSource(docItems);
        console.log(`Processed ${docItems.length} documentation items from ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  });
}

/**
 * Find and process markdown documentation files
 */
function processUserGuides() {
  console.log('Processing user guides...');
  
  if (!fs.existsSync(CONFIG.userGuideDir)) {
    console.log(`User guide directory ${CONFIG.userGuideDir} does not exist.`);
    return;
  }
  
  const guideFiles = glob.sync(path.join(CONFIG.userGuideDir, '**/*.md'));
  
  guideFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.md');
      const relativePath = path.relative(CONFIG.userGuideDir, filePath);
      const category = path.dirname(relativePath) === '.' ? 'Guides' : path.dirname(relativePath);
      
      // Extract front matter if present (simplified YAML parsing)
      let title = fileName;
      let description = '';
      let tags = [];
      let order = 0;
      
      const frontMatterMatch = content.match(/^---\s([\s\S]*?)\s---/);
      
      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];
        
        const titleMatch = frontMatter.match(/title:\s*(.+)$/m);
        if (titleMatch) title = titleMatch[1].trim();
        
        const descMatch = frontMatter.match(/description:\s*(.+)$/m);
        if (descMatch) description = descMatch[1].trim();
        
        const tagsMatch = frontMatter.match(/tags:\s*\[(.*)\]/m);
        if (tagsMatch) tags = tagsMatch[1].split(',').map(tag => tag.trim());
        
        const orderMatch = frontMatter.match(/order:\s*(\d+)/m);
        if (orderMatch) order = parseInt(orderMatch[1]);
      }
      
      // Use the first paragraph as description if not found in front matter
      if (!description) {
        const firstParagraphMatch = content.match(/^(?:(?!^#|^---).+)\n+([^#].+?)$/m);
        if (firstParagraphMatch) description = firstParagraphMatch[1].trim();
      }
      
      // Register the user guide
      documentationBuilder.registerPage({
        id: fileName,
        title,
        description,
        category,
        content: content.replace(/^---\s([\s\S]*?)\s---/, '').trim(), // Remove front matter
        tags,
        order
      });
      
      console.log(`Processed user guide: ${fileName}`);
    } catch (error) {
      console.error(`Error processing guide file ${filePath}:`, error);
    }
  });
}

/**
 * Find and process component documentation files
 */
function processComponentDocs() {
  console.log('Processing component documentation...');
  
  if (!fs.existsSync(CONFIG.componentDocsDir)) {
    console.log(`Component docs directory ${CONFIG.componentDocsDir} does not exist.`);
    return;
  }
  
  const docFiles = glob.sync(path.join(CONFIG.componentDocsDir, '**/*.{md,json}'));
  
  docFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      const extension = path.extname(filePath);
      
      if (extension === '.json') {
        // Parse JSON component documentation
        const componentDoc = JSON.parse(content);
        
        documentationBuilder.createComponentDoc({
          name: componentDoc.name,
          description: componentDoc.description,
          props: componentDoc.props,
          examples: componentDoc.examples
        });
        
        console.log(`Processed component documentation (JSON): ${componentDoc.name}`);
      } else {
        // Process markdown component documentation
        const componentName = fileName.replace('.md', '');
        
        // Extract description from first paragraph
        const descriptionMatch = content.match(/^#\s+.+\n+(.+?)(?=\n\n|$)/m);
        const description = descriptionMatch ? descriptionMatch[1] : '';
        
        // Extract props from prop table
        const propsMatch = content.match(/## Props\s+\|.+\|\s+\|[^\n]+\|\s+((?:\|.+\|\s+)+)/m);
        const props = [];
        
        if (propsMatch) {
          const propRows = propsMatch[1].trim().split('\n');
          
          propRows.forEach(row => {
            const columns = row.split('|').map(col => col.trim());
            
            if (columns.length >= 6) {
              props.push({
                name: columns[1].replace(/`/g, ''),
                type: columns[2].replace(/`/g, ''),
                required: columns[3] === 'Yes',
                defaultValue: columns[4] === '-' ? undefined : columns[4].replace(/`/g, ''),
                description: columns[5]
              });
            }
          });
        }
        
        // Extract examples from code blocks
        const examples = [];
        let exampleMatch;
        const exampleRegex = /### Example[^#]*```(\w+)\n([\s\S]+?)```/g;
        
        while ((exampleMatch = exampleRegex.exec(content)) !== null) {
          const titleMatch = content.substring(exampleMatch.index).match(/### Example[^:]*(?::|) *([^\n]+)/);
          const title = titleMatch ? titleMatch[1] : 'Example';
          
          const descriptionMatch = content.substring(exampleMatch.index + titleMatch[0].length).match(/\n([^```]+)\n```/);
          const description = descriptionMatch ? descriptionMatch[1].trim() : '';
          
          examples.push({
            title,
            description,
            language: exampleMatch[1],
            code: exampleMatch[2]
          });
        }
        
        documentationBuilder.createComponentDoc({
          name: componentName,
          description,
          props,
          examples
        });
        
        console.log(`Processed component documentation (Markdown): ${componentName}`);
      }
    } catch (error) {
      console.error(`Error processing component doc file ${filePath}:`, error);
    }
  });
}

/**
 * Generate comprehensive API documentation
 */
function generateApiDocs() {
  console.log('Generating API documentation...');
  
  const outputPath = path.join(CONFIG.outputDir, 'api.html');
  const apiDocHtml = apiDocGenerator.generateApiDocumentation();
  
  fs.writeFileSync(outputPath, apiDocHtml, 'utf8');
  console.log(`API documentation generated at ${outputPath}`);
}

/**
 * Generate comprehensive documentation site
 */
function generateDocumentationSite() {
  console.log('Generating documentation site...');
  
  const site = documentationBuilder.generateDocumentationSite();
  
  // Write index page
  const indexPath = path.join(CONFIG.outputDir, 'index.html');
  fs.writeFileSync(indexPath, site.index, 'utf8');
  console.log(`Documentation index page generated at ${indexPath}`);
  
  // Write individual pages
  Object.entries(site.pages).forEach(([pageId, pageHtml]) => {
    const pagePath = path.join(CONFIG.outputDir, `${pageId}.html`);
    fs.writeFileSync(pagePath, pageHtml, 'utf8');
  });
  
  console.log(`Generated ${Object.keys(site.pages).length} documentation pages`);
  
  // Write site map
  const siteMapPath = path.join(CONFIG.outputDir, 'sitemap.json');
  fs.writeFileSync(siteMapPath, JSON.stringify(site.siteMap, null, 2), 'utf8');
  console.log(`Site map generated at ${siteMapPath}`);
}

/**
 * Save documentation data for use in the application
 */
function saveDocumentationData() {
  console.log('Saving documentation data for application use...');
  
  const componentDocsPath = path.join(CONFIG.outputDir, 'component-docs.json');
  fs.writeFileSync(componentDocsPath, JSON.stringify(apiDocGenerator.getAllComponentDocs(), null, 2), 'utf8');
  
  const hookDocsPath = path.join(CONFIG.outputDir, 'hook-docs.json');
  fs.writeFileSync(hookDocsPath, JSON.stringify(apiDocGenerator.getAllHookDocs(), null, 2), 'utf8');
  
  const utilityDocsPath = path.join(CONFIG.outputDir, 'utility-docs.json');
  fs.writeFileSync(utilityDocsPath, JSON.stringify(apiDocGenerator.getAllUtilityDocs(), null, 2), 'utf8');
  
  const documentationPagesPath = path.join(CONFIG.outputDir, 'documentation-pages.json');
  fs.writeFileSync(documentationPagesPath, JSON.stringify(documentationBuilder.getAllPages(), null, 2), 'utf8');
  
  console.log('Documentation data saved for application use');
}

/**
 * Main function to run the documentation generation
 */
function main() {
  console.log('Starting documentation generation...');
  
  // Find and process source files
  const sourceFiles = findSourceFiles();
  processSourceFiles(sourceFiles);
  
  // Process user guides and component documentation
  processUserGuides();
  processComponentDocs();
  
  // Generate documentation outputs
  generateApiDocs();
  generateDocumentationSite();
  saveDocumentationData();
  
  console.log('Documentation generation complete!');
}

// Run the documentation generator
main();