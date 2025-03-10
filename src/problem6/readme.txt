Problem 6: API Module Specification

Overview

The goal is to design a backend API module for a real-time score board system, ensuring secure and accurate score updates for users while preventing unauthorized actions.

Key Requirements

Real-time updates to the score board displaying the top 10 user scores.

Secure API to handle score updates when users complete actions.

Anti-cheat mechanisms to avoid unauthorized score increments.

API Endpoints

1. Get Top 10 Scores

Endpoint: GET /api/scores

Description: Fetch the top 10 users by score in descending order.

Response:

[
    { "username": "user1", "score": 1200 },
    { "username": "user2", "score": 1150 }
]

2. Update User Score

Endpoint: POST /api/scores

Description: Securely update the user's score when an action is completed.

Request Body:

{
    "userId": "abc123",
    "actionId": "def456"
}

Response:

{ "message": "Score updated successfully" }

Security Measures

JWT Authentication: Validate user identity before allowing score updates.

Action Validation: Ensure the actionId is legitimate and not reused.

Rate Limiting: Prevent spamming of the score update endpoint.

Real-Time Scoreboard

WebSocket Integration: Push updates to the client in real-time when the top 10 scores change.

Client Subscription: Clients subscribe to score updates and receive minimal data payloads.

Improvements & Considerations

Scalability: Implement caching (e.g., Redis) to reduce database load.

Data Integrity: Utilize atomic operations to avoid race conditions in score updates.

Monitoring: Add analytics and alerts for unusual score update patterns.