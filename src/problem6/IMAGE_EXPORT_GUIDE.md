# 📸 Architecture Diagram Export Instructions

## How to Create the Image for README

Since the README references `architecture-diagram.png`, you need to export the draw.io file as an image.

### Option 1: Using draw.io Website (Recommended)
1. Go to [app.diagrams.net](https://app.diagrams.net) 
2. Open the `architecture.drawio` file
3. Go to **File** → **Export as** → **PNG**
4. Choose these settings:
   - **Zoom**: 100%
   - **Border Width**: 10
   - **Transparent Background**: ✅ Checked
   - **Selection Only**: ❌ Unchecked
5. Save as `architecture-diagram.png` in the same folder

### Option 2: Using VS Code Extension
1. Install "Draw.io Integration" extension in VS Code
2. Open `architecture.drawio` file
3. Right-click → **Export** → **PNG**
4. Save as `architecture-diagram.png`

### Option 3: Command Line (if you have draw.io desktop)
```bash
# Navigate to the problem6 folder
cd ./code-challenge/src/problem6

# Export using draw.io CLI (if installed)
drawio -x -f png -o architecture-diagram.png architecture.drawio
```

### Alternative: Use the Visual Text Diagram

If you prefer not to export an image, you can update the README to reference the text-based diagram instead:

```markdown
### Architecture Diagram

See the visual representation in [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md#system-architecture-diagram)

```ascii
                                    [Users]
                                       |
                                   [CDN Layer]
                                       |
                               [API Gateway]
                                   |   |   |
                    +--------------+   |   +--------------+
                    |                  |                  |
            [Availability Zone 1]  [Availability Zone 2]  [Availability Zone 3]
                    |                  |                  |
            +-------+-------+  +-------+-------+  +-------+-------+
            |       |       |  |       |       |  |       |       |
       [Score] [User] [Notif] [Score] [User] [Notif] [Score] [User] [Notif]
       Service Service Service Service Service Service Service Service Service
            |       |       |  |       |       |  |       |       |
            +-------+-------+--+-------+-------+--+-------+-------+
                           |           |           |
                      [Event Bus - Kafka Cluster]
                           |           |           |
                      [Redis Cache Cluster]
                           |           |           |
            +-------+-------+--+-------+-------+--+-------+-------+
            |       |       |  |       |       |  |       |       |
        [Primary]  [DB]   [DB] [Read]  [DB]   [DB] [Read]  [DB]   [DB]
        Database  Shard1 Shard2 Replica Shard3 Shard4 Replica Shard5 Shard6
```
```

## Current Status
- ✅ Draw.io file created: `architecture.drawio`
- ⏳ PNG export needed: `architecture-diagram.png` 
- ✅ Text diagram available: `ARCHITECTURE_DIAGRAM.md`
- ✅ README updated to reference image

## Next Steps
1. Export the PNG image using one of the methods above
2. Verify the image displays correctly in the README
3. Optionally adjust image size if needed
