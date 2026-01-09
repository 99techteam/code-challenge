# Problem 5 - CRUD API Server with OAuth
A scalable Node.js + Express + TypeScript boilerplate following Clean Architecture principles, supporting OAuth-style authentication, MongoDB & SQLite repositories, and user management APIs.

This project is designed for production readiness, testability, and easy extensibility.

## ✨ Features
- ✅ Clean Architecture (Application / Domain / Infrastructure / Interface)
- ✅ OAuth-style Authentication (JWT)
- ✅ Basic & Bearer Authentication
- ✅ User Registration & Login
- ✅ User CRUD APIs
- ✅ MongoDB & SQLite Support (Repository Pattern)
- ✅ Password Encryption
- ✅ Centralized Error Handling
- ✅ Request Logging
- ✅ TypeScript Strict Mode
- ✅ ESLint & Prettier
- ✅ Husky Git Hooks

## 🧱 Tech Stack
- Node.js (>= 20)
- ExpressJS
- TypeScript
- SQLite or MongoDB
- JWT
- bcrypt
- dotenv
- nodemon

## 📁 Project Structure
```
problem5/
├── .husky/                  # Git hooks
├── .vscode/                 # Editor settings
├── logs/                    # Application logs
├── .env                     # Environment variables
├── .env.example
├── nodemon.json
├── tsconfig.json
├── src/
│   ├── application/         # Application business rules
│   │   ├── controller/
│   │   │   ├── error/
│   │   │   │   └── AlreadyExistUserError.ts
│   │   │   └── User.ts
│   │   └── usecase/
│   │       ├── GetUserInformationUsecase.ts
│   │       ├── StoreUserInformationUsecase.ts
│   │       └── UpdateUserInformationByIdUsecase.ts
│   │
│   ├── domain/              # Domain layer (entities & contracts)
│   │   ├── interfact/
│   │   │   ├── error.ts
│   │   │   ├── index.ts
│   │   │   ├── interface.ts
│   │   │   └── repository.ts
│   │   └── schema/
│   │       └── index.ts
│   │
│   ├── infra/               # Infrastructure implementations
│   │   └── repository/
│   │       ├── mongo/
│   │       │   └── index.ts
│   │       └── sqlite/
│   │           └── index.ts
│   │
│   ├── interface/           # Delivery layer (HTTP)
│   │   └── server/
│   │       ├── handler/
│   │       │   ├── DeleteUserInformationHandler.ts
│   │       │   ├── GetAllUserInforamtionHandler.ts
│   │       │   ├── GetUserInformationByEmailHandler.ts
│   │       │   ├── GetUserInformationByIdHandler.ts
│   │       │   ├── LoginUserHandler.ts
│   │       │   ├── StoreUserInformationHandler.ts
│   │       │   └── UpdateUserInformationByIdHandler.ts
│   │       ├── middleware/
│   │       │   ├── AsyncMiddleware.ts
│   │       │   ├── AuthMiddleware.ts
│   │       │   └── CorsMiddleware.ts
│   │       ├── routes/
│   │       │   ├── auth.ts
│   │       │   ├── web.ts
│   │       │   └── index.ts
│   │       └── app.ts
│   │
│   ├── db/
│   │   └── data.db           # SQLite database
│   │
│   ├── utils/
│   │   ├── Logger.ts
│   │   └── index.ts
│   │
│   ├── bootstrap.ts          # App initialization
│   └── index.ts              # Entry point
```

## Configuration

- Copy `.env.example` to `.env`
- Modify the `MONGO_URL` & `MONGO_DBNAME`
- Custom `APP_KEY` // that will use password encryption

## Important Notes

- `APP_KEY` is used for password encryption
- `JWT_SECRET` is used for signing access tokens
- `APP_MODE` is `local` for `SQLite`, otherwise for `MongoDB`

## Installation Needs

- `npm install`

## Running Project

- `npm run start:dev` with nodemon server

## API endpoints

### API Authentication Types

- BearerBearer Token (JWT)

### Public (No Middleware)
#### Register
- [POST]http://localhost:3000/register
```
{
  "email": "user3@example.com",
  "password": "PlainTextPassword123",
  "name": "Test Doe1",
  "picture": null,
  "phone": "+95-115-123-4569",
  "city": "Yangon",
  "address": "123 Main Street, NY",
  "age": 28,
  "gender": "female",
  "fatherName": "Jhon Doe",
  "joinDate": "2026-01-01",
  "userRole": 1,
  "isBlock": false
}
```
#### Login
- [POST]http://localhost:3000/login
```
{
  "email": "user@example.com",
  "password": "password123"
}
```
##### Response 
```
{
  "accessToken": "jwt-token-here"
}
```

### Protected APIs (Auth Required)
#### Header:
```
Authorization: Bearer <token>
```
```
| Method | Endpoint        | Description                          |
| ------ | --------------- | ------------------------------------ |
| GET    | `/`             | Server health                        |
| GET    | `/user/all`     | Get all users (pagination & filters) |
| GET    | `/user/:userId` | Get user by ID                       |
| PUT    | `/user/:userId` | Update user                          |
| DELETE | `/user/:userId` | Delete user                          |

```

##### Filter Options:
```
{
  email?: string;
  name?: string;
  city?: string;
  gender?: string;
  userRole?: number;
  isBlock?: number;
}
```
##### Pagination Options:
```
{
  page?: number; // default:1
  limit?: number; // default: 10
}
```
## 📮 Postman Collection

You can test all available APIs using the provided Postman collection.

### Steps to use:

1. Download the Postman collection JSON file  
2. Open **Postman**
3. Click **Import**
4. Select the downloaded JSON file

👉 **[Download Postman Collection](https://drive.google.com/file/d/12V5q2iwfV-sb78Sj9QHsTgdvgtdCUi16/view?usp=sharing)**

> Make sure your server is running and the `.env` configuration is correctly set before testing the APIs.


## Development Notes
- Repository can switch between MongoDB or SQLite
- Business logic isolated in Use Cases
- Domain layer has no framework dependencies
- Centralized logging via Logger

## Future Improvements
- 🔁 Refresh Tokens
- 👥 Role-Based Access Control
- 📄 Swagger / OpenAPI Docs
- 🧪 Unit & Integration Tests
- 🐳 Docker Support


## Feedbacks

- dev.aungkyawhtwe@gmail.com[dev.aungkyawhtwe@gmail.com]
