# Quick Start Guide

## Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

Then follow the on-screen instructions.

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb?schema=public"
```

### 3. Start PostgreSQL

**Using Docker (Easiest):**

```bash
npm run docker:up
```

**Or use your local PostgreSQL installation**

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. (Optional) Seed Sample Data

```bash
npm run prisma:seed
```


### 6. Start Development Server

```bash
npm run dev
```

The API will be running at: http://localhost:3000

### 7. View API Documentation (Swagger UI)

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```


## Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Task",
    "description": "This is a test task",
    "status": "TODO"
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Get Task by ID

```bash
curl http://localhost:3000/api/tasks/{task-id}
```

### Update a Task

```bash
curl -X PATCH http://localhost:3000/api/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Delete a Task (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/api/tasks/{task-id}
```

### Restore a Deleted Task

```bash
curl -X POST http://localhost:3000/api/tasks/{task-id}/restore
```

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

## Docker Deployment

```bash
# Start all services (PostgreSQL + API)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

## Prisma Studio (Database GUI)

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```env
PORT=3001
```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `createdb taskdb`
4. Try running migrations again: `npm run prisma:migrate`

### Prisma Client Issues

Regenerate Prisma Client:

```bash
npm run prisma:generate
```

### Node Modules Issues

Clear and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Review the full API documentation in `README.md`
- Explore the codebase in `src/`
- Review and run tests in `tests/`
- Customize the Task model in `prisma/schema.prisma`
- Add authentication and authorization
- Add more entities and relationships

## Project Structure Overview

```
express-task-api/
├── src/               # Source code
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middlewares/  # Express middlewares
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── tests/            # Test files
│   ├── unit/        # Unit tests
│   └── integration/ # Integration tests
├── prisma/          # Database schema and migrations
└── Docker files     # Container configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed sample data |
| `npm run docker:up` | Start Docker containers |

For more detailed information, see `README.md`
