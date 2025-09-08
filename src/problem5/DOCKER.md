# 🐳 Docker Deployment Guide

This guide covers how to deploy the Backend CRUD Server using Docker for both development and production environments.

## 📋 Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

## 🚀 Quick Start with Docker

### Production Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Or build and run manually:**
   ```bash
   # Build the image
   docker build -t backend-crud-server .
   
   # Run the container
   docker run -d \
     --name backend-crud-server \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     backend-crud-server
   ```

3. **Access the application:**
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

### Development with Docker

1. **Start development environment:**
   ```bash
   docker-compose --profile dev up -d app-dev
   ```

2. **Or manually with development Dockerfile:**
   ```bash
   # Build development image
   docker build -f Dockerfile.dev -t backend-crud-server:dev .
   
   # Run with volume mounting for hot reload
   docker run -d \
     --name backend-crud-server-dev \
     -p 3000:3000 \
     -v $(pwd):/app \
     -v /app/node_modules \
     backend-crud-server:dev
   ```

## 📁 Docker Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Production-ready multi-stage build |
| `Dockerfile.dev` | Development with hot reload |
| `docker-compose.yml` | Orchestration for both environments |
| `.dockerignore` | Files to exclude from Docker context |

## 🔧 Configuration

### Environment Variables

The Docker containers support these environment variables:

```bash
NODE_ENV=production      # Environment mode
PORT=3000               # Application port
DB_TYPE=sqlite          # Database type
DB_NAME=database.sqlite # Database file name
```

### Volume Mounting

- **Production**: `./data:/app/data` - Persists SQLite database
- **Development**: `.:/app` - Live code reloading

## 🛠️ Docker Commands

### Basic Operations
```bash
# Build production image
docker build -t backend-crud-server .

# Build development image
docker build -f Dockerfile.dev -t backend-crud-server:dev .

# Run production container
docker run -p 3000:3000 backend-crud-server

# Run with environment variables
docker run -p 3000:3000 -e NODE_ENV=production backend-crud-server

# Run in background
docker run -d -p 3000:3000 --name my-app backend-crud-server
```

### Container Management
```bash
# View running containers
docker ps

# View logs
docker logs backend-crud-server

# Stop container
docker stop backend-crud-server

# Remove container
docker rm backend-crud-server

# Remove image
docker rmi backend-crud-server
```

### Docker Compose Commands
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up app

# Start development environment
docker-compose --profile dev up app-dev

# View logs
docker-compose logs

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

## 📊 Health Monitoring

The Docker container includes health checks:

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect --format='{{json .State.Health}}' backend-crud-server
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Use different port
   docker run -p 3001:3000 backend-crud-server
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER ./data
   ```

3. **Container won't start:**
   ```bash
   # Check logs
   docker logs backend-crud-server
   
   # Run interactively for debugging
   docker run -it backend-crud-server sh
   ```

4. **Database issues:**
   ```bash
   # Remove old database and restart
   rm -rf ./data
   docker-compose down && docker-compose up -d
   ```

### Debugging
```bash
# Execute commands in running container
docker exec -it backend-crud-server sh

# View container filesystem
docker exec -it backend-crud-server ls -la

# Check processes
docker exec -it backend-crud-server ps aux
```

## 🚀 Production Deployment

### Cloud Deployment (Example with DigitalOcean)

1. **Create Droplet** with Docker pre-installed

2. **Clone and deploy:**
   ```bash
   git clone <your-repo>
   cd backend-crud-server
   docker-compose up -d
   ```

3. **Set up reverse proxy** (nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Docker Hub Deployment

1. **Build and tag:**
   ```bash
   docker build -t yourusername/backend-crud-server .
   ```

2. **Push to Docker Hub:**
   ```bash
   docker push yourusername/backend-crud-server
   ```

3. **Deploy anywhere:**
   ```bash
   docker run -d -p 3000:3000 yourusername/backend-crud-server
   ```

## 🔒 Security Considerations

- Container runs as non-root user
- Multi-stage build reduces image size
- Health checks monitor application status
- Environment variables for sensitive configuration
- SQLite database persisted in volumes

## 📈 Performance Optimization

- **Multi-stage build** reduces final image size
- **Alpine Linux** for smaller footprint
- **Production dependencies only** in final image
- **Health checks** for container orchestration
- **Proper caching** of npm dependencies

## 🔄 CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t backend-crud-server .
      - name: Run tests
        run: docker run --rm backend-crud-server npm test
```

This Docker setup provides a robust foundation for deploying your Backend CRUD Server in any environment! 🚀
