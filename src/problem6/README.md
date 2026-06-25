# Problem 6: Live Scoreboard API Specification

## Purpose

This documentation provides a backend engineering team with the design, architecture, and improvement notes for a secure live scoreboard API service.

The service must accept authorised score update events and publish a live top-10 leaderboard.

## Contents

- `ARCHITECTURE.md` — architectural design and execution flow
- `IMPROVEMENTS.md` — suggested enhancements and deployment considerations
- `README.md` — summary and guidance for dependent implementers
- `scoreboard-flow.svg` — execution flow diagram

## Key Requirements

- Provide a top-10 scoreboard display for the website.
- Support live updates when scores change.
- Accept score updates triggered by user actions.
- Validate and authorize score update requests.
- Prevent unauthorised score manipulation.

## How to Use This Folder

1. Start with `README.md` for the module summary.
2. Review `ARCHITECTURE.md` for component design and API behavior.
3. Read `IMPROVEMENTS.md` for future hardening and scaling.
4. Use `scoreboard-flow.svg` to understand the execution flow visually.

## Notes for Dependent Teams

- The API must be backend-first: do not trust client-provided score totals.
- Use secure authentication for every score update request.
- Keep the top-10 read path fast and cache-friendly.
- Log suspicious score update activity for audit and abuse detection.
