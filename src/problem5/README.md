# Resource Management API

A RESTful backend server built with Express.js and TypeScript that provides CRUD operations for managing resources. The application uses TypeORM with SQLite for data persistence.

## Features

- ✅ Create a resource
- ✅ List resources with pagination and filtering
- ✅ Get details of a specific resource
- ✅ Update resource details
- ✅ Delete a resource

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: SQLite
- **Validation**: Zod

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Configuration

The application uses SQLite database which is automatically created as `database.sqlite` in the project root. No additional configuration is required for development.

The server runs on port `3000` by default. You can change this by setting the `PORT` environment variable:

```bash
export PORT=3000  # Linux/Mac
set PORT=3000     # Windows
```

## Running the Application

### Development Mode

Run the server in development mode with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

### Production Mode

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## API Endpoints

All endpoints are prefixed with `/resources`.

### Create a Resource

```http
POST /resources
Content-Type: application/json

{
  "name": "My Resource",
  "description": "Resource description (optional)"
}
```

**Response**: `201 Created` with the created resource

### List Resources

```http
GET /resources?page=1&limit=10&name=search
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `name` (optional): Filter by name

**Response**: `200 OK` with paginated list of resources

### Get Resource Details

```http
GET /resources/:id
```

**Response**: `200 OK` with resource details or `404 Not Found`

### Update a Resource

```http
PUT /resources/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response**: `200 OK` with updated resource or `404 Not Found`

### Delete a Resource

```http
DELETE /resources/:id
```

**Response**: `204 No Content` on success or `400 Bad Request` if ID is invalid

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── database.ts            # TypeORM data source configuration
└── resource/
    ├── resource.controller.ts    # Request handlers
    ├── resource.usecases.ts      # Business logic
    ├── resource.repository.ts    # Data access layer
    ├── resource.orm-entity.ts    # TypeORM entity
    └── resource.routes.ts        # Route definitions
```

## License

ISC
