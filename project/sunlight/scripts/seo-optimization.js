/**
 * SEO Optimization Script
 * 
 * This script analyzes and improves SEO across the app:
 * - Checks for proper meta tags
 * - Analyzes document structure and semantic HTML
 * - Adds structured data where appropriate
 * - Optimizes headings and titles
 * - Ensures proper image attributes
 * 
 * Usage: node seo-optimization.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const PAGES_DIR = path.join(ROOT_DIR, 'pages');
const PUBLIC_DIR = path.resolve(ROOT_DIR, '../public');
const REPORTS_DIR = path.resolve(__dirname, '../reports/seo');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `seo-optimization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const AUTO_FIX = process.argv.includes('--fix');

// Create output and backup directories
fs.mkdirSync(REPORTS_DIR, { recursive: true });
if (AUTO_FIX) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
console.log(`📁 Created reports directory: ${REPORTS_DIR}`);
if (AUTO_FIX) console.log(`📁 Created backup directory: ${BACKUP_DIR}`);

// SEO checks definition
const seoChecks = {
  // Missing page title
  missingTitle: {
    description: 'Page should have a descriptive title',
    pattern: /<title>(?:\s*|App|React App|My App)<\/title>/g,
    severity: 'high',
  },
  
  // Missing meta description
  missingDescription: {
    description: 'Page should have a meta description',
    pattern: /<meta\s+name="description"/g,
    custom: true, // Will be checked differently
    severity: 'high',
  },
  
  // Missing heading structure
  improperHeadingStructure: {
    description: 'Pages should have a clear heading structure with a single h1',
    custom: true, // Will be checked differently
    severity: 'medium',
  },
  
  // Missing semantic HTML
  missingSemanticHTML: {
    description: 'Use semantic HTML elements instead of generic divs when appropriate',
    patterns: {
      divAsMain: /<div[^>]*(?:className|class)=["'][^"']*(?:main|content|container|page)[^"']*["'][^>]*>/g,
      divAsHeader: /<div[^>]*(?:className|class)=["'][^"']*(?:header|navbar|nav-bar|app-header)[^"']*["'][^>]*>/g,
      divAsFooter: /<div[^>]*(?:className|class)=["'][^"']*(?:footer|app-footer)[^"']*["'][^>]*>/g,
      divAsNav: /<div[^>]*(?:className|class)=["'][^"']*(?:nav|navigation|sidebar|menu)[^"']*["'][^>]*>/g,
      divAsSection: /<div[^>]*(?:className|class)=["'][^"']*(?:section|content-section)[^"']*["'][^>]*>/g,
      divAsArticle: /<div[^>]*(?:className|class)=["'][^"']*(?:article|post|card)[^"']*["'][^>]*>/g,
    },
    severity: 'medium',
  },
  
  // Missing alt text on images
  missingImageAlt: {
    description: 'Images should have descriptive alt text for SEO',
    pattern: /<img[^>]*(?!alt=["'][^"']{5,}["'])[^>]*>/g,
    severity: 'high',
  },
  
  // Missing lang attribute on HTML tag
  missingLangAttribute: {
    description: 'HTML element should have a lang attribute',
    pattern: /<html[^>]*(?!lang=)[^>]*>/g,
    severity: 'medium',
  },
  
  // Missing proper links (no text, unclear text)
  poorLinkText: {
    description: 'Links should have descriptive text (avoid "click here", "read more", etc.)',
    pattern: /<a[^>]*>(?:\s*|click here|read more|learn more|more|view|see more)<\/a>/gi,
    severity: 'medium',
  },
  
  // Missing structured data
  missingStructuredData: {
    description: 'Pages should include structured data for rich search results',
    custom: true, // Will be checked differently
    severity: 'medium',
  },
  
  // Missing canonical URL
  missingCanonical: {
    description: 'Pages should have a canonical URL',
    pattern: /<link\s+rel="canonical"/g,
    custom: true, // Will be checked differently
    severity: 'medium',
  },
  
  // Links without descriptive text
  linkedImagesWithoutAlt: {
    description: 'Images within links should have descriptive alt text',
    pattern: /<a[^>]*>\s*<img[^>]*(?!alt=["'][^"']{5,}["'])[^>]*>\s*<\/a>/g,
    severity: 'high',
  },
  
  // Missing mobile viewport meta tag
  missingViewport: {
    description: 'Pages should have a viewport meta tag for mobile optimization',
    pattern: /<meta\s+name="viewport"/g,
    custom: true, // Will be checked differently
    severity: 'high',
  },
};

// Fix functions for auto-fixing issues
const fixFunctions = {
  // Add proper page title
  addTitle: (match, filePath) => {
    // Extract page name from file path
    const fileName = path.basename(filePath, path.extname(filePath));
    const pageName = fileName
      .replace(/Page$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    
    return `<title>${pageName} | YourAppName</title>`;
  },
  
  // Convert div to appropriate semantic element
  convertToSemanticHTML: (match, type) => {
    switch (type) {
      case 'divAsMain':
        return match.replace(/<div/, '<main');
      case 'divAsHeader':
        return match.replace(/<div/, '<header');
      case 'divAsFooter':
        return match.replace(/<div/, '<footer');
      case 'divAsNav':
        return match.replace(/<div/, '<nav');
      case 'divAsSection':
        return match.replace(/<div/, '<section');
      case 'divAsArticle':
        return match.replace(/<div/, '<article');
      default:
        return match;
    }
  },
  
  // Add alt text to images
  addImageAlt: (match, filePath) => {
    if (match.includes('src="')) {
      // Extract the image name to create a meaningful alt text
      const srcMatch = match.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        const imagePath = srcMatch[1];
        const imageName = path.basename(imagePath, path.extname(imagePath))
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        return match.replace(/<img/, `<img alt="${imageName}"`);
      }
    }
    return match.replace(/<img/, '<img alt="Image"');
  },
  
  // Add lang attribute to HTML tag
  addLangAttribute: (match) => {
    return match.replace(/<html/, '<html lang="en"');
  },
  
  // Improve link text
  improveLinkText: (match) => {
    // Try to determine context from surrounding attributes
    const hrefMatch = match.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      const href = hrefMatch[1];
      const pathSegments = href.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        // Replace the link text
        return match.replace(/>(?:\s*|click here|read more|learn more|more|view|see more)<\/a>/i, `>${lastSegment}</a>`);
      }
    }
    
    // Default improvement
    return match.replace(/>(?:\s*|click here|read more|learn more|more|view|see more)<\/a>/i, '>View Details</a>');
  },
};

// Analyze an HTML file for SEO issues
function analyzeHTMLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    // Initialize results
    const issues = [];
    let updatedContent = content;
    let hasChanges = false;
    
    // Run each SEO check
    Object.entries(seoChecks).forEach(([checkName, check]) => {
      // Skip custom checks that don't use regex patterns
      if (check.custom) {
        // Custom check for description meta tag
        if (checkName === 'missingDescription' && !content.includes('<meta name="description"')) {
          issues.push({
            check: checkName,
            description: check.description,
            severity: check.severity,
            line: 1, // Header is usually at the top
            match: '<head> tag missing meta description',
          });
        }
        
        // Custom check for viewport meta tag
        if (checkName === 'missingViewport' && !content.includes('<meta name="viewport"')) {
          issues.push({
            check: checkName,
            description: check.description,
            severity: check.severity,
            line: 1, // Header is usually at the top
            match: '<head> tag missing viewport meta tag',
          });
        }
        
        // Custom check for canonical URL
        if (checkName === 'missingCanonical' && !content.includes('<link rel="canonical"')) {
          issues.push({
            check: checkName,
            description: check.description,
            severity: check.severity,
            line: 1, // Header is usually at the top
            match: '<head> tag missing canonical link',
          });
        }
        
        return;
      }
      
      // Handle checks with multiple patterns
      if (checkName === 'missingSemanticHTML') {
        Object.entries(check.patterns).forEach(([patternName, pattern]) => {
          const matches = [];
          let match;
          
          while ((match = pattern.exec(content)) !== null) {
            matches.push({
              match: match[0],
              index: match.index,
              patternName,
            });
          }
          
          // Reset pattern lastIndex
          pattern.lastIndex = 0;
          
          // Process each match
          matches.forEach(({ match, index, patternName }) => {
            const lineNumber = content.substring(0, index).split('\n').length;
            
            // Add issue to report
            issues.push({
              check: `${checkName}-${patternName}`,
              description: `${check.description} (${patternName})`,
              severity: check.severity,
              line: lineNumber,
              match: match.length > 60 ? match.substring(0, 60) + '...' : match,
            });
            
            // Apply fix if auto-fix is enabled
            if (AUTO_FIX) {
              const fixed = fixFunctions.convertToSemanticHTML(match, patternName);
              if (fixed !== match) {
                updatedContent = updatedContent.replace(match, fixed);
                hasChanges = true;
              }
            }
          });
        });
        
        return;
      }
      
      // Regular pattern checks
      const { pattern, description, severity } = check;
      let matches = [];
      let match;
      
      // Special case for negative patterns (missing description, canonical, viewport)
      if (checkName === 'missingDescription' || checkName === 'missingCanonical' || checkName === 'missingViewport') {
        if (pattern.test(content)) {
          // If the pattern is found, there's no issue
          pattern.lastIndex = 0;
          return;
        }
        
        // If the pattern is not found, add an issue
        issues.push({
          check: checkName,
          description,
          severity,
          line: 1, // Header is usually at the top
          match: `<head> tag missing ${checkName.replace('missing', '').toLowerCase()}`,
        });
        
        return;
      }
      
      // Process regular patterns
      while ((match = pattern.exec(content)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
        });
      }
      
      // Reset pattern lastIndex
      pattern.lastIndex = 0;
      
      // Process each match
      matches.forEach(({ match, index }) => {
        const lineNumber = content.substring(0, index).split('\n').length;
        
        // Add issue to report
        issues.push({
          check: checkName,
          description,
          severity,
          line: lineNumber,
          match: match.length > 60 ? match.substring(0, 60) + '...' : match,
        });
        
        // Apply fix if auto-fix is enabled and a fix function exists
        if (AUTO_FIX) {
          const fixFunction = fixFunctions[`add${checkName.replace(/^missing/, '')}`] || 
                              fixFunctions[`improve${checkName.replace(/^poor/, '')}`];
          
          if (fixFunction) {
            const fixed = fixFunction(match, filePath);
            if (fixed !== match) {
              updatedContent = updatedContent.replace(match, fixed);
              hasChanges = true;
            }
          }
        }
      });
    });
    
    // Check for improper heading structure
    if (content.includes('<h')) {
      const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
      
      if (h1Count === 0) {
        issues.push({
          check: 'improperHeadingStructure',
          description: 'Page is missing an h1 heading',
          severity: 'high',
          line: 1,
          match: 'No h1 heading found',
        });
      } else if (h1Count > 1) {
        issues.push({
          check: 'improperHeadingStructure',
          description: 'Page has multiple h1 headings',
          severity: 'medium',
          line: 1,
          match: `${h1Count} h1 headings found`,
        });
      }
    }
    
    // If there are changes and auto-fix is enabled, backup and update the file
    if (hasChanges && AUTO_FIX) {
      const backupPath = path.join(BACKUP_DIR, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(filePath, backupPath);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
    
    return {
      filePath,
      relativePath,
      issues,
      fixedIssues: hasChanges ? issues.length : 0,
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return {
      filePath,
      relativePath: path.relative(ROOT_DIR, filePath),
      error: error.message,
      issues: [],
    };
  }
}

// Generate an SEO optimization report
function generateSEOReport(results) {
  // Count total issues by type and severity
  const issueCounts = {
    total: 0,
    fixed: 0,
    byType: {},
    bySeverity: {
      high: 0,
      medium: 0,
      low: 0,
    },
  };
  
  // Process all issues across all files
  results.forEach(result => {
    if (result.issues) {
      result.issues.forEach(issue => {
        issueCounts.total++;
        
        // Count by type
        issueCounts.byType[issue.check] = (issueCounts.byType[issue.check] || 0) + 1;
        
        // Count by severity
        issueCounts.bySeverity[issue.severity] = (issueCounts.bySeverity[issue.severity] || 0) + 1;
      });
      
      // Count fixed issues
      issueCounts.fixed += result.fixedIssues || 0;
    }
  });
  
  // Generate markdown report
  const report = `# SEO Optimization Report

Generated: ${new Date().toISOString()}

## Summary

Total files analyzed: ${results.length}
Total SEO issues found: ${issueCounts.total}
${AUTO_FIX ? `Issues automatically fixed: ${issueCounts.fixed}` : ''}

### Issues by Severity

| Severity | Count |
|----------|-------|
| High     | ${issueCounts.bySeverity.high} |
| Medium   | ${issueCounts.bySeverity.medium} |
| Low      | ${issueCounts.bySeverity.low} |

### Issues by Type

| Issue Type | Count | Description |
|------------|-------|-------------|
${Object.entries(issueCounts.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => {
    // Extract base check name without pattern specifics
    const baseType = type.split('-')[0];
    const description = seoChecks[baseType]?.description || '';
    return `| ${type} | ${count} | ${description} |`;
  })
  .join('\n')}

## Files with SEO Issues

${results
  .filter(result => result.issues && result.issues.length > 0)
  .sort((a, b) => b.issues.length - a.issues.length)
  .map(result => {
    return `### ${result.relativePath} (${result.issues.length} issues)

${result.issues
  .sort((a, b) => a.line - b.line)
  .map(issue => {
    return `- **Line ${issue.line}** - ${issue.check} (${issue.severity}): ${issue.description}
  \`${issue.match}\``;
  })
  .join('\n\n')}
`;
  })
  .join('\n\n')}

## SEO Best Practices

### Meta Tags

Every page should include the following meta tags:

\`\`\`html
<head>
  <title>Page Title | Site Name</title>
  <meta name="description" content="A concise and compelling description of the page content." />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://yourdomain.com/page-url" />
</head>
\`\`\`

### Semantic HTML

Use semantic HTML elements instead of generic divs:

\`\`\`html
<!-- Bad -->
<div class="header">...</div>
<div class="navigation">...</div>
<div class="main-content">...</div>
<div class="footer">...</div>

<!-- Good -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>
\`\`\`

### Heading Structure

Each page should have a clear heading structure:

\`\`\`html
<h1>Main Page Title</h1> <!-- Only one h1 per page -->
<h2>Major Section</h2>
  <h3>Subsection</h3>
  <h3>Another Subsection</h3>
<h2>Another Major Section</h2>
\`\`\`

### Images

All images should have descriptive alt text:

\`\`\`html
<!-- Bad -->
<img src="product.jpg" />

<!-- Good -->
<img src="product.jpg" alt="Premium Wireless Headphones with Noise Cancellation" />
\`\`\`

### Link Text

Links should use descriptive text:

\`\`\`html
<!-- Bad -->
<a href="/product/123">Click here</a>

<!-- Good -->
<a href="/product/123">View Premium Wireless Headphones</a>
\`\`\`

### Structured Data

Add structured data to help search engines understand your content:

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation.",
  "image": "https://yourdomain.com/images/headphones.jpg",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD"
  }
}
</script>
\`\`\`

## Resources

- [Google's SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Structured Data Testing Tool](https://validator.schema.org/)
- [Meta Tags Best Practices](https://moz.com/learn/seo/meta-description)
- [Semantic HTML Guide](https://www.w3schools.com/html/html5_semantic_elements.asp)
- [Image SEO Best Practices](https://moz.com/learn/seo/alt-text)
`;

  // Write report file
  const reportPath = path.join(REPORTS_DIR, 'seo-optimization-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  return {
    reportPath,
    issueCounts,
  };
}

// Generate command-line summary output
function printSummary(issueCounts) {
  console.log('\n📊 SEO Optimization Summary:');
  console.log(`- Total issues found: ${issueCounts.total}`);
  console.log(`- High severity issues: ${issueCounts.bySeverity.high}`);
  console.log(`- Medium severity issues: ${issueCounts.bySeverity.medium}`);
  console.log(`- Low severity issues: ${issueCounts.bySeverity.low}`);
  
  if (AUTO_FIX) {
    console.log(`- Issues automatically fixed: ${issueCounts.fixed}`);
  }
  
  console.log('\nTop issue types:');
  Object.entries(issueCounts.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
}

// Create a sample structured data snippet for a product page
function createStructuredDataSnippet() {
  const structuredDataPath = path.join(REPORTS_DIR, 'structured-data-examples.js');
  
  const exampleContent = `/**
 * Structured Data Examples
 * 
 * This file contains examples of structured data for different page types.
 * Add these snippets to your pages to improve SEO and enable rich search results.
 */

// Product Page Structured Data
export const productStructuredData = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl,
    description: product.description,
    sku: product.sku,
    mpn: product.mpn,
    brand: {
      '@type': 'Brand',
      name: product.brandName,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Your Company Name',
      }
    },
    // Optional: Add reviews if available
    review: product.reviews?.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
      },
      reviewBody: review.text,
      datePublished: review.date,
    })) || [],
  };
};

// Article Page Structured Data
export const articleStructuredData = (article) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.imageUrl,
    datePublished: article.publishDate,
    dateModified: article.updateDate,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Company Name',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourdomain.com/logo.png',
      },
    },
    description: article.summary,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
};

// FAQ Page Structured Data
export const faqStructuredData = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

// Organization Structured Data
export const organizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Company Name',
    url: 'https://yourdomain.com',
    logo: 'https://yourdomain.com/logo.png',
    sameAs: [
      'https://www.facebook.com/yourcompany',
      'https://www.twitter.com/yourcompany',
      'https://www.linkedin.com/company/yourcompany',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-123-456-7890',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
};

// How to use:
/*
import { productStructuredData } from './structured-data-examples';

const ProductPage = ({ product }) => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData(product))
        }}
      />
      
      {/* Rest of your component */}
    </>
  );
};
*/
`;

  fs.writeFileSync(structuredDataPath, exampleContent, 'utf8');
  console.log(`✅ Created structured data examples at: ${structuredDataPath}`);
}

// Create an SEO helper component for React
function createSEOHelperComponent() {
  const seoHelperPath = path.join(ROOT_DIR, 'components', 'common', 'SEO.jsx');
  const seoHelperDirPath = path.dirname(seoHelperPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(seoHelperDirPath)) {
    fs.mkdirSync(seoHelperDirPath, { recursive: true });
  }
  
  const componentContent = `/**
 * SEO Component
 * 
 * A reusable component for managing SEO-related tags in React applications.
 * Use this component on each page to set title, description, and other meta tags.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet'; // Note: You may need to install react-helmet

const SEO = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  structuredData = null,
  noIndex = false,
}) => {
  const siteName = 'Your App Name';
  const fullTitle = title ? \`\${title} | \${siteName}\` : siteName;
  const defaultDescription = 'Default description for your website';
  const siteUrl = 'https://yourdomain.com';
  const fullCanonical = canonical ? canonical : typeof window !== 'undefined' ? window.location.href : '';
  const defaultImage = '/logo.png';
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={fullCanonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={image || \`\${siteUrl}\${defaultImage}\`} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || \`\${siteUrl}\${defaultImage}\`} />
      
      {/* Structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  structuredData: PropTypes.object,
  noIndex: PropTypes.bool,
};

export default SEO;

/* 
Usage Example:

import SEO from '../components/common/SEO';
import { productStructuredData } from '../utils/structured-data';

const ProductPage = ({ product }) => {
  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        image={product.imageUrl}
        type="product"
        structuredData={productStructuredData(product)}
      />
      
      {/* Rest of your component */}
    </>
  );
};
*/
`;

  if (AUTO_FIX) {
    // Check if file exists
    if (fs.existsSync(seoHelperPath)) {
      // Backup existing file
      const backupPath = path.join(BACKUP_DIR, 'components', 'common', 'SEO.jsx');
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(seoHelperPath, backupPath);
    }
    
    // Write the new file
    fs.writeFileSync(seoHelperPath, componentContent, 'utf8');
    console.log(`✅ Created SEO helper component at: ${seoHelperPath}`);
  } else {
    // Just write to reports directory
    const reportPath = path.join(REPORTS_DIR, 'SEO.jsx.example');
    fs.writeFileSync(reportPath, componentContent, 'utf8');
    console.log(`✅ Created SEO helper component example at: ${reportPath}`);
  }
}

// Main function
function main() {
  console.log('🔍 Running SEO optimization...');
  
  // Find all HTML, JSX, and JS files that might contain HTML
  const pageFiles = glob.sync(`${PAGES_DIR}/**/*.{js,jsx}`);
  const publicHtmlFiles = glob.sync(`${PUBLIC_DIR}/**/*.html`);
  const allFiles = [...pageFiles, ...publicHtmlFiles];
  
  console.log(`Found ${allFiles.length} files to analyze...`);
  
  // Analyze each file
  const results = allFiles.map(filePath => analyzeHTMLFile(filePath));
  
  // Generate report
  const { reportPath, issueCounts } = generateSEOReport(results);
  
  // Create additional resources
  createStructuredDataSnippet();
  createSEOHelperComponent();
  
  // Print summary
  printSummary(issueCounts);
  
  console.log(`\n✅ SEO optimization report generated at: ${reportPath}`);
  
  // Provide next steps
  console.log('\nNext steps:');
  console.log('1. Review the SEO optimization report');
  console.log('2. Use the SEO helper component in your page components');
  console.log('3. Implement structured data for important pages');
  console.log('4. Fix remaining SEO issues manually');
  console.log('5. Test your pages with Google Search Console tools');
  
  return issueCounts;
}

// Run the main function
const issueCounts = main();