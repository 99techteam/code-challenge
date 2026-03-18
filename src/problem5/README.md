# Problem 5
Develop a backend server with ExpressJS. You are required to build a set of CRUD interface that allow a user to interact with the service. You are required to use TypeScript for this task.

1. Interface functionalities:
    1. Create a resource.
    2. List resources with basic filters.
    3. Get details of a resource.
    4. Update resource details.
    5. Delete a resource.
2. You should connect your backend service with a simple database for data persistence

**Implementation**
This project implements a backend service using **Hexagonal Architecture** (also known as Ports and Adapters) combined with **Domain Driven Design (DDD)** principles.

## Project Structure

- **domain/**
	- Contains the core business logic and interfaces (DTOs (), repositories, services).
	- This layer is independent of external frameworks and technologies.

- **ports/**
	- **primary/**
		- Contains controllers and service implementations that handle user requests, input, and interactions.
		- Acts as the entry point for the application (e.g., HTTP controllers).
	- **secondary/**
		- Contains adapters for third-party connections such as databases, AWS, or other external services.
		- Implements interfaces defined in the domain layer.

- **configs/**
	- Contains configuration files and middleware (e.g., error handling, auth, infra, ...).

- **tests/**
	- Contains unit and integration tests for services and other components.

## Architectural Overview

- **Hexagonal Architecture** separates the core business logic from external concerns, making the system flexible and easy to adapt to new requirements.
- **Domain Driven Design** focuses on modeling the business domain with rich, meaningful abstractions.

### Domain Layer
- Defines interfaces and business rules.
- No dependencies on frameworks or external systems.

### Ports
- **Primary Port:** Handles incoming requests (controllers, service implementations).
- **Secondary Port:** Manages outgoing connections (database, external APIs, etc.).

## How to Use
- Add new business logic in the `domain/` folder.
- Implement interfaces in the `ports/secondary/` folder for external integrations.
- Handle user requests in the `ports/primary/` folder.

## Testing
- Tests are located in the `tests/` directory.

---

For more details, see the code structure and comments in each folder.
## How to Run

1. In the root folder, run:
	```bash
	npm install
	```
2. Start the service:
	```bash
	npm run dev-5
	```

The service will start on **localhost:3000**.

The collections for this app is linked at `src/problem5/collection.json`

## How to Test

1. In the root folder, run:
	```bash
	npm install
	```
2. Run the tests:
	```bash
	npm run test-5
	```

## Additional Notes

- **Environment** No environment variables are required for setup convenience.
- **Authentication:** This project does not implement any authentication methods, as they are not required by the current specifications.
- **Database:** The service uses SQLite, which requires no further setup or configuration.


## Issues

- If another application is already running on port 3000, this app will stop by default and not start. Ensure port 3000 is available before running the service.