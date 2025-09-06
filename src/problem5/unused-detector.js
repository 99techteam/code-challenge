#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

class UnusedDetector {
  constructor(options = {}) {
    this.allExports = new Map() // symbol -> {file, line, type}
    this.allUsages = new Set()
    this.ignorePatterns = options.ignorePatterns || ['libs/share/']
  }

  // Find all apps
  findApps() {
    const apps = []
    const appsDir = 'apps'

    if (!fs.existsSync(appsDir)) return apps

    fs.readdirSync(appsDir).forEach((dir) => {
      const mainFile = path.join(appsDir, dir, 'src/main.ts')
      if (fs.existsSync(mainFile)) {
        apps.push(dir)
      }
    })

    return apps
  }

  // Read file and extract exports
  scanFileForExports(filePath) {
    // Skip ignored patterns
    const shouldIgnore = this.ignorePatterns.some((pattern) => filePath.includes(pattern))
    if (shouldIgnore) {
      return
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Match: export interface/type/enum/class Name
        const match = line.match(/export\s+(interface|type|enum|class)\s+([A-Za-z_][A-Za-z0-9_]*)/)
        if (match) {
          const [, type, name] = match
          this.allExports.set(name, {
            file: filePath,
            line: index + 1,
            type,
          })
        }

        // Match: export const NAME = ... (both SCREAMING_SNAKE_CASE and PascalCase)
        const constMatch = line.match(/export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=/)
        if (constMatch) {
          const [, name] = constMatch
          this.allExports.set(name, {
            file: filePath,
            line: index + 1,
            type: 'const',
          })
        }
      })
    } catch {
      // Skip files that can't be read
    }
  }

  // Read file and extract usages
  scanFileForUsages(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      // First, collect exports from this file to avoid false usage detection
      const fileExports = new Set()
      const exportLines = content.split('\n')
      exportLines.forEach((line) => {
        const match = line.match(/export\s+(?:interface|type|enum|class|const)\s+([A-Za-z_][A-Za-z0-9_]*)/)
        if (match) {
          fileExports.add(match[1])
        }
      })

      // 1. Import patterns: import { TypeA, TypeB } from '...'
      const importMatches = content.match(/import\s*{([^}]+)}/g) || []
      importMatches.forEach((match) => {
        const imports = match.match(/{([^}]+)}/)[1]
        imports.split(',').forEach((imp) => {
          const name = imp.trim().split(' as ')[0].trim()
          this.allUsages.add(name)
        })
      })

      // 2. NestJS useClass pattern: useClass: ClassName
      const useClassMatches = content.match(/useClass:\s*([A-Za-z_][A-Za-z0-9_]*)/g) || []
      useClassMatches.forEach((match) => {
        const name = match.split(':')[1].trim()
        this.allUsages.add(name)
      })

      // 3. NestJS provide pattern: provide: TOKEN_NAME
      const provideMatches = content.match(/provide:\s*([A-Z_][A-Z0-9_]*)/g) || []
      provideMatches.forEach((match) => {
        const name = match.split(':')[1].trim()
        this.allUsages.add(name)
      })

      // 4. Type annotations: : TypeName
      const typeMatches = content.match(/:\s*([A-Z][A-Za-z0-9_]*)/g) || []
      typeMatches.forEach((match) => {
        const name = match.slice(1).trim()
        // Skip built-in types
        if (!['Boolean', 'String', 'Number', 'Array', 'Object', 'Date', 'Promise'].includes(name)) {
          this.allUsages.add(name)
        }
      })

      // 5. Class extends/implements
      const extendsMatches = content.match(/(?:extends|implements)\s+([A-Z][A-Za-z0-9_]*)/g) || []
      extendsMatches.forEach((match) => {
        const name = match.split(/\s+/)[1]
        this.allUsages.add(name)
      })

      // 6. Generic types: <TypeName>
      const genericMatches = content.match(/<([A-Z][A-Za-z0-9_]*)/g) || []
      genericMatches.forEach((match) => {
        const name = match.slice(1)
        this.allUsages.add(name)
      })

      // 7. Constructor calls: new ClassName
      const constructorMatches = content.match(/new\s+([A-Z][A-Za-z0-9_]*)/g) || []
      constructorMatches.forEach((match) => {
        const name = match.split(/\s+/)[1]
        this.allUsages.add(name)
      })

      // 8. Decorator parameters: @Decorator(ClassName)
      const decoratorMatches = content.match(/@[A-Za-z]+\(([A-Z][A-Za-z0-9_]*)\)/g) || []
      decoratorMatches.forEach((match) => {
        const name = match.match(/\(([^)]+)\)/)[1]
        this.allUsages.add(name)
      })

      // 9. typeof usage: typeof VariableName (real cross-references)
      const typeofMatches = content.match(/=\s*z\.infer<typeof\s+([A-Z][A-Za-z0-9_]*)/g) || []
      typeofMatches.forEach((match) => {
        const nameMatch = match.match(/typeof\s+([A-Z][A-Za-z0-9_]*)/)
        if (nameMatch) {
          this.allUsages.add(nameMatch[1])
        }
      })

      // 10. Function call parameters: functionName(VariableName)
      const functionCallMatches = content.match(/\w+\(([A-Z][A-Za-z0-9_]*)\)/g) || []
      functionCallMatches.forEach((match) => {
        const paramMatch = match.match(/\(([A-Z][A-Za-z0-9_]*)\)/)
        if (paramMatch) {
          this.allUsages.add(paramMatch[1])
        }
      })

      // 11. General variable/constant usage: VariableName (not in type position)
      const variableMatches = content.match(/\b([A-Z][A-Za-z0-9_]*)\b/g) || []
      variableMatches.forEach((name) => {
        // Skip if this is an export from the same file
        if (fileExports.has(name)) {
          return
        }

        // Skip common false positives and built-in types
        if (
          ![
            'Boolean',
            'String',
            'Number',
            'Array',
            'Object',
            'Date',
            'Promise',
            'Module',
            'Injectable',
            'Controller',
            'Service',
            'Repository',
            'Get',
            'Post',
            'Put',
            'Delete',
            'Patch',
            'Body',
            'Param',
            'Query',
            'Type',
            'Interface',
            'Enum',
            'Class',
            'Function',
            'Const',
          ].includes(name)
        ) {
          this.allUsages.add(name)
        }
      })
    } catch {
      // Skip files that can't be read
    }
  }

  // Scan all files in directory
  scanDirectory(dir, forExports = false) {
    if (!fs.existsSync(dir)) return

    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir)

      items.forEach((item) => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
          scan(fullPath)
        } else if (item.endsWith('.ts') && !item.includes('.spec.') && !item.includes('.test.')) {
          if (forExports) {
            this.scanFileForExports(fullPath)
          } else {
            this.scanFileForUsages(fullPath)
          }
        }
      })
    }

    scan(dir)
  }

  // Main analysis
  analyze() {
    const apps = this.findApps()

    if (this.ignorePatterns.length > 0) {
      console.log(`Ignoring: ${this.ignorePatterns.join(', ')}`)
    }
    this.scanDirectory('libs', true)

    apps.forEach((app) => {
      this.scanDirectory(`apps/${app}/src`)
    })

    this.scanDirectory('libs')

    const unused = []

    for (const [name, info] of this.allExports) {
      if (!this.allUsages.has(name)) {
        unused.push({ name, ...info })
      }
    }

    return unused
  }

  // Generate report
  report(unused) {
    if (unused.length === 0) {
      console.log('✅ No unused exports found!')
      return
    }

    console.log(`❌ Found ${unused.length} unused exports:\n`)

    // Group by file
    const byFile = {}
    unused.forEach((item) => {
      const file = path.relative(process.cwd(), item.file)
      if (!byFile[file]) byFile[file] = []
      byFile[file].push(item)
    })

    // Sort and display
    Object.keys(byFile)
      .sort()
      .forEach((file) => {
        console.log(`📁 ${file}:`)
        byFile[file]
          .sort((a, b) => a.line - b.line)
          .forEach((item) => {
            console.log(`  ❌ ${item.type} ${item.name} (line ${item.line})`)
          })
        console.log()
      })

    // Summary by type
    const byType = {}
    unused.forEach((item) => {
      byType[item.type] = (byType[item.type] || 0) + 1
    })

    console.log('📊 Summary:')
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 NestJS Unused Exports Detector

Usage: node unused-detector.js [options]

Options:
  --help, -h      Show this help message
  --version, -v   Show version
  --json          Output as JSON
  --exit-code     Exit with code 1 if unused exports found
  --limit N       Show only first N results (default: all)
  --ignore PATHS  Comma-separated paths to ignore (default: libs/share/)

Examples:
  node unused-detector.js
  node unused-detector.js --json
  node unused-detector.js --limit 10
  node unused-detector.js --ignore "libs/share/,libs/common/"
  node unused-detector.js --exit-code  # For CI/CD
`)
    return
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('unused-detector v1.2.0 - NestJS Edition')
    return
  }

  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : null

  const ignoreIndex = args.indexOf('--ignore')
  const ignorePatterns =
    ignoreIndex !== -1 && args[ignoreIndex + 1] ? args[ignoreIndex + 1].split(',') : ['libs/share/']

  const detector = new UnusedDetector({ ignorePatterns })
  let unused = detector.analyze()

  if (limit && unused.length > limit) {
    console.log(`📝 Limiting results to first ${limit} items (total: ${unused.length})`)
    unused = unused.slice(0, limit)
  }

  if (args.includes('--json')) {
    console.log(JSON.stringify(unused, null, 2))
  } else {
    detector.report(unused)
  }

  if (args.includes('--exit-code') && unused.length > 0) {
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
