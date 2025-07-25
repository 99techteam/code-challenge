# Express CRUD Server

A RESTful API server built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. Features JWT-based authentication and full CRUD operations for resource management.

## 📁 Project Structure

```
src/
├── app.ts              # Express application setup
├── server.ts           # Server entry point
├── config/
│   └── database.ts     # Database configuration
├── controllers/        # Route controllers
│   ├── auth.controller.ts
│   └── resource.controller.ts
├── middlewares/        # Custom middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── routes/            # API route definitions
│   ├── auth.routes.ts
│   └── resource.routes.ts
├── services/          # Business logic
│   ├── auth.service.ts
│   └── resource.service.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── validators/        # Input validation schemas
    ├── auth.validator.ts
    └── resource.validator.ts
prisma/
└── schema.prisma      # Database schema
```

## 🛠️ Tech Stack

- **Backend Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet.js, CORS
- **Containerization**: Docker & Docker Compose
- **Development**: Nodemon for hot-reload

## 🚀 Features

- **Authentication**: User registration and login with JWT tokens
- **CRUD Operations**: Complete resource management (Create, Read, Update, Delete)
- **Type Safety**: Full TypeScript implementation
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet.js for security headers, CORS enabled
- **Validation**: Request validation with Joi
- **Containerization**: Docker and Docker Compose support
- **Health Check**: Built-in health monitoring endpoint
- **Resource Filtering**: Query resources by name
- **Error Handling**: Centralized error middleware

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **PostgreSQL** 15+ (or use Docker)
- **Docker** and **Docker Compose** (for containerized setup)

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=db
POSTGRES_PORT=5432

NODE_ENV=development
APP_PORT=3000

JWT_SECRET=your-secret-jwt-key-here
```

> **Security Note**: Use a strong, unique JWT_SECRET in production. Generate one with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Database Schema

**Users Table**:

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Resources Table**:

- `id` (UUID, Primary Key)
- `name` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## 🏃‍♂️ Running the Application

### Local Development

1. **Clone and navigate to the project**:

   ```bash
   cd src/problem5
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env  # Then edit .env with your values
   ```

4. **Generate Prisma client**:

   ```bash
   npm run db:generate
   ```

5. **Set up the database**:

   ```bash
   # Push schema to database (development)
   npm run db:push

   # Or run migrations (production)
   npm run db:migrate
   ```

6. **Start development server**:

   ```bash
   npm run dev
   ```

7. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

### Docker Setup

1. **Navigate to the project**:

   ```bash
   cd src/problem5
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

This will automatically:

- Start PostgreSQL database
- Build and run the application
- Set up the database schema
- Make the API available on `http://localhost:3000`

#### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (caution: deletes data)
docker-compose down -v
```

## 📡 API Endpoints

### Base URL

```
http://localhost:3000
```

### Available Endpoints

| Method | Endpoint                       | Description                    | Authentication |
| ------ | ------------------------------ | ------------------------------ | -------------- |
| GET    | `/health`                      | Health check                   | No             |
| POST   | `/api/auth/register`           | User registration              | No             |
| POST   | `/api/auth/login`              | User login                     | No             |
| POST   | `/api/resources`               | Create a new resource          | Yes            |
| GET    | `/api/resources`               | Get all resources              | Yes            |
| GET    | `/api/resources?name=<filter>` | Get resources filtered by name | Yes            |
| GET    | `/api/resources/:id`           | Get a specific resource by ID  | Yes            |
| PUT    | `/api/resources/:id`           | Update a resource by ID        | Yes            |
| DELETE | `/api/resources/:id`           | Delete a resource by ID        | Yes            |

### Testing the API by curl

#### 1. Health Check

```bash
curl -X GET http://localhost:3000/health
```

#### 2. User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

#### 3. User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

**Response**: Save the `token` from the response for subsequent requests.

#### 4. Create a Resource

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "My Resource"
  }'
```

#### 5. Get All Resources

```bash
curl -X GET http://localhost:3000/api/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 6. Get Resources by Name Filter

```bash
curl -X GET "http://localhost:3000/api/resources?name=My Resource" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 7. Get Resource by ID

```bash
curl -X GET http://localhost:3000/api/resources/RESOURCE_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 8. Update a Resource

```bash
curl -X PUT http://localhost:3000/api/resources/RESOURCE_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Updated Resource Name"
  }'
```

#### 9. Delete a Resource

```bash
curl -X DELETE http://localhost:3000/api/resources/RESOURCE_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🔧 Development Workflow

1. **Start development server**: `npm run dev`
2. **Make schema changes**: Edit `prisma/schema.prisma` and run `npm run db:push`
3. **Test the API**: Use curl commands above or tools like Postman
4. **Build for production**: `npm run build`
