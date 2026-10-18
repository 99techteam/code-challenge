# Currency Converter

Vite + React + TypeScript currency converter using Ant Design.

## Features
- Currency list loaded from `https://interview.switcheo.com/prices.json`.
- Currency icons loaded from the Switcheo token-icons repository.
- Ant Design form controls and processing modal.
- Form disabled during conversion.
- Converts the selected amount to every other available currency.
- Responsive CSS grid using `auto-fit` / `minmax`, with no fixed column count.
- Duplicate price records are normalized by keeping the latest timestamp for each currency.

## Run

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
npm run preview
```

## Conversion

Prices represent USD value per unit. Conversion is:

`amount × source USD price ÷ target USD price`
