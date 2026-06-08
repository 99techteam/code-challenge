# Currency Swap

A real-time currency swap form that lets users convert between crypto tokens using live price data.

## Requirements

1. You may add input validation/error messages to make the form interactive.
2. Your submission will be rated on its usage intuitiveness and visual attractiveness.
3. Show us your frontend development and design skills, feel free to totally disregard the provided files for this problem.
4. You may use this repo for token images, e.g. SVG image.
5. You may use this URL for token price information and to compute exchange rates (not every token has a price, those that do not can be omitted).

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) — component library built on Radix UI
- [Lucide React](https://lucide.dev/) — icons
- [class-variance-authority](https://cva.style/) — component variants
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## Data Sources

- Token prices: `https://interview.switcheo.com/prices.json`
- Token icons: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{currency}.svg`
