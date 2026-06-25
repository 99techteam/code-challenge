# Problem 6 Architecture

## System Components

1. **Web Client**
   - Sends score update requests when users complete actions.
   - Subscribes to live leaderboard updates.

2. **API Gateway / Backend Server**
   - Exposes secure REST APIs for score updates and leaderboard reads.
   - Validates authentication and rate limits score update requests.
   - Updates the score database atomically.

3. **Score Database**
   - Stores user score records, leaderboard data, and audit logs.
   - Supports fast read access for top 10 queries.

4. **Live Update Channel**
   - Pushes leaderboard changes to subscribed clients.
   - Can be implemented using WebSocket, Server-Sent Events (SSE), or a push notification service.

## API Endpoints

### POST `/api/v1/scores/update`

- Input:
  - `userId`
  - `scoreDelta`
  - `actionId`
  - `timestamp`
- Processing:
  - Authenticate request token.
  - Validate payload and user identity.
  - Apply rate limiting/anti-abuse checks.
  - Write score change to database.
  - Recompute or update leaderboard position.
  - Publish leaderboard changes if top 10 affected.

### GET `/api/v1/scores/top10`

- Returns top 10 users by score.
- Should use a cached or precomputed leaderboard snapshot.

### GET `/api/v1/scores/user/:userId`

- Returns a single user score and rank.
- Useful for user-specific dashboards.

## Execution Flow

1. User completes an action on the website.
2. Client sends a score update request to the backend.
3. Backend authenticates the request.
4. Backend validates request payload and authorisation.
5. Backend performs the score update in the database.
6. Backend updates leaderboard cache if needed.
7. Backend pushes live update events to subscribed clients.

## Data Model

### UserScore
- `userId: string`
- `displayName: string`
- `score: number`
- `lastUpdatedAt: string`
- `rank: number`

### ScoreUpdateEvent
- `userId: string`
- `actionId: string`
- `scoreDelta: number`
- `timestamp: string`
- `receivedAt: string`
- `source`: string

## Security Controls

- Use JWT or signed access tokens.
- Verify token expiration and user claims.
- Reject requests without valid authorization.
- Do not accept arbitrary total score values from clients.
- Enforce rate limits on `/api/v1/scores/update`.

## Live Update Flow

- Use a subscription channel for real-time update delivery.
- Push new top 10 leaderboard data whenever a relevant score changes.
- Fall back to client polling if real-time channels are unavailable.

## Diagram Reference

See `scoreboard-flow.svg` for a visual representation of the flow.
