# Resource Management API

A TypeScript Express.js REST API for managing resources with MongoDB integration using Typegoose ODM.

## Features

- **CRUD Operations**: Create, Read, Update, Delete resources
- **Filtering**: Search resources by name with case-insensitive matching
- **TypeScript**: Full TypeScript support with type safety
- **MongoDB**: Persistent data storage with Mongoose/Typegoose
- **Docker Support**: Containerized application with Docker Compose
- **Integration Tests**: Comprehensive test suite using Jest, Supertest, and mongodb-memory-server

## Prerequisites

- Docker and Docker Compose

## Running the Application

Build and run with Docker Compose:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Base URL
`http://localhost:3000`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resources` | Create a new resource |
| GET | `/resources` | Get all resources |
| GET | `/resources?name=<filter>` | Get resources filtered by name |
| GET | `/resources/:id` | Get a specific resource by ID |
| PUT | `/resources/:id` | Update a resource by ID |
| DELETE | `/resources/:id` | Delete a resource by ID |

## Testing the API

### 1. Create a Resource
```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "My Resource"}'
```

### 2. List All Resources
```bash
curl http://localhost:3000/resources
```

### 3. List Resources with Filter
```bash
curl "http://localhost:3000/resources?name=My"
```

### 4. Get Resource by ID
```bash
# Replace <RESOURCE_ID> with the actual ID from the create response
curl http://localhost:3000/resources/<RESOURCE_ID>
```

### 5. Update a Resource
```bash
# Replace <RESOURCE_ID> with the actual ID
curl -X PUT http://localhost:3000/resources/<RESOURCE_ID> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### 6. Delete a Resource
```bash
# Replace <RESOURCE_ID> with the actual ID
curl -X DELETE http://localhost:3000/resources/<RESOURCE_ID>
```

## Running Tests

```bash
yarn test
```

## Technologies Used

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose/Typegoose
- **Testing**: Jest, Supertest, mongodb-memory-server
- **Containerization**: Docker, Docker Compose
- **Package Manager**: Yarn 