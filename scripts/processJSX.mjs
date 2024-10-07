// process-jsx.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processJSXFile(filePath) {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace HTML comments with JSX comments
  content = content.replace(/<!--\s*(.*?)\s*-->/gs, '{/* $1 */}');

  // Define attribute conversions
  const attributeConversions = {
    'class': 'className',
    'for': 'htmlFor',
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'maxlength': 'maxLength',
    'contenteditable': 'contentEditable',
    'xmlns:xlink': 'xmlnsXlink',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'xlink:href': 'xlinkHref',
  };

  // Convert attributes
  for (const [oldAttr, newAttr] of Object.entries(attributeConversions)) {
    const regex = new RegExp(`${oldAttr}=`, 'g');
    content = content.replace(regex, `${newAttr}=`);
  }

  // Convert style attribute
  content = content.replace(/style="([^"]*)"/g, (match, styles) => {
    const styleObject = styles.split(';')
      .filter(style => style.trim())
      .map(style => {
        let [key, value] = style.split(':').map(part => part.trim());
        key = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${key}: '${value}'`;
      })
      .join(', ');
    return `style={{${styleObject}}}`;
  });

  // Convert non-self-closing input and img tags to self-closing
  content = content.replace(/<(input|img)([^>]*)>/g, (match, tag, attributes) => {
    // Remove any trailing slash if it exists
    attributes = attributes.replace(/\s*\/$/, '');
    return `<${tag}${attributes} />`;
  });

  // Remove newlines before ">" or "/>"
  content = content.replace(/\s+>/g, '>');
  content = content.replace(/\s+\/>/g, '/>');

  // Write the processed content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

// Check if a file path is provided
if (process.argv.length < 3) {
  console.log('Please provide a .jsx file path');
  process.exit(1);
}

const filePath = process.argv[2];

// Check if the file exists
if (!fs.existsSync(filePath)) {
  console.log('File does not exist');
  process.exit(1);
}

// Check if it's a .jsx file
if (path.extname(filePath) !== '.js' && path.extname(filePath) !== '.jsx') {
  console.log('Please provide a .jsx or .js file');
  process.exit(1);
}

// Process the file
processJSXFile(filePath);