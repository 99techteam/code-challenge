# Task Manager API

A simple CRUD API for managing tasks, built with ExpressJS and TypeScript, using SQLite for data persistence.

## Prerequisites

- **Node.js**: Version 14 or higher
- **npm**: Node package manager

## Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/ngocyt001/thanh-ngoc-code-challenge-99tech.git
   ```
2. **Navigate to the Project Directory**:
   ```sh
   cd thanh-ngoc-code-challenge-99tech
   ```
3. **Install Dependencies**:
   ```sh
   npm install
   ```

## Running the Application

Start the server with:
   ```sh
   npm start
   ```

The server will run on `http://localhost:3000`. A SQLite database file (`tasks.db`) will be created in the project root on first run.

## API Endpoints

### Create a Task
- **Method**: `POST`
- **URL**: `/tasks`
- **Body**:
  ```json
  {
    "title": "Task title",
    "description": "Task description"
  }
  ```
- **Response**: `201 Created`
  ```json
  { "id": 1 }
  ```

### List Tasks
- **Method**: `GET`
- **URL**: `/tasks`
- **Query Parameters** (optional):
  - `completed`: `"true"` or `"false"` (e.g., `/tasks?completed=true`)
  - `title`: String for partial match (e.g., `/tasks?title=work`)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "Do work",
      "description": "Finish project",
      "completed": false,
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    }
  ]
  ```

### Get Task Details
- **Method**: `GET`
- **URL**: `/tasks/:id` (e.g., `/tasks/1`)
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "title": "Do work",
    "description": "Finish project",
    "completed": false,
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
  }
  ```
- **Error**: `404 Not Found` if task doesn’t exist

### Update a Task
- **Method**: `PUT`
- **URL**: `/tasks/:id` (e.g., `/tasks/1`)
- **Body**: (Partial updates allowed)
  ```json
  {
    "title": "Updated title",
    "completed": true
  }
  ```
- **Response**: `200 OK`
  ```json
  { "message": "Task updated" }
  ```
- **Error**: `404 Not Found` if task doesn’t exist

### Delete a Task
- **Method**: `DELETE`
- **URL**: `/tasks/:id` (e.g., `/tasks/1`)
- **Response**: `200 OK`
  ```json
  { "message": "Task deleted" }
  ```
- **Error**: `404 Not Found` if task doesn’t exist

## Notes
- Use tools like **Postman** or **curl** to test the API.
- The `completed` field is returned as a boolean but stored as an integer (0 or 1) in the database.
