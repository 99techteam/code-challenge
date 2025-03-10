# Token Swap Converter

## Overview

This project is a token swap converter built with React, TypeScript, and Vite. It allows users to convert between different tokens by specifying an amount to send, selecting "From" and "To" tokens, and confirming the swap. The app fetches token prices from a provided API, displays token icons (with a fallback for missing icons), and includes validation for user inputs. It features a loading indicator for the "CONFIRM SWAP" button to simulate backend interaction and toast notifications for error feedback.

## Key Files

- **`App.tsx`**: The main component that orchestrates the swap functionality, manages state, and renders the UI.
- **`components/`**: Contains reusable components:
  - `AmountInput.tsx`: Renders the input field for the amount to send.
  - `LoadingButton.tsx`: A button with a loading state for the "CONFIRM SWAP" action, simulating a backend delay.
  - `ResultDisplay.tsx`: Displays the converted amount to receive.
  - `TokenSelect.tsx`: Renders dropdowns for selecting "From" and "To" tokens, including image handling.

## Tools and Technologies

- **React**: JavaScript library for building the UI.
- **TypeScript**: Adds static typing to JavaScript for better code reliability.
- **Vite**: A fast build tool and development server for modern web projects.
- **Material-UI (MUI)**: A React UI framework for styled components (e.g., buttons, inputs, typography).
- **react-hot-toast**: A lightweight library for toast notifications.
- **Fetch API**: Used to retrieve token price data from `https://interview.switcheo.com/prices.json`.

## How to Run

### Prerequisites

- **Node.js**: Ensure Node.js (v16 or higher) and npm are installed. You can download it from [nodejs.org](https://nodejs.org/).

### Setup

1. Install Dependencies:

  ```bash
  npm install
  ```

2. Run the project:

  ```bash
  npm run dev
  ```

This will start the app on http://localhost:5173 (or another port if 5173 is in use). Open this URL in your browser to view the app.


## Dependencies

- @mui/material: For UI components.
- @emotion/react, @emotion/styled: Peer dependencies for MUI styling.
- react-hot-toast: For toast notifications.
- react, react-dom: Core React libraries.
- @vitejs/plugin-react, typescript, vite: Development tools.