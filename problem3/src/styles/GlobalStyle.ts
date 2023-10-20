import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
:root {

  /* Grey */
  --color-white: #fff;
  --color-black: #000;

  --color-grey-100: #f3f4f6;
  --color-grey-200: #e5e7eb;
  --color-grey-300: #d1d5db;
  --color-grey-400: #9ca3af;
  --color-grey-500: #6b7280;
  --color-grey-600: #4b5563;
  --color-grey-700: #374151;
  --color-grey-800: #1f2937;
  --color-grey-900: #111827;

  --color-blue-100: #e0f2fe;
  --color-blue-200: #cfe6f5;
  --color-blue-300: #b1dbf8;
  --color-blue-400: #98d1f7;
  --color-blue-500: #88cffe;
  --color-blue-600: #6ec3fb;
  --color-blue-700: #50b8fd;
  --color-blue-800: #31adff;
  --color-blue-900: #189ef6;
  --color-green-100: #dcfce7;
  --color-green-200: #b4ebb4;
  --color-green-300: #99e699;
  --color-green-400: #87ec87;
  --color-green-500: #6ce86c;
  --color-green-600: #59e659;
  --color-green-700: #3de63d;
  --color-green-800: #1ee81e;
  --color-green-900: #00ec00;
  --color-yellow-100: #383624;
  --color-yellow-700: #f0ff2b;

  --color-silver-100: #e5e7eb;
  --color-silver-700: #374151;

  --color-indigo-100: #e0e7ff;
  --color-indigo-700: #4338ca;


  --color-cream-100: #fff7ee;
  --color-cream-200: #ffefdd;
  --color-cream-300: #ffe7cb;
  --color-cream-400: #f8d9b4;
  --color-cream-500: #fbd7ac;
  
  --color-red-100: #fff0f0;
  --color-red-200: #fee2e2;
  --color-red-500: #f14668;
  --color-red-700: #b91c1c;
  --color-red-800: #991b1b;
  --color-primary: #d70018;
  --color-primary-light: #e4a3a38f;
  --color-secondary: #dbdbdb;
  --color-text: #4a4a4a;


  --backdrop-color: rgba(255, 255, 255, 0.1);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.12);
  --shadow-around: 0 1px 2px 0 rgba(60, 64, 67, 0.1), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
  --shadow-around-dark: 0 2px 20px rgba(0,0,0,0.5);

  --image-grayscale: 0;
  --image-opacity: 100%;
  
  --color-brand-50: #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #3730a3;
  --color-brand-900: #312e81;
  
  --border-radius-tiny: 3px;
  --border-radius-sm: 5px;
  --border-radius-md: 7px;
  --border-radius-lg: 9px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;

  /* Creating animations for dark mode */
}

html {
  font-size: 62.5%;
  scroll-behavior: smooth;
}

body {
  font-family:  sans-serif;
  color: var(--color-grey-700);

  transition: color 0.3s, background-color 0.3s;
  min-height: 100vh;
  line-height: 1.5;
  font-size: 1.6rem;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
}

input:focus,
button:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--color-brand-600);
  outline-offset: -1px;
}

/* Parent selector, finally 😃 */
button:has(svg) {
  line-height: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

img {
  max-width: 100%;
  /* For dark mode */
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}

`;

export default GlobalStyles;
