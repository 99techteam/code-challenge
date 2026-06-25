# Problem 6 Improvements

## Security and Integrity

1. **Action validation service**
   - Add a dedicated service that verifies whether the reported `actionId` is valid and was actually performed by the user.
   - This prevents malformed or replayed score updates.

2. **Challenge-response authentication**
   - Use signed payloads or one-time tokens for score update requests.
   - Ensure the front-end cannot forge score update payloads without backend approval.

3. **Audit log and monitoring**
   - Maintain an append-only audit log for every score update attempt.
   - Capture user, actionId, scoreDelta, request metadata, and success/failure.
   - Generate alerts on suspicious activity.

4. **Abuse detection**
   - Flag users with too frequent or too-large score increments.
   - Temporarily throttle or lock suspicious accounts.

## Performance and Scaling

1. **Leaderboard cache**
   - Cache the top 10 leaderboard snapshot in memory or Redis.
   - Invalidate cache only when a score update affects the top 10.

2. **Atomic updates**
   - Use database transactions or atomic operations to prevent race conditions.
   - Avoid double-counting or lost updates when multiple actions happen simultaneously.

3. **Asynchronous processing**
   - Use a message queue for high-volume score updates.
   - A worker can process validated score changes and update the leaderboard asynchronously.

4. **Read/Write separation**
   - Consider a fast read replica or cache for leaderboard queries.
   - Keep write operations isolated from read-heavy leaderboard access.

## Operational Recommendations

1. **Health checks**
   - Add readiness and liveness endpoints for deployment platforms.
   - Monitor DB connectivity, cache state, and live update channel health.

2. **Metrics**
   - Track API request count, error rate, request latency, and update rate.
   - Track top 10 refresh frequency and cache hit ratio.

3. **Deployment**
   - Deploy the backend behind an API gateway.
   - Use TLS for all client and internal traffic.

## Developer Guidance

1. **Keep client trust minimal**
   - Do not trust client-provided `score` values.
   - Only apply approved `scoreDelta` values computed from backend-known action rules.

2. **Modular design**
   - Separate authentication, score validation, persistence, and live update logic.
   - Keep the API layer lean and delegate business rules to services.

3. **Documentation**
   - Document the API schema and auth requirements clearly.
   - Provide sample request/response examples for frontend and integration teams.
