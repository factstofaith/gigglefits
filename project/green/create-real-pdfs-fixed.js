const markdownpdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

// Configuration
const reports = [
    {
        input: 'TAP_Executive_Assessment_Report.md',
        output: 'PDF_TAP_Executive_Assessment_Report.pdf',
        title: 'TAP Integration Platform: Executive Assessment'
    },
    {
        input: 'TAP_Technical_Assessment_Report.md',
        output: 'PDF_TAP_Technical_Assessment_Report.pdf',
        title: 'TAP Integration Platform: Technical Assessment'
    }
];

// CSS styling for the PDF
const cssPath = path.join(__dirname, 'pdf-style.css');
fs.writeFileSync(cssPath, `
body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
    color: #2c3e50;
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
}

h1 {
    font-size: 28px;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
}

h2 {
    font-size: 24px;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
}

h3 {
    font-size: 20px;
}

h4 {
    font-size: 16px;
}

p, li {
    margin-bottom: 16px;
    font-size: 14px;
}

pre {
    background-color: #f6f8fa;
    border-radius: 3px;
    padding: 16px;
    overflow: auto;
    white-space: pre-wrap;
}

code {
    background-color: #f6f8fa;
    border-radius: 3px;
    padding: 3px 6px;
    font-family: 'Courier New', Courier, monospace;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
}

table, th, td {
    border: 1px solid #ddd;
}

th, td {
    padding: 12px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
}

blockquote {
    margin: 0;
    padding: 0 15px;
    color: #777;
    border-left: 4px solid #ddd;
}

img {
    max-width: 100%;
}

a {
    color: #0366d6;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
}
`);

// PDF generation options
const options = {
    cssPath: cssPath,
    paperBorder: '1cm',
    paperFormat: 'Letter',
    remarkable: {
        html: true,
        breaks: true,
        typographer: true,
    }
    // Removed the problematic preProcessHtml function
};

// Process each report
let completedCount = 0;
console.log("Starting PDF generation...");

reports.forEach(report => {
    console.log(`Processing ${report.input}...`);
    
    // Read Markdown file
    const markdown = fs.readFileSync(report.input, 'utf-8');
    
    // Add title and metadata to the beginning
    const markdownWithMeta = `# ${report.title}\n\n*Generated on ${new Date().toLocaleString()}*\n\n${markdown}`;
    
    // Create a temporary file with metadata
    const tempFilePath = report.input + '.temp';
    fs.writeFileSync(tempFilePath, markdownWithMeta);
    
    // Define output paths
    const projectOutput = path.join(__dirname, report.output);
    const desktopOutput = path.join('/home/ai-dev/Desktop', report.output);
    
    // Generate PDF
    markdownpdf(options)
        .from(tempFilePath)
        .to(projectOutput, function() {
            console.log(`Created PDF: ${projectOutput}`);
            
            // Copy to desktop
            fs.copyFileSync(projectOutput, desktopOutput);
            console.log(`Copied to desktop: ${desktopOutput}`);
            
            // Clean up temporary file
            fs.unlinkSync(tempFilePath);
            
            // Track completion
            completedCount++;
            if (completedCount === reports.length) {
                console.log("\nPDF generation complete!");
                console.log("The PDFs are now available on your desktop.");
            }
        });
});