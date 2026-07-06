# Improvements and Considerations

- Hash passwords (bcrypt/argon2); demo uses plaintext
- Persist scores in PostgreSQL; use Redis sorted sets for O(log N) rank
- Sign action tokens with dedicated secret, separate from session JWT
- Add hourly/daily rate limits beyond per-minute window
- Log suspicious patterns for manual review
- Use Redis pub/sub to fan out WebSocket updates across instances
- Cache leaderboard with short TTL (5s) to reduce DB load
- Add refresh tokens and token revocation list
- Validate action-specific proofs (level ID, checksum) per game type
- Monitor p95 latency on `/actions/complete` and WebSocket delivery
- Horizontal scale WebSocket with sticky sessions or shared adapter
- GDPR: allow account deletion and score export
- Feature-flag scoring rules without redeploying clients
- Integration tests with concurrent completions to catch race conditions
