# WebSocket Specification

## Connection

**Endpoint:** `ws://<host>/scoreboard`

Clients connect on page load to receive live scoreboard updates. The connection stays open for the duration of the session.

> The scoreboard is public — no auth required to connect. See [improvements.md](./improvements.md) for how to add authentication if needed.

---

## Events

### Server → Client: `scoreboard:update`

Emitted whenever the top 10 ranking changes. The server does **not** emit on every score update — only when the top 10 is actually affected.

```json
{
  "event": "scoreboard:update",
  "payload": {
    "scoreboard": [
      { "rank": 1, "userId": "uuid", "username": "alice", "score": 5010 },
      { "rank": 2, "userId": "uuid", "username": "bob",   "score": 4800 }
    ],
    "updatedAt": "2024-01-01T12:00:05Z"
  }
}
```

---

## Client Integration Example

```js
const socket = io('wss://server');

socket.on('scoreboard:update', ({ scoreboard }) => {
  renderScoreboard(scoreboard);
});
```
