# Problem 5: Frontend CRUD Prototype - Todo Application

This project is a modern and responsive Todo application built with React, TypeScript, and Vite. It serves as a frontend prototype for a full-stack task management system, demonstrating a complete CRUD (Create, Read, Update, Delete) interface that interacts with a mock backend API.

### **Live Demo**

**[Link to Live Demo]** (<- We will add this link after deployment)

---

## Solution Overview & Key Features

The application provides a seamless user experience for managing tasks with the following features:

-   **Full CRUD Functionality**: Create, read, update (toggle completion), and delete tasks.
-   **Stateful Filtering**: Filter tasks by `All`, `Active`, and `Completed` status.
-   **Client-Side Routing**: A dedicated detail page for each task, accessible via a unique URL (`#/tasks/:id`).
-   **Modern & Responsive UI**: A clean, dark-themed interface with smooth animations and hover effects, ensuring consistency with other projects.
-   **Interactive Feedback**: Visual cues for loading states, form interactions, and actions.

## Design & Architectural Decisions

To ensure the codebase is scalable, maintainable, and clean, the following architectural patterns were implemented:

1.  **Component-Based Architecture**: The UI is broken down into reusable and single-responsibility components (e.g., `TaskList`, `TaskItem`, `AddTaskForm`).

2.  **Separation of Concerns**: 
    -   **Custom Hooks**: All state management and business logic for tasks are encapsulated in a custom hook (`useTasks`), separating logic from the UI.
    -   **View Components**: `TaskListView` and `TaskDetailView` act as page containers, composing smaller components.
    -   **Centralized Routing**: A `Router` component handles all client-side routing logic.

3.  **Styling**: Inline styles with `React.CSSProperties` are used for type-safe, component-scoped styling. A global stylesheet (`styles.css`) sets the base theme and fonts.

4.  **Animations**: `framer-motion` is used for declarative and fluid animations on task items, enhancing the user experience.

5.  **Mock API Layer**: A mock API (`api.ts`) simulates asynchronous backend communication with realistic delays, allowing the frontend to be developed and tested independently.

## Project Structure

```
src/problem5/
├── src/
│   ├── api.ts              # Mock API for backend simulation
│   ├── components/         # Reusable UI components
│   │   ├── AddTaskForm.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── hooks/
│   │   └── useTasks.ts     # Custom hook for state management
│   ├── views/
│   │   ├── TaskDetailView.tsx
│   │   └── TaskListView.tsx
│   ├── main.tsx            # App entry point
│   ├── router.tsx          # Client-side router
│   ├── styles.css          # Global styles
│   └── TodoApp.tsx         # Main application container
├── package.json
└── README.md
```

## How to Run Locally

1.  **Navigate to the project directory:**
    ```bash
    cd src/problem5
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

This will start the application on a local server (usually `http://localhost:5173`).
