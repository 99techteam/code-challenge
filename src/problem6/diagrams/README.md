# Diagrams

This folder contains all Mermaid diagram source files and generated images for the Scoreboard API specification.

## Structure

```
diagrams/
├── README.md                    # This file
├── scoreboard-flow.mermaid      # Mermaid source for scoreboard flow diagram
└── generated/                   # Generated image files
    └── scoreboard-flow.png      # Generated PNG image
```

## Usage

### Source Files (`.mermaid`)
- Place all Mermaid diagram source files in this folder
- Use descriptive names for the files
- Follow the naming convention: `{diagram-name}.mermaid`

### Generated Images (`generated/`)
- All generated images are stored in the `generated/` subfolder
- Images are automatically generated from Mermaid source files
- Supported formats: PNG, SVG, JPG, JPEG

## Adding New Diagrams

1. Create a new `.mermaid` file in this folder
2. Update the `generate-diagram.js` script to include the new diagram
3. Run `yarn generate-diagram` to generate the image
4. Update the main `README.md` to reference the new diagram (not in this file)

## File Naming Convention

- **Source files**: `{diagram-name}.mermaid`
- **Generated files**: `{diagram-name}.{format}` (e.g., `.png`, `.svg`)

## Git Ignore

The `generated/` folder is ignored by Git to avoid committing generated files. Only source files (`.mermaid`) should be committed to version control. 