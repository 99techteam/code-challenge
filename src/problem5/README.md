# A simple CRUD API for managing book data.

## Setup

1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run start
   ```
   The server runs at `http://localhost:4000/`.

## API Endpoints

- **GET** `/book` - Get all books
- **GET** `/book/:id` - Get a specific book
- **POST** `/book` - Create a book
  ```json
  { "title": "SGK", "author": "Viet Nam", "price": 100000 }
  ```
- **PUT** `/book/:id` - Update a book
  ```json
  { "title": "SGK", "author": "Ho Chi Minh", "price": 100000 }
  ```
- **DELETE** `/book/:id` - Delete a book

## Testing

Use **Postman** to test the API endpoints.

Happy coding! 🚀
