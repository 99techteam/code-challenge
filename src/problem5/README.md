## 🚀 Features

- CRUD Operations
- CQRS Pattern
- Request Validation
- Docker Support
- Swagger Documentation
- Logging

## 🚀 Quick Start

1. **Run the application:**
   ```bash
   docker-compose up -d
   ```

2. **Access the API documentation:**
   - Open your browser and go to: http://localhost:3000/api-docs/

### Reset Database (if needed):
```bash
# Stop containers and remove database volume
docker-compose down -v

# Start fresh (will re-run init.sql)
docker-compose up -d
```

## 🧪 Testing
```bash
# Linux/Mac - Automated test run with setup and cleanup
npm run test:docker

# Windows - Automated test run with setup and cleanup
npm run test:docker:windows
```