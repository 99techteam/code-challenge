# Fancy Form - Problem 2

A TypeScript + Vite project for building a swap form interface.

## Project Structure

```
problem2/
├── src/
│   ├── main.ts          # Main TypeScript entry point
│   ├── style.css        # Styles for the application
│   └── vite-env.d.ts    # TypeScript declarations for Vite
├── public/              # Static assets
├── .eslintignore        # ESLint ignore patterns
├── .prettierignore      # Prettier ignore patterns
├── .prettierrc          # Prettier configuration
├── eslint.config.js     # ESLint configuration
├── index.html           # Main HTML file
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies and scripts
└── README.md           # This file
```

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

This will start the development server at `http://localhost:3000`

### Build

```bash
pnpm build
```

### Type Checking

```bash
pnpm type-check
```

### Preview Production Build

```bash
pnpm preview
```
