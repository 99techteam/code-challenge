# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Option 1: Traditional Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

#### 3. Open API Documentation
Visit: http://localhost:3000/api-docs

### Option 2: 🐳 Docker Setup (Recommended)

#### 1. Start with Docker Compose
```bash
docker-compose up -d
```

#### 2. Open API Documentation
Visit: http://localhost:3000/api-docs

#### 3. Optional: Seed Sample Data
```bash
docker exec -it backend-crud-server npm run seed
```

### Option 3: Development with Docker
```bash
# Start development environment with hot-reload
npm run docker:up:dev
```

## 🎯 Test the API

### Quick Test Commands

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Create a Book**
   ```bash
   curl -X POST http://localhost:3000/api/books \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Book",
       "author": "Test Author",
       "publishedYear": 2023
     }'
   ```

3. **Get All Books**
   ```bash
   curl http://localhost:3000/api/books
   ```

4. **Seed Sample Data**
   ```bash
   npm run seed
   ```

## 📚 What's Available

- ✅ Full CRUD operations for books
- ✅ Filtering and pagination
- ✅ Search functionality
- ✅ Input validation
- ✅ Error handling
- ✅ API documentation with Swagger
- ✅ TypeScript support
- ✅ SQLite database with TypeORM
- ✅ **Docker deployment support** 🐳

## 🐳 Docker Commands

```bash
# Quick production deployment
docker-compose up -d

# Development with hot-reload
npm run docker:up:dev

# View logs
npm run docker:logs

# Stop containers
npm run docker:down

# Build custom image
npm run docker:build
```

📖 **For complete Docker guide, see [DOCKER.md](./DOCKER.md)**

## 🔗 Key Endpoints

- **API Docs**: http://localhost:3000/api-docs
- **Health**: http://localhost:3000/health
- **Books**: http://localhost:3000/api/books

Enjoy exploring the API! 🎉
