# Problem 4 - Sum to N Implementation

A TypeScript project demonstrating three different approaches to calculate the sum of numbers from 1 to N.

## Project Structure

```
problem4/
├── src/
│   └── index.ts          # Main application file with three implementations
├── dist/                 # Compiled JavaScript output
├── node_modules/         # Dependencies
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript compiler configuration
├── yarn.lock            # Dependency lock file
└── .gitignore           # Git ignore patterns
```

## Prerequisites

- Node.js (version 24 or higher)
- yarn or npm package manager

## Installation

1. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

## Configuration

The project uses standard TypeScript configuration with the following settings:

- **Target**: ES2020
- **Module**: CommonJS
- **Output Directory**: `./dist`
- **Source Directory**: `./src`
- **Strict Mode**: Enabled

## Available Scripts

### Development Mode
Run the application directly with TypeScript:
```bash
yarn dev
# or
npm run dev
```

### Build
Compile TypeScript to JavaScript:
```bash
yarn build
# or
npm run build
```

### Production Mode
First build the project, then run the compiled JavaScript:
```bash
yarn build && yarn start
# or
npm run build && npm start
```

## Implementation Details

The application demonstrates three approaches to calculate sum from 1 to N:

### 1. Loop-based Approach
- **Time Complexity**: O(n)
- **Space Complexity**: O(1)

### 2. Recursive Approach
- **Time Complexity**: O(n)
- **Space Complexity**: O(n)
- **Limitation**: May cause stack overflow for large values of N (typically > 10,000)

### 3. Mathematical Formula Approach
- **Time Complexity**: O(1)
- **Space Complexity**: O(1)
- **Formula**: sum = n × (n + 1) / 2

## Example Output

When you run the application, it will test all three implementations with various input values:

```
Testing sumToN(5):
Loop approach: 15
Recursive approach: 15
Math approach: 15

Testing sumToN(100):
Loop approach: 5050
Recursive approach: 5050
Math approach: 5050

Testing sumToN(1000):
Loop approach: 500500
Recursive approach: 500500
Math approach: 500500

Testing sumToN(10000):
Loop approach: 50005000
Recursive approach: Stack overflow error - exceeds call stack limit
Math approach: 50005000
```
