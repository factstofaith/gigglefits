const fs = require('fs');
const path = require('path');

// Function to create a simple HTML from Markdown
// This is a very basic implementation - real markdown parsers are more complex
function markdownToHtml(markdown) {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n';
    html += '<meta charset="UTF-8">\n';
    html += '<style>\n';
    html += 'body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }\n';
    html += 'h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }\n';
    html += 'h2 { color: #3498db; margin-top: 30px; }\n';
    html += 'h3 { color: #2980b9; }\n';
    html += 'code { background: #f8f8f8; padding: 2px 5px; border-radius: 3px; }\n';
    html += 'pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }\n';
    html += 'table { border-collapse: collapse; width: 100%; margin: 20px 0; }\n';
    html += 'table, th, td { border: 1px solid #ddd; }\n';
    html += 'th, td { padding: 12px; text-align: left; }\n';
    html += 'th { background-color: #f2f2f2; }\n';
    html += 'blockquote { border-left: 4px solid #ccc; padding-left: 15px; color: #555; }\n';
    html += '</style>\n';
    html += '</head>\n<body>\n';

    // Very basic markdown to HTML conversion
    // Headers
    markdown = markdown.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    markdown = markdown.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    markdown = markdown.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    markdown = markdown.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    markdown = markdown.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
    markdown = markdown.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
    
    // Bold and Italic
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists - very basic
    markdown = markdown.replace(/^- (.*?)$/gm, '<li>$1</li>');
    markdown = markdown.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Links
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Code blocks - very basic
    markdown = markdown.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Inline code
    markdown = markdown.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Paragraphs - very basic approach
    markdown = markdown.replace(/^(?!<[h|u|l|p|b])(.*?)$/gm, '<p>$1</p>');
    
    // Replace newlines with breaks in paragraphs
    markdown = markdown.replace(/\n\n/g, '</p><p>');
    
    html += markdown;
    html += '</body>\n</html>';
    
    return html;
}

function createPdf() {
    const files = [
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

    console.log("Creating HTML versions of the reports...");
    
    for (const file of files) {
        try {
            const markdown = fs.readFileSync(file.input, 'utf8');
            const html = markdownToHtml(markdown);
            const htmlFile = file.input.replace('.md', '.html');
            
            fs.writeFileSync(htmlFile, html);
            console.log(`Created HTML version: ${htmlFile}`);
            
            // Copy the HTML to desktop as well
            const desktopHtmlPath = path.join('/home/ai-dev/Desktop', htmlFile);
            fs.writeFileSync(desktopHtmlPath, html);
            console.log(`Copied to desktop: ${desktopHtmlPath}`);
            
            // Create a simplified PDF (really just an HTML file with .pdf extension for demo)
            const pdfPath = path.join('/home/ai-dev/Desktop', file.output);
            fs.writeFileSync(pdfPath, html);
            console.log(`Created PDF placeholder: ${pdfPath}`);
        } catch (error) {
            console.error(`Error processing ${file.input}:`, error);
        }
    }
    
    console.log("\nNote: These are HTML files with PDF extensions, not actual PDFs.");
    console.log("To create true PDFs, please install Pandoc and wkhtmltopdf, then run generate-reports.py");
}

createPdf();