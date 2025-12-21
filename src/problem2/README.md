# Currency Swap Application

A next-generation currency swap interface engineered with **React 19**, **TypeScript**, and **Vite**. This project focuses on modern architectural patterns, strict type safety, and leveraging the latest React ecosystem advancements for optimal performance.

## 🛠 Tech Stack

- **Core:** React 19, TypeScript, Vite.
- **State Management:** Custom Hooks & React 19 Primitives.
- **Styling:** Tailwind CSS (Utility-first architecture).
- **Routing:** React Router.
- **Code Quality:** ESLint (Flat Config), Prettier.

## 💡 Key Engineering Decisions

### 1. Adopting React 19 & Future-Proofing

I deliberately chose **React 19** to leverage the latest rendering engine improvements and prepare the codebase for upcoming concurrent features.

- **Modern Hooks:** Utilized the latest hook patterns for cleaner side-effect management.
- **Performance:** Minimized re-renders through architectural design rather than excessive `memo` usage, relying on React 19's optimized reconciliation strategies.

### 2. Separation of Concerns (SoC)

The project structure enforces a strict boundary between UI and Business Logic:

- **`hooks/`**: All data fetching, transformation, and state logic (e.g., `useTokenPrices`) reside here. The UI components are purely representational.
- **`config/`**: Centralized configuration for token settings and API constants, making the app easily maintainable and scalable without touching core logic.

### 3. Resilience & User Experience

- **Graceful Error Handling:** implemented robust fallback UI for missing token icons or failed API requests.
- **Responsive Design:** A mobile-first approach using Tailwind CSS ensures seamless usability across all device sizes.
- **Type Safety:** Comprehensive TypeScript interfaces (`types/token.ts`) ensure data consistency across the application.

## 📂 Project Structure

```bash
src/
├── components/    # Atomic UI components (TokenSelector, Icons, etc.)
├── config/        # App-wide constants & configuration
├── hooks/         # Custom hooks (Business Logic Layer)
├── pages/         # Route components (Index, NotFound)
├── types/         # TypeScript definitions
├── App.tsx        # Main Application Layout
└── main.tsx       # Entry point
```
🚀 Getting Started
Prerequisites: Node.js 18+

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Build for production
npm run build

📝 API Integration Notes
Endpoint: https://interview.switcheo.com/prices.json

Data Strategy: The application implements a sanitization layer to handle duplicate data points from the API, ensuring only the most recent price is used for calculations.