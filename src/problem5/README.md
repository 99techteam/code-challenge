
# Problem 5: Resource Management API
I designed this project with the following principles in mind:

Type Safety: Using TypeScript ensures compile-time type checking, reducing runtime errors and improving developer productivity through better IDE support (e.g., autocompletion, refactoring).
Modular Structure: The code is organized into clear directories (e.g., controllers, models, routes) following the MVC (Model-View-Controller) pattern adapted for APIs. This promotes separation of concerns, making the codebase easier to maintain, scale, and test.
Error Handling and Validation: Custom error classes and middleware (using express-validator and express-async-handler) handle asynchronous operations gracefully, providing meaningful error responses and preventing unhandled promise rejections.
Data Persistence: MongoDB was chosen as a NoSQL database for its flexibility with schema-less data, horizontal scalability, and ease of integration with Node.js via Mongoose ODM (Object Data Modeling).
Documentation: Swagger integration ensures self-documenting APIs, which is crucial for team collaboration, onboarding new developers, and API consumers.
Testing: Unit tests with Jest and Supertest cover core functionalities, ensuring reliability and facilitating CI/CD pipelines.
Containerization: Docker for MongoDB allows for consistent environments across development, testing, and production, avoiding "it works on my machine" issues.
Best Practices: Environment variables for configuration (via .env), async/await for readability, and seed data for quick setup demonstrate adherence to 12-factor app principles.

This setup is suitable for a microservice or as a starting point for larger applications, emphasizing reliability, maintainability, and developer experience.
Features

CRUD Operations: Create, list (with filters), get, update, and delete resources.
Filtering: Basic query parameters for listing resources (e.g., by name, value range).
Validation: Input validation for create and update operations to ensure data integrity.
Error Handling: Custom HTTP error responses for not found, validation failures, etc.
Data Seeding: Automatically inserts initial data if the collection is empty on startup.
API Documentation: Interactive Swagger UI for exploring and testing endpoints.
Testing: Unit tests for controllers and routes.
Docker Support: Run MongoDB in a container for easy setup.

Code Structure
The project follows a clean, modular architecture:
express-mongodb-crud-api/
├── src/
│   ├── config/
│   │   ├── database.ts     # MongoDB connection and seeding logic
│   │   └── swagger.ts      # Swagger OpenAPI specification and setup
│   ├── controllers/
│   │   └── resourceController.ts  # Business logic for CRUD operations
│   ├── models/
│   │   └── Resource.ts     # Mongoose schema and interface for Resource
│   ├── routes/
│   │   └── resourceRoutes.ts  # Express routes with validators and Swagger JSDoc
│   ├── middleware/
│   │   └── validation.ts   # Express-validator rules for requests
│   ├── utils/
│   │   └── errorHandler.ts # Custom error classes and global error middleware
│   ├── types/
│   │   └── index.ts        # Custom TypeScript types (e.g., for errors)
│   ├── __tests__/
│   │   ├── resourceController.test.ts  # Unit tests for controllers
│   │   └── resourceRoutes.test.ts      # Integration tests for routes
│   ├── app.ts              # Express app setup (middleware, routes, Swagger)
│   ├── server.ts           # Server entry point (starts HTTP server)
│   └── seed.ts             # Seed data definition and insertion logic
├── .env                    # Environment variables (not committed)
├── .gitignore              # Files to ignore in Git
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript compiler options
├── docker-compose.yml      # Docker Compose for MongoDB
└── README.md               # This file


Why this structure? It scales well: New features can be added by creating additional controllers/routes/models without affecting existing code. Tests are co-located in __tests__ for easy discovery. Config and utils are separated for reusability.

Prerequisites

Node.js >= 20 (for modern features like top-level await)
Docker and Docker Compose (for running MongoDB in a container)
Git (for cloning the repository)

Step-by-Step Setup and Running
1. Clone the Repository
Clone the project from your Git repository:
git clone https://github.com/pqlogdev/code-challenge-99techteam.git
cd code-challenge-99techteam/src/problem5

2. Install Dependencies
Install all required Node.js packages:
npm install

This installs production dependencies (e.g., Express, Mongoose, Swagger) and dev dependencies (e.g., Jest, TypeScript).
3. Configure Environment Variables

Edit .env with your text editor:

Set MONGO_URI=mongodb://localhost:27017/resource_db (default for local/Docker MongoDB)
Optionally set PORT=5000 (or another port)

Why? Environment variables keep sensitive/configurable data out of code, enhancing security and flexibility.
4. Run MongoDB with Docker
Start MongoDB in a Docker container for persistence:
docker-compose up -d


This pulls the mongo:7.0 image if needed, maps port 27017, and uses a volume for data persistence.
Verify it's running: docker ps (look for the mongo container).
Stop it later with: docker-compose down

Why Docker? It ensures a consistent MongoDB setup across machines, isolates the database, and simplifies versioning.
5. Run the Application
```
npm run dev
```

OR Production
```
npm run build
```
```
npm start
```

The server starts on http://localhost:5000. On first run, if the database is empty, seed data (10 sample resources) is automatically inserted.

6. Access API Documentation
With the server running, open Swagger UI in your browser:
http://localhost:5000/api-docs


Interact with endpoints: Try creating a resource, listing them, etc.
Why Swagger? It provides interactive docs, auto-generated from code, reducing manual documentation effort and errors.

7. Test the API
Use tools like Postman, curl, or Swagger UI to test:

POST /api/resources: { "name": "Test", "value": 10 }
GET /api/resources?name=Test&minValue=5&maxValue=15
And more (see Swagger for details).

8. Run Unit Tests
Execute tests to verify functionality:
npm test


This runs Jest tests for controllers (logic) and routes (integration).
Coverage report is generated for insights.

Why tests? They catch regressions early, document expected behavior, and build confidence in code changes. As a senior engineer, I prioritize TDD/BDD for maintainable code.
Troubleshooting

MongoDB Connection Issues: Ensure Docker is running and port 27017 is free. Check logs: docker logs <container-name>.
Port Conflicts: Change PORT in .env if 5000 is in use.
TypeScript Errors: Run npm run build to check compilation.
Swagger Not Loading: Verify the server is running and access /api-docs.