const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

// Configure marked for syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.warn('Highlight error:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// HTML template with modern styling
const htmlTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scoreboard API Module Specification</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 2rem;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin: 2rem 0 1rem 0;
            font-weight: 600;
        }
        
        h1 { font-size: 2rem; border-bottom: 3px solid #667eea; padding-bottom: 0.5rem; }
        h2 { font-size: 1.8rem; border-bottom: 2px solid #e9ecef; padding-bottom: 0.3rem; }
        h3 { font-size: 1.5rem; color: #495057; }
        h4 { font-size: 1.3rem; color: #6c757d; }
        
        p {
            margin: 1rem 0;
            font-size: 1rem;
        }
        
        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }
        
        li {
            margin: 0.5rem 0;
        }
        
        code {
            background: #f1f3f4;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
        }
        
        pre code {
            background: none;
            padding: 0;
            border-radius: 0;
        }
        
        blockquote {
            border-left: 4px solid #667eea;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6c757d;
            font-style: italic;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .highlight {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .warning {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            padding: 1rem;
            margin: 1rem 0;
            color: #721c24;
        }
        
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 4px;
            padding: 1rem;
            margin: 1rem 0;
            color: #155724;
        }
        
        .diagram-container {
            text-align: center;
            margin: 2rem 0;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .diagram-container img {
            max-width: 100%;
            height: auto;
            border: 1px solid #e9ecef;
            border-radius: 4px;
        }
        
        .diagram-caption {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #6c757d;
            font-style: italic;
        }
        
        .toc {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .toc h2 {
            margin-top: 0;
            color: #495057;
        }
        
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        
        .toc li {
            margin: 0.5rem 0;
        }
        
        .toc a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            
            .content {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            pre {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Scoreboard API Module Specification</h1>
            <p>Real-time scoreboard system with live updates and security measures</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p>Generated from README.md | Last updated: ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
</body>
</html>
`;

async function generateHTML() {
    try {
        console.log('Converting README.md to HTML...');
        
        // Read README.md
        const readmePath = path.join(__dirname, 'README.md');
        if (!fs.existsSync(readmePath)) {
            throw new Error('README.md not found');
        }
        
        let markdown = fs.readFileSync(readmePath, 'utf8');
        
        // Update diagram paths for HTML version
        markdown = markdown.replace(/diagrams\/generated\//g, 'diagrams/');
        
        // Convert markdown to HTML
        const htmlContent = marked(markdown);
        
        // Create docs directory
        const docsDir = path.join(__dirname, 'docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        // Generate HTML file
        const htmlPath = path.join(docsDir, 'index.html');
        const fullHTML = htmlTemplate(htmlContent);
        
        fs.writeFileSync(htmlPath, fullHTML);
        
        console.log('HTML documentation generated successfully!');
        console.log(`Output file: ${htmlPath}`);
        console.log('Open docs/index.html in your browser to view');
        
        // Copy generated diagrams to docs folder for HTML viewing
        const diagramsDir = path.join(__dirname, 'diagrams', 'generated');
        const docsDiagramsDir = path.join(docsDir, 'diagrams');
        
        if (fs.existsSync(diagramsDir)) {
            if (!fs.existsSync(docsDiagramsDir)) {
                fs.mkdirSync(docsDiagramsDir, { recursive: true });
            }
            
            const diagramFiles = fs.readdirSync(diagramsDir);
            for (const file of diagramFiles) {
                if (file.endsWith('.svg') || file.endsWith('.png')) {
                    const sourcePath = path.join(diagramsDir, file);
                    const destPath = path.join(docsDiagramsDir, file);
                    fs.copyFileSync(sourcePath, destPath);
                }
            }
            console.log('Diagrams copied to docs/diagrams/');
        }
        
    } catch (error) {
        console.error('Failed to generate HTML:', error.message);
        process.exit(1);
    }
}

// Run the script
generateHTML(); 