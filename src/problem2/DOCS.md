# Problem 2: Fancy Form - Technical Documentation

## Overview

This project implements a modern, responsive currency swap interface with a real-time dashboard. The solution is built using **Vanilla TypeScript**, **HTML**, and **CSS**, orchestrated by **Vite**.

## Architectural Decision: Why Vanilla TypeScript?

The decision to build this application without a heavy frontend framework (like React, Vue, or Angular) was deliberate and driven by several key factors:

### 1. Performance & Bundle Size

- **Zero Runtime Overhead**: Frameworks introduce significant JavaScript payloads for their runtime, virtual DOM, and reconciliation algorithms. By using vanilla TypeScript, the final bundle contains only the code necessary for the application logic.
- **Instant Load Times**: The application loads almost instantly, even on slow networks, because the browser executes the native DOM API directly without parsing a large vendor bundle first.

### 2. Demonstration of Core Fundamentals

- **Deep DOM Knowledge**: Building complex UI interactions (like custom dropdowns and dynamic form validation) from scratch demonstrates a strong command of the native Web APIs, Event Loop, and DOM manipulation.
- **Type Safety**: TypeScript is used extensively to ensure type safety across the application, from API responses to component props, without relying on framework-specific types.

### 3. Custom Component Architecture

Instead of relying on a framework's component model, I implemented a lightweight, class-based component system. This proves that modularity, encapsulation, and reusability can be achieved with standard Object-Oriented Programming (OOP) principles.

- **Decoupled Logic**: Each component (`InputNumber`, `CustomDropdown`, `Dashboard`) manages its own state and DOM, communicating via callbacks or public methods.
- **Reusability**: Components like the `Button` and `InputNumber` are designed to be reused across different parts of the application.

### 4. Simplicity & Control

- **No "Black Box" Magic**: Every state change and DOM update is explicit. There is no "magic" reactivity system to debug; data flows predictably.
- **Minimal Dependencies**: The project has very few dependencies, reducing security risks and maintenance burden related to "dependency hell."

## Personal Note

Although I am a Senior React Frontend Developer with extensive experience in modern frameworks like React, Vue, and SolidJS, I deliberately chose Vanilla TypeScript for this challenge. This choice reflects my confidence in building robust, scalable applications using web standards directly, without relying on the abstractions provided by libraries. It demonstrates that while I can leverage powerful tools, I am not dependent on them to deliver high-quality, structured code.

## Project Structure

The project follows a clean separation of concerns:

- `src/components/`: Reusable UI elements (Dropdowns, Inputs, Dashboard).
- `src/apis/`: Centralized API fetching logic.
- `src/types/`: Shared TypeScript interfaces.
- `src/main.ts`: The controller that glues components together and manages the business logic (SwapForm).
