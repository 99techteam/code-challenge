# TypeScript Express API with Drizzle ORM

A TypeScript Express.js application with Drizzle ORM and PostgreSQL support.

## Features

- Express.js with TypeScript
- Drizzle ORM for database operations
- PostgreSQL database support
- Database migrations
- Environment configuration
- Logging with Winston
- Error handling middleware
- JSON response middleware

## Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` file with your database configuration:
```env
# Server Configuration
PORT=3005
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=test2_db
```

3. Create the PostgreSQL database:
```sql
CREATE DATABASE test2_db;
```

### Database Setup

1. Generate initial migration:
```bash
npm run db:generate
```

2. Run migrations:
```bash
npm run db:migrate
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. The server will start on `http://localhost:3005`

3. (Optional) Seed the database with demo data:
```bash
npm run db:fresh
```

### Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Database Scripts

### Migration Scripts
- `npm run db:generate` - Generate new migration files from schema changes
- `npm run db:migrate` - Run pending migrations with Drizzle Kit
- `npm run db:migrate:run` - Run migrations programmatically
- `npm run db:push` - Push schema changes directly to database (development only)
- `npm run db:studio` - Open Drizzle Studio for database management

### Data Seeding Scripts
- `npm run db:seed` - Seed database with random data using drizzle-seed (10 users, 50 entities)
- `npm run db:seed:demo` - Seed database with specific demo data (4 users, 7 entities)
- `npm run db:seed:bulk` - Seed database with bulk data for testing (100 users, 900 entities)
- `npm run db:reset` - Clear all data from the database
- `npm run db:fresh` - Reset database and seed with demo data
- `npm run db:fresh:bulk` - Reset database and seed with bulk data

## API Endpoints

### Entities

- `GET /api/v1/entities` - List entities with pagination and search
  - Query parameters: `search`, `sort`, `page`, `pageSize`
- `GET /api/v1/entities/:id` - Get entity by ID
- `POST /api/v1/entities` - Create new entity
- `PUT /api/v1/entities/:id` - Update entity
- `DELETE /api/v1/entities/:id` - Delete entity

## Database Schema

### Users Table
- `id` (UUID, primary key)
- `email` (varchar, unique)
- `name` (varchar)
- `password` (varchar)
- `isActive` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Entities Table
- `id` (UUID, primary key)
- `name` (varchar)
- `description` (text)
- `type` (varchar)
- `status` (varchar)
- `metadata` (text, JSON)
- `createdBy` (UUID, foreign key to users)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Project Structure

```
src/
├── controllers/         # Route controllers
├── lib/                 # Database configuration and schema
├── middlewares/         # Express middlewares
├── routes/              # API routes
├── services/            # Business logic services
├── utils/               # Utility functions
└── @types/              # TypeScript type definitions
```
