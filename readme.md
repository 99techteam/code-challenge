# 99Tech Code Challenge #1 #

Note that if you fork this repository, your responses may be publicly linked to this repo.  
Please submit your application along with the solutions attached or linked.   

It is important that you minimally attempt the problems, even if you do not arrive at a working solution.

## Submission ##
You can either provide a link to an online repository, attach the solution in your application, or whichever method you prefer.
We're cool as long as we can view your solution without any pain.


# Code Challenge – Problem 1: Summations (Completed)

## 📌 Overview
This project demonstrates three different approaches to solving the summation problem (sum of numbers from 1 to _n_):

1. **For Loop** – Iterative summation
2. **Array.reduce** – Using JavaScript’s built-in reducer
3. **Recursion** – Recursive function calls

The functions are exposed via an **Express.js server** with endpoints to test and view results
---

## 🚀 Features
- `sum_to_n_a(n)` → Summation using a `for` loop
- `sum_to_n_b(n)` → Summation using `Array.reduce`
- `sum_to_n_c(n)` → Summation using recursion
- Express server with:
  - `/problem1` → Returns JSON results of all three summation methods

Got it — let’s regenerate the documentation for **Problem 5** in a clean, professional style that matches your repo’s format. Here’s a polished section you can drop straight into your README:

---

# Code Challenge – Problem 5: CRUD User Server (Completed)

## 📌 Overview
This project implements a **CRUD (Create, Read, Update, Delete) API** for managing users, built with **Express.js** and **SQLite**. It provides endpoints to add, retrieve, update, and delete user records, with support for filtering and audit fields (`created_at`, `updated_at`).

---

## 🚀 Features
- **Database Connection**
  - `db.js` initializes a SQLite database using `better-sqlite3`.
  - `users` table includes:  
    - `id` (primary key)  
    - `name`, `email`, `age`, `phone`  
    - `created_at` (auto‑set on insert)  
    - `updated_at` (auto‑updated on modification)

- **CRUD Endpoints**
  - `POST /problem5/users` → Create a new user  
  - `GET /problem5/users` → Retrieve all users (supports filters: `name`, `email`, `age`, `phone`)  
  - `GET /problem5/users/:id` → Retrieve a single user by ID (supports `?fields=` query to select specific columns)  
  - `PUT /problem5/users/:id` → Update an existing user by ID (refreshes `updated_at`)  
  - `DELETE /problem5/users/:id` → Delete a user by ID  

---

## 📂 Example Requests

### Create User
```json
POST /problem5/users
{
  "name": "Agaesh Kumar",
  "email": "agaesh.kumar@example.com",
  "age": 25,
  "phone": "+60123456789"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Agaesh Kumar",
  "email": "agaesh.kumar@example.com",
  "age": 25,
  "phone": "+60123456789",
  "created_at": "2026-02-12 12:30:00",
  "updated_at": "2026-02-12 12:30:00"
}
```

---

### Filter Users
```http
GET /problem5/users?name=agaesh&email=gmail.com
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Agaesh Kumar",
    "email": "agaesh@gmail.com",
    "age": 25,
    "phone": "123456789",
    "created_at": "2026-02-12 12:30:00",
    "updated_at": "2026-02-12 12:30:00"
  }
]
```

---

### Update User
```json
PUT /problem5/users/1
{
  "name": "Agaesh K.",
  "email": "agaesh.k@example.com",
  "age": 26,
  "phone": "987654321"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "Agaesh K.",
    "email": "agaesh.k@example.com",
    "age": 26,
    "phone": "987654321",
    "created_at": "2026-02-12 12:30:00",
    "updated_at": "2026-02-12 12:45:00"
  }
}
```

---

### Delete User
```http
DELETE /problem5/users/1
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

# 🚀 Running the Server

## 1. Start the Application
 
Start the server with:

```bash
npm start
```

You should see:

```
Server running at http://localhost:3000
```

---

## 2. Problem 4 – Summation
Open your browser and visit:

```
http://localhost:3000/problem4
```

You’ll see JSON output showing the results of the three summation methods:

```json
{
  "forLoop": 15,
  "reducer": 15,
  "recursion": 15
}
```

---

## 3. Problem 5 – CRUD Users

### View All Users
Open in browser:

```
http://localhost:3000/problem5/users
```

This returns all users in the database.  
You can also filter with query parameters:

```
http://localhost:3000/problem5/users?name=agaesh
```

---

### Create a User (POST)
Use **curl** or Postman to send a POST request:

```bash
curl -X POST http://localhost:3000/problem5/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Agaesh Kumar","email":"agaesh@example.com","age":25,"phone":"123456"}'
```

---

### Update a User (PUT)
```bash
curl -X PUT http://localhost:3000/problem5/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Agaesh K.","email":"agaesh.k@example.com","age":26,"phone":"987654321"}'
```

---

### Delete a User (DELETE)
```bash
curl -X DELETE http://localhost:3000/problem5/users/1
```

---

## 4. Notes
- **Browser** is good for GET routes (`/problem4`, `/problem5/users`, `/problem5/users/:id`).  
- **POST/PUT/DELETE** require tools like curl, Postman, or any REST client.  
- `created_at` and `updated_at` fields are automatically managed by the database and included in responses.

---

## 1. Running TestCase
 
Start the Server with:

```bash
npm test
```

Writting the npm test in terminal will run the integration test

---

# Code Challenge – Problem 6: Live Leaderboard (Partial)

## 📌 Overview
Problem6 implements a **real-time scoreboard** that displays the top 10 user scores.  
The system updates automatically whenever a user completes an action (e.g., submitting a quiz).  

### Features Implemented
1. **Scoreboard** – shows the top 10 users by score.  
2. **Live updates** – leaderboard is broadcast via WebSocket to all connected clients.  
3. **User actions** – completing an action increases the user’s score.  
4. **API integration** – backend updates the database and dispatches leaderboard updates via broadcast.  
5. **Security/authorization** – **not yet implemented** (malicious score inflation prevention still pending).  

---

## 🚀 Endpoints
- `GET /problem6/leaderboard`  
  Returns the current top 10 users and broadcasts the leaderboard to WebSocket clients.

- `POST /problem6/submit-quiz`  
  Accepts quiz answers, calculates points, updates the user’s score, and broadcasts the updated leaderboard.

---

## 📂 Files
- **Client.js**  
  WebSocket client that connects to `ws://localhost:3000` and listens for real-time leaderboard updates.

- **src/problem/QuizAndAns.js**  
  Contains quiz questions, options, and correct answers used to calculate score increments.

- **src/problem/Architecture.js**  
  Defines Problem6 routes:  
  - `/problem6/leaderboard`  
  - `/problem6/submit-quiz`

---

## 📦 Packages Used
- **ws** – WebSocket server and client for real-time communication.  
- **better-sqlite3** – lightweight SQLite database for storing and updating user scores.  

---


### 🛠️ Running Problem6

1. Install dependencies:  
   ```bash
   npm install
   ```

2. Initialize environment file (creates `.env` with placeholders): 

   ```bash
   npm run env:init
   ```
   This will scaffold a `.env` file containing:
   ```
   PORT=3000
   JWT_KEY=
   ```

3. Generate a secure JWT key (fill in `jwt_key`): 

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste it into `.env`:
   ```
   jwt_key=your_generated_secret_here
   ```

4. Start the backend:  
   ```bash
   npm start
   ```

5. Run the WebSocket client (optional, for testing):  
   ```bash
   npm run live
   ```
   *(configured in `package.json` to run Server and `node client.js` Silmutaneously)*

6. POST submit-quiz

  ```bash
   http://localhost:3000/problem6/submit-quiz 
  ```

![alt text](image-1.png)

simple way to describe and set up JWT Bearer authorization in Postman:

---

### How to Set Authorization (JWT Bearer)

1. **Go to Authorization tab**  
   - In your request window, open the **Authorization** tab.

2. **Choose JWT Bearer**  
   - From the dropdown, select **JWT Bearer**.

3. **Fill in details**  
   - **Algorithm**: Pick the one your backend uses (commonly **HS256**).  
   - **Secret Key**: Enter the secret key that signs your JWT.

4. **Send the request**  
   - Postman will add the header automatically:  
     ```
     Authorization: Bearer <your_token>
     ```
   - Click **Send** to test.

5. **Check the response**  
   - If the token is valid, you’ll see a success message with data (like `success: true`, `pointsEarned`, and `leaderboard`).

---

## Visual Diagram that Illustrate Flow Of Execution.

```bash
+------------------+
|                  |
|   Client UI      |
| (Browser / CLI)  |
|                  |
+--------+---------+
         |
         | 1. POST /problem6/submit-quiz
         v
+---------------------------+
|                           |
|   API Server              |
| (Architecture.js)         |
|                           |
+--------+------------------+
         |
         | 2. Save / update score
         v
+---------------------------+
|                           |
|   Database                |
| (better-sqlite3)          |
|                           |
+--------+------------------+
         |
         | 3. Read top 10 scores
         |    (trigger after update)
         v
+---------------------------+
|                           |
|   WebSocket Server (ws)   |
|                           |
+--------+------------------+
         |
         | 4. Broadcast leaderboard
         v
+---------------------------+
|                           |
|   Client Terminal / UI    |
| (Client.js listening)     |
|                           |
+---------------------------+
```

---

# 🛡️ Security Enhancements

This project includes multiple layers of security to protect API endpoints, user data, and application integrity.  

## Features Implemented

### 1. **Audit Logging**
- Added `auditLogger.js` to record all critical events into a log file.  
- Logs include:  
  - Authorization attempts (success/failure).  
  - Quiz submission attempts, successes, and errors.  
  - Invalid input submissions.  
- Each log entry captures **event type, userId, IP address (normalized to IPv4), and timestamp**.

### 2. **Authorization (JWT)**
- Middleware verifies JWT tokens before granting access to protected routes.  
- Attaches `userId` to the request object for downstream use.  
- Unauthorized or invalid tokens are logged and blocked.

### 3. **Rate Limiting**
- Implemented **per-user** and **per-IP** rate limiting.  
- Prevents brute-force attacks and abuse of endpoints.  
- Logs excessive request attempts for monitoring.

### 4. **Helmet Integration**
- Uses [Helmet](https://helmetjs.github.io/) to set secure HTTP headers.  
- Protects against common web vulnerabilities such as:  
  - Cross-Site Scripting (XSS).  
  - Clickjacking.  
  - MIME sniffing.  

### 5. **Input Validation (Joi)**
- All incoming payloads are validated using **Joi schemas**.  
- Example: `answers` array in `/submit-quiz` must contain valid `questionId` (integer) and `answer` (string).  
- Invalid inputs are rejected with clear error messages and logged for audit.

### 6. **IP Normalization**
- Added `getClientIp.js` helper to ensure consistent IPv4 logging.  
- Converts `::1` (IPv6 localhost) to `127.0.0.1`.  
- Strips IPv6 prefixes like `::ffff:` to log clean IPv4 addresses.

---

## Benefits
- **Defense in depth**: multiple layers (auth, rate limiting, validation, headers).  
- **Visibility**: audit logs provide a clear trail of all access attempts and actions.  
- **Resilience**: prevents malformed input, brute-force attacks, and common exploits.  
- **Maintainability**: reusable helpers and middleware keep security consistent across routes.

---

✅ With these enhancements, the application is significantly hardened against abuse, unauthorized access, and common malware vectors.  

## 🔜   Improvement
- Extend Client.js to display leaderboard visually in the browser required frontend implementation.  
---

