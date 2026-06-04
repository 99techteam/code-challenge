/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f5f7fb',
        surface: '#ffffff',
        'surface-alt': '#f8fafc',
        'surface-muted': '#eef2f7',
        'border-soft': '#d9e2ec',
        'border-strong': '#c5d1de',
        'text-strong': '#0f172a',
        'text-muted': '#64748b',
        'text-subtle': '#94a3b8',
        brand: '#2563eb',
        'brand-hover': '#1d4ed8',
        'brand-foreground': '#ffffff',
        danger: '#dc2626',
        'danger-soft': '#fee2e2',
        'icon-muted': '#cbd5e1',
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
