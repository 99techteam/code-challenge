# 🚀 Fancy Swap Form

A modern **currency swap interface** built with React and TypeScript, focusing on **user experience, validation, and clean UI design**.

---

## 📌 Overview

This application allows users to:

- Enter an amount to swap
- Select tokens from a list
- View real-time exchange rates
- Simulate a swap process with confirmation

---

## ✨ Key Highlights

- 💡 User-friendly interface inspired by DeFi applications
- 🔄 Real-time exchange rate calculation
- 🧠 Smart input handling (prevents invalid values & UI breaking)
- ✅ Form validation with clear error messages
- 🔔 Interactive feedback using notifications and modals
- 🎯 Guided swap flow:
  - Review → Confirm → Processing → Completed

---

## 🧱 Tech Stack

- React (Vite)
- TypeScript
- react-hook-form + zod (validation)
- sonner (notifications)
- Custom CSS

---

## 📊 Data Source

Token prices are fetched from:
https://interview.switcheo.com/prices.json

---

## ▶️ Run Locally

```bash
npm install
npm run dev
```
