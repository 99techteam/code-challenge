# Crude Server (Express + TypeORM + SQLite)

## Overview

A simple CRUD backend server built with:

- Express.js
- TypeScript
- TypeORM
- SQLite
- Zod (validation)
- Swagger (API docs)

---

## Setup

### 1. Clone project

```bash
git clone https://github.com/tuankhang39/code-challenge
cd problem5
```

### 2. Install dependencies

```bash
npm install
```

---

## Database

This project uses **SQLite**, so no need to install database manually.

Database file:

```
dev.db
```

---

## Run application

### Development mode

```bash
npm run dev
```

Server will run at:

```
http://localhost:3000
```

---

## API Documentation (Swagger)

After running server, open:

```
http://localhost:3000/api-docs
```

---

## API Endpoints

### Users (`/api/v1/users`)

| Method | Endpoint          | Description                                     |
| ------ | ----------------- | ----------------------------------------------- |
| POST   | /api/v1/users     | Create a new user                               |
| GET    | /api/v1/users     | Get users with pagination, filters, and sorting |
| GET    | /api/v1/users/:id | Get user by ID                                  |
| PUT    | /api/v1/users/:id | Update user                                     |
| DELETE | /api/v1/users/:id | Delete user                                     |

---
