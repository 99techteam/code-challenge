# Problem 5: CRUD Resource Management API

This project implements a RESTful API for managing resources using Node.js, Express, TypeScript, and `better-sqlite3`.

## Configuration and Setup

1.  **Install Dependencies**:
    Make sure you have `yarn` installed. From the root directory of the project, run the following command to install all the necessary dependencies:
    ```bash
    yarn install
    ```

## Running the Application

To start the server, run the following command from the root directory:

```bash
yarn problem5:start
```

The server will start on `http://localhost:3000`.

## Running Tests

To run the test suite, use the following command:

```bash
yarn problem5:test
```

This will execute all the tests for the resource API and provide a summary of the results.

## API Endpoints

The following endpoints are available for managing resources:

### Create a Resource

*   **POST** `/resource`
*   **Description**: Creates a new resource.
*   **Request Body**:
    ```json
    {
      "name": "string",
      "description": "string"
    }
    ```
*   **Example**:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"name": "My Resource", "description": "A new resource."}' http://localhost:3000/resource
    ```

### List Resources

*   **GET** `/resource`
*   **Description**: Retrieves a list of resources with optional filters.
*   **Query Parameters**:
    *   `name` (string): Filters resources by name (case-insensitive, partial match).
    *   `from` (string): Filters resources created on or after this date (YYYY-MM-DD).
    *   `to` (string): Filters resources created on or before this date (YYYY-MM-DD).
*   **Example**:
    ```bash
    curl "http://localhost:3000/resource?name=My&from=2023-01-01"
    ```

### Get a Resource by ID

*   **GET** `/resource/:id`
*   **Description**: Retrieves a single resource by its ID.
*   **Example**:
    ```bash
    curl http://localhost:3000/resource/:resource_id
    ```

### Update a Resource

*   **PUT** `/resource/:id`
*   **Description**: Updates an existing resource.
*   **Request Body**:
    ```json
    {
      "name": "string",
      "description": "string"
    }
    ```
*   **Example**:
    ```bash
    curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Name"}' http://localhost:3000/resource/:resource_id
    ```

### Delete a Resource

*   **DELETE** `/resource/:id`
*   **Description**: Deletes a resource by its ID.
*   **Example**:
    ```bash
    curl -X DELETE http://localhost:3000/resource/:resource_id
    ```
