# My Awesome Express.js / TypeScript API

This is a robust and scalable API built with Express.js and TypeScript, using PostgreSQL as the database. It leverages Knex.js for database migrations and seeding, and Docker Compose for easy database setup.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Installation](#installation)
3.  [Configuration](#configuration)
4.  [Database Setup (Docker)](#database-setup-docker)
5.  [Running the Development Server](#running-the-development-server)
6.  [Database Migrations & Seeding](#database-migrations--seeding)
7.  [API Endpoints & Testing (cURL Examples)](#api-endpoints--testing-curl-examples)
8.  [Project Structure](#project-structure)
9.  [Scripts](#scripts)
10. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: v18 or higher (LTS recommended)
- **npm**: Comes with Node.js
- **Docker & Docker Compose**: For running the PostgreSQL database
- **TypeScript**: (Optional, but good to have globally for `tsc --init` etc.) `npm install -g typescript`
- **Knex CLI**: (Optional, but useful for direct commands) `npm install -g knex`

---

## 2. Installation

1.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

---

## 3. Configuration

This project uses environment variables for configuration.

1.  **Create `.env.development` file:**
    Copy the provided `.env.example` file and rename it to `.env.development` in the root of your project.

    ```bash
    cp .env.example .env.development
    ```

2.  **Edit `.env.development`:**
    Open the newly created `.env.development` file and fill in the values. The default values should work for local development with the provided Docker Compose setup.

    ```dotenv
    # .env.development

    ## Environment ##
    NODE_ENV=development

    ## Server ##
    PORT=4000
    HOST=localhost

    ## Setup jet-logger ##
    JET_LOGGER_MODE=CONSOLE
    JET_LOGGER_FILEPATH=jet-logger.log
    JET_LOGGER_TIMESTAMP=TRUE
    JET_LOGGER_FORMAT=LINE

    # DB
    DB_MASTER_HOST=localhost
    # DB_SLAVE_HOST=localhost # Only needed if you have a read replica
    DB_USER=admin
    DB_PASSWORD=admin
    DB_NAME=crude
    DB_PORT=15432

    # CORS
    CORS_ORIGIN_PORT=4000,14000
    ```

---

## 4. Database Setup (Docker)

We use Docker Compose to spin up a PostgreSQL database instance.

1.  **Ensure Docker is running** on your system.
2.  **Start the database container:**

    ```bash
    docker-compose -f docker-compose.local.yml up -d
    ```

    This command uses `docker-compose.local.yml` to start a PostgreSQL 13 container in detached mode (`-d`). The database will be accessible on your host machine at `localhost:15432`.

3.  **Verify the database container is running:**
    ```bash
    docker ps
    ```

---

## 5. Running the Development Server

The development server uses `nodemon` to automatically restart the application when file changes are detected.

1.  **Ensure you have completed steps 2, 3, and 4.**
2.  **Start the development server:**

    ```bash
    npm run dev
    ```

    This command will:

    - Set `NODE_ENV` to `development`.
    - Use `nodemon` to watch for changes.
    - Execute your `src/app.ts` using `ts-node`, pre-loading environment variables via `dotenv/config`.
    - Perform a database connection test at startup. If it fails, the server will not start.

    You should see output indicating the server is running on `http://localhost:4000` (or your configured port).

---

## 6. Database Migrations & Seeding

After the database container is running and the server has started (or even before, if you prefer), you'll want to set up your database schema and populate it with initial data.

**Note:** Ensure your development server is running (`npm run dev`) or at least the Docker database is up.

### Create a New Migration

To generate a new migration file:

```bash
npm run knex migrate:make your_migration_name
```

To apply any unapplied migrations to your database:

```bash
npm run knex migrate:latest
```

To generate a new seed file:

```bash
npm run knex seed:make your_seed_name
```

To populate your database with seed data:

```bash
npm knex seed:run
```

## 7. API Endpoints & Testing (cURL Examples)

Once your server is running, you can test the API endpoints.
Base URL: http://localhost:4000

### Get Product List

Query with name, range of price

```bash
curl -X GET "http://localhost:4000/api/v1/product" \
 -H "Content-Type: application/json"
```

### Get Product Detail

```bash
curl -X GET "http://localhost:4000/api/v1/product/[id]" \
 -H "Content-Type: application/json"
```

### Create Product

```bash
curl -X POST "http://localhost:4000/api/v1/product" \
 -H "Content-Type: application/json" \
 -d '{
"name": "New Awesome Gadget",
"description": "The latest and greatest gadget!",
"imageUrl": "http://example.com/gadget.jpg",
"price": 1499.99,
"publishDate": "2023-10-26",
"manufacturer": "TechCo"
}'
```

### Update Product

```bash
curl -X PUT "http://localhost:4000/api/v1/product/[id]" \
 -H "Content-Type: application/json" \
 -d '{
"name": "New Awesome Gadget",
}'
```

### Delete Product

```bash
curl -X PUT "http://localhost:4000/api/v1/product/[id]" \
 -H "Content-Type: application/json"
```
