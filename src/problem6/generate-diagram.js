const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generateDiagram() {
    try {
        console.log('Generating diagrams from Mermaid files...');
        
        // Find all .mermaid files in the diagrams directory
        const diagramsDir = path.join(__dirname, 'diagrams');
        const outputDir = path.join(__dirname, 'diagrams', 'generated');
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Get all .mermaid files
        const mermaidFiles = [];
        if (fs.existsSync(diagramsDir)) {
            const files = fs.readdirSync(diagramsDir);
            files.forEach(file => {
                if (file.endsWith('.mermaid')) {
                    const inputFile = path.join(diagramsDir, file);
                    const outputFile = path.join(outputDir, file.replace('.mermaid', '.svg'));
                    const name = file.replace('.mermaid', '');
                    
                    mermaidFiles.push({
                        input: inputFile,
                        output: outputFile,
                        name: name
                    });
                }
            });
        }
        
        if (mermaidFiles.length === 0) {
            console.log('No .mermaid files found in diagrams directory');
            return;
        }
        
        console.log(`Found ${mermaidFiles.length} .mermaid files to process`);
        
        for (const diagram of mermaidFiles) {
            // Check if input file exists
            if (!fs.existsSync(diagram.input)) {
                console.warn(`Input file not found: ${diagram.input}`);
                continue;
            }
            
            // Use mmdc (mermaid-cli) to generate SVG with high quality
            const command = `yarn mmdc -i ${diagram.input} -o ${diagram.output} -b white`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error generating ${diagram.name}:`, error);
                    return;
                }
                if (stderr) {
                    console.warn(`Warnings for ${diagram.name}:`, stderr);
                }
                
                console.log(`${diagram.name} generated successfully!`);
                console.log(`Output file: ${diagram.output}`);
            });
        }
        
    } catch (error) {
        console.error('Failed to generate diagrams:', error.message);
        process.exit(1);
    }
}

// Run the script
generateDiagram(); 