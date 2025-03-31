/**
 * Documentation Builder
 * 
 * Comprehensive documentation system for generating user guides, examples,
 * and usage documentation. Part of the zero technical debt documentation implementation.
 * 
 * @module utils/docs/documentationBuilder
 */

/**
 * Documentation page metadata
 * 
 * @typedef {Object} DocumentationPage
 * @property {string} id - Unique page identifier
 * @property {string} title - Page title
 * @property {string} description - Page description
 * @property {string} category - Page category
 * @property {number} order - Display order within category
 * @property {string} content - Page content in markdown format
 * @property {Array<string>} tags - Tags for searchability
 * @property {Array<CodeExample>} examples - Code examples
 * @property {Date} lastUpdated - Last update timestamp
 * @property {string} path - URL path for the page
 */

/**
 * Code example metadata
 * 
 * @typedef {Object} CodeExample
 * @property {string} id - Unique example identifier
 * @property {string} title - Example title
 * @property {string} description - Example description
 * @property {string} code - Example code
 * @property {string} language - Code language (jsx, typescript, etc.)
 * @property {boolean} interactive - Whether the example is interactive
 * @property {Array<DependencyItem>} dependencies - Example dependencies
 */

/**
 * Dependency metadata
 * 
 * @typedef {Object} DependencyItem
 * @property {string} name - Dependency name
 * @property {string} type - Dependency type (component, hook, utility, etc.)
 * @property {string} version - Dependency version
 */

// Store for documentation pages
const documentationPages = {};

// Store for documentation categories
const documentationCategories = {};

// Store for code examples
const codeExamples = {};

/**
 * Register a documentation page
 * 
 * @param {DocumentationPage} page - Documentation page metadata
 */
export const registerPage = (page) => {
  if (!page.id) {
    console.warn('Documentation page missing id property');
    return;
  }
  
  // Set default values
  const fullPage = {
    ...page,
    tags: page.tags || [],
    examples: page.examples || [],
    lastUpdated: page.lastUpdated || new Date(),
    path: page.path || `/docs/${page.id}`,
  };
  
  // Register the page
  documentationPages[page.id] = fullPage;
  
  // Register the category
  if (page.category) {
    if (!documentationCategories[page.category]) {
      documentationCategories[page.category] = {
        name: page.category,
        pages: []
      };
    }
    
    documentationCategories[page.category].pages.push(page.id);
    
    // Sort pages by order
    documentationCategories[page.category].pages.sort((a, b) => {
      const pageA = documentationPages[a];
      const pageB = documentationPages[b];
      return (pageA.order || 0) - (pageB.order || 0);
    });
  }
};

/**
 * Register a code example
 * 
 * @param {CodeExample} example - Code example metadata
 */
export const registerExample = (example) => {
  if (!example.id) {
    console.warn('Code example missing id property');
    return;
  }
  
  // Set default values
  const fullExample = {
    ...example,
    language: example.language || 'jsx',
    interactive: example.interactive || false,
    dependencies: example.dependencies || []
  };
  
  // Register the example
  codeExamples[example.id] = fullExample;
};

/**
 * Get a documentation page by ID
 * 
 * @param {string} pageId - Page ID
 * @returns {DocumentationPage|undefined} Documentation page
 */
export const getPage = (pageId) => {
  return documentationPages[pageId];
};

/**
 * Get a documentation category by name
 * 
 * @param {string} categoryName - Category name
 * @returns {Object|undefined} Documentation category
 */
export const getCategory = (categoryName) => {
  return documentationCategories[categoryName];
};

/**
 * Get all documentation categories
 * 
 * @returns {Object} All documentation categories
 */
export const getAllCategories = () => {
  return { ...documentationCategories };
};

/**
 * Get pages by category
 * 
 * @param {string} categoryName - Category name
 * @returns {Array<DocumentationPage>} Pages in the category
 */
export const getPagesByCategory = (categoryName) => {
  const category = getCategory(categoryName);
  if (!category) return [];
  
  return category.pages.map(pageId => getPage(pageId));
};

/**
 * Get all documentation pages
 * 
 * @returns {Object} All documentation pages
 */
export const getAllPages = () => {
  return { ...documentationPages };
};

/**
 * Get a code example by ID
 * 
 * @param {string} exampleId - Example ID
 * @returns {CodeExample|undefined} Code example
 */
export const getExample = (exampleId) => {
  return codeExamples[exampleId];
};

/**
 * Get all code examples
 * 
 * @returns {Object} All code examples
 */
export const getAllExamples = () => {
  return { ...codeExamples };
};

/**
 * Search documentation pages by keyword
 * 
 * @param {string} keyword - Search keyword
 * @returns {Array<DocumentationPage>} Matching pages
 */
export const searchPages = (keyword) => {
  if (!keyword) return [];
  
  const results = [];
  const searchRegex = new RegExp(keyword, 'i');
  
  Object.values(documentationPages).forEach(page => {
    if (
      searchRegex.test(page.title) ||
      searchRegex.test(page.description) ||
      searchRegex.test(page.content) ||
      page.tags.some(tag => searchRegex.test(tag))
    ) {
      results.push(page);
    }
  });
  
  return results;
};

/**
 * Generate a documentation site map for all pages
 * 
 * @returns {Object} Site map structure
 */
export const generateSiteMap = () => {
  const siteMap = {
    categories: []
  };
  
  // Process each category
  Object.entries(documentationCategories).forEach(([categoryName, category]) => {
    const categoryPages = category.pages.map(pageId => {
      const page = documentationPages[pageId];
      return {
        id: page.id,
        title: page.title,
        path: page.path,
        order: page.order || 0
      };
    }).sort((a, b) => a.order - b.order);
    
    siteMap.categories.push({
      name: categoryName,
      pages: categoryPages
    });
  });
  
  // Sort categories by name
  siteMap.categories.sort((a, b) => a.name.localeCompare(b.name));
  
  return siteMap;
};

/**
 * Parse markdown content to extract structured information
 * 
 * @param {string} markdown - Markdown content
 * @returns {Object} Structured content
 */
export const parseMarkdown = (markdown) => {
  // This is a simplified implementation
  // In a real implementation, use a markdown parser
  
  // Extract title
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled Document';
  
  // Extract sections (h2 headings)
  const sections = [];
  const sectionMatches = markdown.match(/^##\s+(.+)$[^#]+/gm);
  
  if (sectionMatches) {
    sectionMatches.forEach(sectionMatch => {
      const headingMatch = sectionMatch.match(/^##\s+(.+)$/m);
      const section = {
        title: headingMatch ? headingMatch[1] : 'Untitled Section',
        content: sectionMatch.replace(/^##\s+.+$/m, '').trim()
      };
      sections.push(section);
    });
  }
  
  // Extract code examples
  const examples = [];
  const codeMatches = markdown.match(/```([a-z]+)\n([\s\S]+?)```/g);
  
  if (codeMatches) {
    codeMatches.forEach(codeMatch => {
      const languageMatch = codeMatch.match(/```([a-z]+)/);
      const codeContentMatch = codeMatch.match(/```[a-z]+\n([\s\S]+?)```/);
      
      if (languageMatch && codeContentMatch) {
        examples.push({
          language: languageMatch[1],
          code: codeContentMatch[1]
        });
      }
    });
  }
  
  return {
    title,
    sections,
    examples
  };
};

/**
 * Generate HTML documentation from markdown
 * 
 * @param {string} markdown - Markdown content
 * @returns {string} Generated HTML
 */
export const generateHtml = (markdown) => {
  // This is a simplified implementation
  // In a real implementation, use a markdown parser
  
  let html = markdown
    // Replace headings
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    // Replace code blocks
    .replace(/```([a-z]*)\n([\s\S]+?)```/g, (match, language, code) => {
      return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
    })
    // Replace inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Replace emphasis and strong
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Replace links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Replace lists
    .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
    // Replace paragraphs
    .replace(/^([^<#\-\*].+)$/gm, '<p>$1</p>')
    // Replace horizontal rules
    .replace(/^---$/gm, '<hr>');
  
  // Wrap lists
  html = html.replace(/(<li>[\s\S]+?)((?=<h)|$)/g, '<ul>$1</ul>$2');
  
  return html;
};

/**
 * Escape HTML characters
 * 
 * @param {string} html - HTML string to escape
 * @returns {string} Escaped HTML
 */
const escapeHtml = (html) => {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return html.replace(/[&<>"']/g, m => escapeMap[m]);
};

/**
 * Generate a comprehensive documentation page
 * 
 * @param {string} pageId - Page ID
 * @returns {string} Generated HTML
 */
export const generateDocumentationPage = (pageId) => {
  const page = getPage(pageId);
  if (!page) return `<p>Page with ID '${pageId}' not found</p>`;
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 { 
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h1 { border-bottom: 2px solid #eaecef; padding-bottom: 0.3em; }
    h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    code {
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    }
    pre {
      background-color: #f6f8fa;
      padding: 16px;
      overflow: auto;
      border-radius: 3px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    .category {
      display: inline-block;
      padding: 0.2em 0.5em;
      background-color: #eef2ff;
      border-radius: 3px;
      font-size: 0.9em;
      margin-bottom: 1rem;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 2rem;
    }
    .example {
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 1.5rem 0;
      overflow: hidden;
    }
    .example-header {
      background-color: #f6f8fa;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      font-weight: 600;
    }
    .example-description {
      padding: 10px 15px;
    }
    .example-code {
      margin: 0;
      border-radius: 0;
      border-top: 1px solid #ddd;
    }
    .tags {
      margin-top: 2rem;
    }
    .tag {
      display: inline-block;
      background-color: #e1e1e1;
      padding: 0.2em 0.6em;
      border-radius: 3px;
      font-size: 0.9em;
      margin-right: 0.5em;
      margin-bottom: 0.5em;
    }
  </style>
</head>
<body>
  <main>
    <h1>${page.title}</h1>
    <div class="meta">
      <span class="category">${page.category}</span>
      <span>Last updated: ${new Date(page.lastUpdated).toLocaleDateString()}</span>
    </div>
    <p>${page.description}</p>
`;

  // Add page content
  html += generateHtml(page.content);
  
  // Add examples
  if (page.examples && page.examples.length > 0) {
    html += '<h2>Examples</h2>';
    
    page.examples.forEach(exampleId => {
      const example = getExample(exampleId);
      if (example) {
        html += `
      <div class="example">
        <div class="example-header">${example.title}</div>
        <div class="example-description">${example.description}</div>
        <pre class="example-code"><code class="language-${example.language}">${escapeHtml(example.code)}</code></pre>
      </div>
`;
      }
    });
  }
  
  // Add tags
  if (page.tags && page.tags.length > 0) {
    html += '<div class="tags">';
    page.tags.forEach(tag => {
      html += `<span class="tag">${tag}</span>`;
    });
    html += '</div>';
  }
  
  html += `
  </main>
</body>
</html>`;

  return html;
};

/**
 * Generate a complete documentation site
 * 
 * @returns {Object} Generated site
 */
export const generateDocumentationSite = () => {
  const site = {
    index: '',
    siteMap: generateSiteMap(),
    pages: {}
  };
  
  // Generate index page
  let indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 250px 1fr;
      grid-gap: 30px;
    }
    h1, h2, h3, h4 { 
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }
    h1 { border-bottom: 2px solid #eaecef; padding-bottom: 0.3em; }
    h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    .sidebar {
      background-color: #f6f8fa;
      padding: 20px;
      border-radius: 4px;
      border: 1px solid #e1e4e8;
    }
    .sidebar-section {
      margin-bottom: 1.5rem;
    }
    .sidebar-section-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .sidebar ul {
      list-style: none;
      padding-left: 0;
      margin-top: 0.5rem;
    }
    .sidebar li {
      margin-bottom: 0.5rem;
    }
    .sidebar a {
      text-decoration: none;
      color: #0366d6;
    }
    .sidebar a:hover {
      text-decoration: underline;
    }
    .main-content {
      padding: 20px;
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #e1e4e8;
    }
    .card-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      grid-gap: 20px;
      margin-top: 1.5rem;
    }
    .card {
      background-color: #fff;
      border: 1px solid #e1e4e8;
      border-radius: 4px;
      padding: 20px;
      transition: box-shadow 0.3s ease;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
    }
    .card-description {
      margin-bottom: 0;
      color: #586069;
    }
    .card-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <h2>Documentation</h2>
`;

  // Add navigation to sidebar
  site.siteMap.categories.forEach(category => {
    indexHtml += `
    <div class="sidebar-section">
      <div class="sidebar-section-title">${category.name}</div>
      <ul>
`;

    category.pages.forEach(page => {
      indexHtml += `        <li><a href="${page.path}">${page.title}</a></li>\n`;
    });

    indexHtml += `      </ul>
    </div>
`;
  });

  indexHtml += `  </aside>
  <main class="main-content">
    <h1>Documentation</h1>
    <p>Welcome to the documentation site. Use the navigation on the left to browse documentation by category.</p>
`;

  // Add category sections with cards
  site.siteMap.categories.forEach(category => {
    indexHtml += `
    <h2>${category.name}</h2>
    <div class="card-container">
`;

    category.pages.forEach(page => {
      const fullPage = getPage(page.id);
      
      indexHtml += `
      <a href="${page.path}" class="card-link">
        <div class="card">
          <h3 class="card-title">${page.title}</h3>
          <p class="card-description">${fullPage.description}</p>
        </div>
      </a>
`;
    });

    indexHtml += `    </div>
`;
  });

  indexHtml += `  </main>
</body>
</html>`;

  site.index = indexHtml;

  // Generate individual pages
  Object.keys(documentationPages).forEach(pageId => {
    site.pages[pageId] = generateDocumentationPage(pageId);
  });

  return site;
};

/**
 * Create a user guide page using a template
 * 
 * @param {Object} options - Guide options
 * @param {string} options.id - Guide ID
 * @param {string} options.title - Guide title
 * @param {string} options.description - Guide description
 * @param {string} options.category - Guide category
 * @param {Array<Object>} options.sections - Guide sections
 * @param {Array<string>} options.tags - Guide tags
 * @returns {string} Generated guide page content in markdown format
 */
export const createUserGuide = ({
  id,
  title,
  description,
  category,
  sections = [],
  tags = []
}) => {
  let content = `# ${title}\n\n${description}\n\n`;
  
  // Add sections
  sections.forEach(section => {
    content += `## ${section.title}\n\n${section.content}\n\n`;
    
    // Add section examples
    if (section.examples && section.examples.length > 0) {
      section.examples.forEach(example => {
        content += `### Example: ${example.title}\n\n${example.description}\n\n`;
        content += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
      });
    }
  });
  
  // Register the page
  registerPage({
    id,
    title,
    description,
    category,
    content,
    tags,
    examples: [],
    order: 0,
    lastUpdated: new Date()
  });
  
  return content;
};

/**
 * Create a component documentation page
 * 
 * @param {Object} component - Component information
 * @param {string} component.name - Component name
 * @param {string} component.description - Component description
 * @param {Array<Object>} component.props - Component props
 * @param {Array<Object>} component.examples - Component examples
 * @returns {string} Generated component documentation in markdown format
 */
export const createComponentDoc = ({
  name,
  description,
  props = [],
  examples = []
}) => {
  let content = `# ${name}\n\n${description}\n\n`;
  
  // Add props section
  if (props.length > 0) {
    content += `## Props\n\n`;
    content += `| Name | Type | Required | Default | Description |\n`;
    content += `| ---- | ---- | -------- | ------- | ----------- |\n`;
    
    props.forEach(prop => {
      const defaultValue = prop.defaultValue !== undefined ? `\`${prop.defaultValue}\`` : '-';
      content += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${defaultValue} | ${prop.description} |\n`;
    });
    
    content += `\n`;
  }
  
  // Add examples
  if (examples.length > 0) {
    content += `## Examples\n\n`;
    
    examples.forEach((example, index) => {
      content += `### Example ${index + 1}: ${example.title}\n\n`;
      content += `${example.description}\n\n`;
      content += `\`\`\`${example.language || 'jsx'}\n${example.code}\n\`\`\`\n\n`;
      
      // Register the example
      registerExample({
        id: `${name.toLowerCase()}-example-${index + 1}`,
        title: example.title,
        description: example.description,
        code: example.code,
        language: example.language || 'jsx'
      });
    });
  }
  
  // Register the page
  registerPage({
    id: name.toLowerCase(),
    title: name,
    description,
    category: 'Components',
    content,
    tags: ['component', ...name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)],
    examples: examples.map((_, index) => `${name.toLowerCase()}-example-${index + 1}`),
    order: 0,
    lastUpdated: new Date()
  });
  
  return content;
};

export default {
  registerPage,
  registerExample,
  getPage,
  getCategory,
  getAllCategories,
  getPagesByCategory,
  getAllPages,
  getExample,
  getAllExamples,
  searchPages,
  generateSiteMap,
  parseMarkdown,
  generateHtml,
  generateDocumentationPage,
  generateDocumentationSite,
  createUserGuide,
  createComponentDoc
};