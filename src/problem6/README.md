# 🏆 Scoreboard API Module

## 📌 Overview

The **Scoreboard API Module** is responsible for handling user score updates securely and providing real-time leaderboard updates. It ensures data integrity and prevents unauthorized score modifications.

## ⚙️ Features

- **Live Scoreboard Updates**: Displays the top 10 users with the highest scores.
- **Secure Score Submission**: Ensures that only authorized users can update their scores.
- **Efficient Data Handling**: Optimized queries to retrieve top users quickly.
- **Real-time Updates**: WebSockets support for instant leaderboard updates.

## 🚀 API Endpoints

### **1️⃣ Submit Score**

```http
POST /api/score
```

**Description**: Update user’s score after completing an action.

#### **Request**

- Headers:
  ```json
  {
    "Authorization": "Bearer <jwt-token>"
  }
  ```
- Body:
  ```json
  {
    "userId": "uuid",
    "score": 10
  }
  ```

#### **Response**

```json
{
  "message": "Score updated successfully",
  "updatedScore": 150
}
```

### **2️⃣ Get Leaderboard**

```http
GET /api/leaderboard
```

**Description**: Retrieve the top 10 users with the highest scores.

#### **Response**

```json
{
  "leaderboard": [
    { "userId": "uuid1", "username": "Alice", "score": 200 },
    { "userId": "uuid2", "username": "Bob", "score": 180 }
  ]
}
```

## 🔒 Security Measures

1. **JWT Authentication**: Every score submission must be authenticated using a JSON Web Token.
2. **Rate Limiting**: Prevents excessive API calls to mitigate spam.
3. **Server-side Score Validation**: Ensures scores are updated based on predefined rules.
4. **WebSockets Authorization**: Ensures only authenticated users receive real-time updates.

## 🔄 Real-time Updates (WebSockets)

The API uses **WebSockets** to push leaderboard updates.

### **WebSocket Connection**

```javascript
const socket = io('wss://api.example.com');
socket.on('leaderboard-update', (data) => {
    console.log('Updated Leaderboard:', data);
});
```

## 📉 Technologies Used

- **Node.js** + **Express.js** (Backend API)
- **PostgreSQL / Redis** (Leaderboard storage)
- **WebSockets** (Real-time updates)
- **JWT Authentication** (Security)

## 📉 Deployment

To start the server:

```sh
npm install
npm start
```

