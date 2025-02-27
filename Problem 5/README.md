# Express TypeScript CRUD API with SQLite

A RESTful API built with Express.js and TypeScript that provides CRUD operations for a product resource. The API uses SQLite for data persistence.

## Features

- Create, Read, Update, and Delete products
- Filter products by category, price range, and availability
- TypeScript for type safety
- SQLite for lightweight, file-based data storage
- Express.js for handling HTTP requests
- Sequelize ORM for database operations

## API Endpoints

### Products

| Method | Endpoint            | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| POST   | `/api/products`     | Create a new product                     |
| GET    | `/api/products`     | Get all products (with optional filters) |
| GET    | `/api/products/:id` | Get a specific product by ID             |
| PUT    | `/api/products/:id` | Update a product                         |
| DELETE | `/api/products/:id` | Delete a product                         |

### Filtering Products

You can filter products using query parameters:

- `category`: Filter by product category
- `inStock`: Filter by availability (true/false)
- `minPrice`: Filter by minimum price
- `maxPrice`: Filter by maximum price

## Request and Response Examples

### Create a Product

Request:

```http
POST /api/products
Content-Type: application/json

{
  "name": "Smartphone",
  "description": "Latest model with advanced features",
  "price": 699.99,
  "category": "electronics",
  "inStock": true
}
```

Response:

```json
{
  "id": 1,
  "name": "Smartphone",
  "description": "Latest model with advanced features",
  "price": 699.99,
  "category": "electronics",
  "inStock": true,
  "createdAt": "2023-08-15T14:23:22.123Z",
  "updatedAt": "2023-08-15T14:23:22.123Z"
}
```

### Get a Product

Request:

```http
GET /api/products/1
```

Response:

```json
{
  "id": 1,
  "name": "Smartphone",
  "description": "Latest model with advanced features",
  "price": 699.99,
  "category": "electronics",
  "inStock": true,
  "createdAt": "2023-08-15T14:23:22.123Z",
  "updatedAt": "2023-08-15T14:23:22.123Z"
}
```

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── product.controller.ts
│   ├── models/
│   │   └── product.model.ts
│   ├── routes/
│   │   └── product.routes.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── database.sqlite
├── package.json
├── tsconfig.json
└── README.md
```

## License

This project is licensed under the MIT License.
