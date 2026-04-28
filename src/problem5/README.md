# Problem 5: A Crude Server

This is a backend RESTful API built with ExpressJS and TypeScript. It implements a set of CRUD interfaces for a generic "Resource" entity and uses a local SQLite database for simple, reliable data persistence.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm or yarn

## Setup and Configuration

1. **Install dependencies:**
   Navigate to the project root and run:
   ```bash
  npm init -y
  npm install express better-sqlite3
  npm install --save-dev typescript @types/express @types/node @types/better-sqlite3 ts-node nodemon
  ```

2. **Database:**
   This application uses `better-sqlite3`. Upon starting the server for the first time, an `app.db` SQLite file will be automatically generated in the root directory. The database tables will be created automatically if they do not exist.

## How to Run the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The server will start on **http://localhost:3000**.

## Testing with Postman

You can use API testing tools like [Postman](https://www.postman.com/) or the VS Code REST Client to interact with the server. Ensure the server is running locally on port 3000 before sending requests.

### 1. Create a Resource
- **Method:** `POST`
- **URL:** `http://localhost:3000/resources`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Sample Resource",
    "description": "This is a test",
    "status": "active"
  }
  ```

### 2. List Resources
- **Method:** `GET`
- **URL:** `http://localhost:3000/resources`
- **Query Filters (Optional):** You can filter by status using `?status=active` or `?status=inactive` (e.g., `http://localhost:3000/resources?status=active`).

### 3. Get Details of a Resource
- **Method:** `GET`
- **URL:** `http://localhost:3000/resources/1` *(Replace '1' with the ID of an existing resource)*

### 4. Update Resource Details
- **Method:** `PUT`
- **URL:** `http://localhost:3000/resources/1`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Updated Name",
    "status": "inactive"
  }
  ```

### 5. Delete a Resource
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/resources/1`