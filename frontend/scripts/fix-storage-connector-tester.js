const fs = require('fs');
const path = require('path');

// Path to the StorageConnectorTester file
const filePath = path.resolve(__dirname, '../src/tests/integration/StorageConnectorTester.jsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the template literal syntax errors
content = content.replace(/etag: "\${Math\.random\(\)\.toString\(36\)\.substring\(2, 15\)}"`/g, 
                         'etag: `${Math.random().toString(36).substring(2, 15)}`');

// Fix any display name duplications
content = content.replace(/\/\/ Added display name\n  [a-zA-Z]+\.displayName = '[a-zA-Z]+';\n\n  \/\/ Added display name\n  [a-zA-Z]+\.displayName = '[a-zA-Z]+';\n/g, 
                          (match) => {
                            const lines = match.split('\n');
                            return lines.slice(0, 2).join('\n') + '\n';
                          });

// Save the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('Fixed StorageConnectorTester.jsx file');
