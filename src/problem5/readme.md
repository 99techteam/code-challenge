# Node.js Express CRUD API with MySQL, Sequelize, and Docker

## 🚀 Project Overview
This is a **Node.js + Express** API with **MySQL & Sequelize** for user management. The API supports **CRUD operations** with filtering capabilities and runs in a **Dockerized environment**.

---

## 📌 Setup Instructions

### 1. **Create a `.env` File**
Create a `.env` file in the project root with:
```env
DB_HOST=mysql
DB_USER=root
DB_PASS=root
DB_NAME=node_db
DB_DIALECT=mysql
```

### 2. **Run Docker Containers**
```sh
docker-compose up -d --build
```

### 3. **Install node package**
```sh
docker-compose exec app
yarn or yarn install
```

### 4. **Run Migrations**
```sh
docker-compose exec app npx sequelize-cli db:migrate
```

### 5️⃣ **Start the Server (If Not Running in Docker)**
```sh
yarn dev
```

---

## 📌 API Endpoints

### **1️⃣ User Management**

Method	Endpoint	Description
GET	/users	Get all users (supports ?name and ?email filters).
GET	/users/:id	Get a specific user by ID.
POST	/users	Create a new user.
PUT	/users/:id	Update a user by ID.
DELETE	/users/:id	Delete a user by ID.

#### 🔹 Get All Users (With Filtering)
```http
GET /users
```
✅ **Query Parameters:**
- `name` → Filter by name (partial match)
- `email` → Filter by email (partial match)

**Example Request:**
```sh
curl -X GET "http://localhost:3000/users?name=Long"
```

---

#### 🔹 Get a User by ID
```http
GET /users/:id
```
**Example Request:**
```sh
curl -X GET "http://localhost:3000/users/1"
```

---

#### 🔹 Create a New User
```http
POST /users
```
✅ **Request Body (JSON):**
```json
{
  "name": "Long Pham",
  "email": "phlong1011@gmail.com"
}
```
**Example Request:**
```sh
curl -X POST "http://localhost:3000/users" -H "Content-Type: application/json" -d '{"name": "Long Pham", "email": "phlong1011@gmail.com"}'
```

---

#### 🔹 Update a User by ID
```http
PUT /users/:id
```
✅ **Request Body (JSON):**
```json
{
  "name": "Long Pham",
  "email": "phlong1011@gmail.com"
}
```
**Example Request:**
```sh
curl -X PUT "http://localhost:3000/users/1" -H "Content-Type: application/json" -d '{"name": "Long Pham", "email": "phlong1011@gmail.com"}'
```

---

#### 🔹 Delete a User by ID
```http
DELETE /users/:id
```
**Example Request:**
```sh
curl -X DELETE "http://localhost:3000/users/1"
```

---

Let me know if you need any improvements! 😃

