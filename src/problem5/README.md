# ExpressJS TypeScript CRUD Backend

This project is a backend server built with Express.js and TypeScript, providing a full set of CRUD (Create, Read,
Update, Delete) interfaces for managing a resource. It uses TypeORM to interact with a SQLite database for data
persistence and includes Swagger for API documentation.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16+
- **npm** or **yarn**

## Project Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   This project uses TypeORM's `synchronize` feature for development. The database and its tables will be created
   automatically when you first run the application. No manual migration command is needed to get started.
   This process will create a `database.sqlite` file in the project's root directory.

4. **Environment Variables:**
   This project does not require a `.env` file for the default SQLite setup, as the database path is directly configured
   in `src/databases/data-sources/sqlite3/data-source.ts`.

## How to Run the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will start the server with `nodemon`, which automatically restarts the server on file changes. The server will
   be running at `http://localhost:3000`.

2. **Build for production:**
   This command is not pre-configured but you can add it to `package.json` to compile the TypeScript code to JavaScript.
   A typical build command would be:
   ```bash
   npm run build
   ```

3. **Run in production:**
   After building the project, start the server from the compiled JavaScript files.
   ```bash
   node dist/main.js
   ```

## API Documentation and Endpoints

Full interactive API documentation is available via Swagger at `http://localhost:3000/api-docs` after starting the
server.

The following endpoints are available to interact with the resource:

* **`POST /resources`**: Create a new resource.
    * **Request Body:**
      ```json
      {
        "name": "string",
        "description": "string"
      }
      ```

* **`GET /resources`**: List all resources with optional filtering.
    * **Query Parameters:**
        * `isActive` (optional): Filter resources by their active status (`true` or `false`).
    * **Example:** `GET /resources?isActive=true`

* **`GET /resources/:id`**: Get the details of a specific resource.
    * **URL Parameter:**
        * `id`: The unique integer identifier of the resource.

* **`PUT /resources/:id`**: Update the details of a specific resource.
    * **URL Parameter:**
        * `id`: The unique integer identifier of the resource.
    * **Request Body:**
      ```json
      {
        "name": "string",
        "description": "string",
        "isActive": "boolean"
      }
      ```

* **`DELETE /resources/:id`**: Delete a resource.
    * **URL Parameter:**
        * `id`: The unique integer identifier of the resource.

