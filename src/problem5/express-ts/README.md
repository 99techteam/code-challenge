# Express TypeScript Product API

A simple REST API built with Express, TypeScript, and MongoDB (Mongoose) for managing products.

## Features

- Health check endpoint
- Create, read, update, and delete products
- List products with pagination and optional filters
- MongoDB connection via environment variables

## Tech Stack

- Node.js
- Express
- TypeScript
- Mongoose
- dotenv

## Project Structure

```text
src/
  index.ts                 # app entrypoint
  configs/
    index.ts               # config initializer
    mongodb.ts             # MongoDB connection
  controllers/
    product.controller.ts  # product handlers
  models/
    products.model.ts      # product schema/model
  routes/
    index.ts               # base router
    product.route.ts       # product routes
```

## Prerequisites

- Node.js 18+
- npm or yarn
- A MongoDB instance (local or cloud)

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=your_database_name
```

## Installation

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

## Run the App

Development mode (with auto-reload):

```bash
npm run dev
```

Start mode:

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

## API Endpoints

Base path: `/api`

### Health Check

- `GET /healthcheck`

Response:

```json
{ "status": "ok" }
```

### Create Product

- `POST /api/product`

Request body:

```json
{
  "name": "Keyboard",
  "price": 49.99,
  "description": "Mechanical keyboard"
}
```

### Get Product by ID

- `GET /api/product/:id`

### Update Product

- `PUT /api/product/:id`

Request body (any updatable fields):

```json
{
  "name": "Keyboard Pro",
  "price": 79.99,
  "description": "Updated description"
}
```

### Delete Product

- `DELETE /api/product/:id`

### Get All Products

- `GET /api/products`

Optional query params:

- `page` (default: `1`)
- `limit` (default: `10`)
- `name` (case-insensitive partial match)
- `price` (exact number match)

Example:

```http
GET /api/products?page=1&limit=5&name=key&price=49.99
```

## Notes

- If `MONGO_URI` or `MONGO_DB` is missing, the app will throw an error during startup.
- JSON request parsing is enabled globally.
