# Token Swap Application

A modern React application for token swapping with a beautiful UI, built with React, Vite, TailwindCSS, and other modern technologies.

## 🚀 Features

- Modern and responsive UI
- Real-time token price calculations
- Smooth animations using Framer Motion
- Form handling with React Hook Form
- Data fetching with React Query
- Beautiful styling with TailwindCSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (version 18.0.0 or higher)
- npm (usually comes with Node.js)

## 🛠 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/99techteam/code-challenge.git
   cd code-challenge/src/problem2
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install all necessary dependencies including:
   - React and React DOM
   - Vite (build tool)
   - TailwindCSS (styling)
   - React Query (data fetching)
   - Framer Motion (animations)
   - React Hook Form (form management)

3. **Environment Setup**
   - No additional environment variables are required for basic setup
   - The application uses default configurations for development

## 🚀 Running the Application

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   This will:
   - Start the Vite development server
   - Open your default browser to the application (usually http://localhost:5173)
   - Enable hot module replacement for instant updates

2. **Building for Production**
   ```bash
   npm run build
   ```
   This creates an optimized production build in the `dist` directory.

3. **Preview Production Build**
   ```bash
   npm run preview
   ```
   This allows you to preview the production build locally.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
src/
├── components/       # React components
├── services/        # API and service functions
├── App.jsx          # Main application component
├── main.jsx        # Application entry point
└── index.css       # Global styles and Tailwind imports
```

## 🎨 Customization

1. **Tailwind Configuration**
   - Edit `tailwind.config.js` to customize:
     - Color schemes
     - Typography
     - Spacing
     - Breakpoints

2. **Styling**
   - Global styles are in `src/index.css`
   - Component-specific styles use Tailwind classes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

Common issues and solutions:

1. **Module not found errors**
   ```bash
   npm install
   ```
   Re-run the install command to ensure all dependencies are properly installed.

2. **Styles not applying**
   - Ensure Tailwind directives are properly imported in `index.css`
   - Check if PostCSS is configured correctly

3. **Development server not starting**
   - Check if port 5173 is already in use
   - Try running with a different port: `npm run dev -- --port 3000`

## 📝 Notes

- The application uses React 19 with the latest features
- TailwindCSS is configured with PostCSS for optimal performance
- ESLint is configured for React development best practices

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Query Documentation](https://tanstack.com/query/latest/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Hook Form Documentation](https://react-hook-form.com/)
