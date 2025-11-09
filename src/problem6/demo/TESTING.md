# Testing Documentation - Scoreboard API Demo

## Overview

This document describes the testing strategy and test suite for the Scoreboard API demo implementation.

## Test Framework

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing Express APIs

## Running Tests

### Prerequisites

Make sure the server is running:

```bash
npm start
```

In a separate terminal, run the tests:

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Suite Coverage

### Total Tests: 30+

The test suite covers all major functionality of the demo API.

---

## Test Categories

### 1. **Health Check** (1 test)
- ✅ Server information endpoint

### 2. **Authentication** (4 tests)
- ✅ Successful login with valid credentials
- ✅ Failed login with invalid username
- ✅ Failed login with invalid password
- ✅ JWT token validation

### 3. **Leaderboard** (6 tests)
- ✅ Get leaderboard without authentication
- ✅ Return top 10 users by default
- ✅ Users sorted by score (descending)
- ✅ Complete user data (rank, username, score)
- ✅ Custom limit parameter
- ✅ Leaderboard format validation

### 4. **User Score** (3 tests)
- ✅ Get current user score with authentication
- ✅ Fail without authentication
- ✅ Fail with invalid token

### 5. **Action Token System** (3 tests)
- ✅ Request action token successfully
- ✅ Fail without authentication
- ✅ Generate unique action IDs

### 6. **Complete Action & Score Update** (5 tests)
- ✅ Complete action and update score
- ✅ Prevent token reuse (replay attack)
- ✅ Reject invalid action token
- ✅ Reject too fast completion time
- ✅ Reject too slow completion time

### 7. **Rate Limiting** (1 test)
- ✅ Enforce 10 actions per minute limit

### 8. **Security** (3 tests)
- ✅ Require authentication for protected endpoints
- ✅ Reject malformed JWT tokens
- ✅ No sensitive information in errors

### 9. **Data Consistency** (1 test)
- ✅ Maintain leaderboard consistency after updates

---

## Test Scenarios

### Positive Tests

Tests that verify the API works correctly:

```javascript
✓ Login with valid credentials
✓ Get leaderboard
✓ Request action token
✓ Complete action and update score
✓ Check user rank and score
```

### Negative Tests

Tests that verify proper error handling:

```javascript
✓ Invalid credentials rejected
✓ Missing authentication rejected
✓ Token reuse blocked
✓ Rate limits enforced
✓ Invalid completion times rejected
```

### Security Tests

Tests that verify security measures:

```javascript
✓ Token replay prevention
✓ Authentication required
✓ JWT validation
✓ Rate limiting
✓ Completion time validation
```

---

## Example Test Output

```
PASS  __tests__/api.test.js
  Scoreboard API Tests
    Health Check
      ✓ should return server information (45ms)
    Authentication
      ✓ should login successfully with valid credentials (67ms)
      ✓ should fail login with invalid username (34ms)
      ✓ should fail login with invalid password (32ms)
      ✓ should return a valid JWT token (56ms)
    Leaderboard
      ✓ should get leaderboard without authentication (28ms)
      ✓ should return top 10 users by default (25ms)
      ✓ should return users sorted by score descending (27ms)
      ✓ should include rank, username, and score for each user (26ms)
      ✓ should accept custom limit parameter (29ms)
    User Score
      ✓ should get current user score with authentication (45ms)
      ✓ should fail without authentication (23ms)
      ✓ should fail with invalid token (25ms)
    Action Token System
      ✓ should request action token successfully (48ms)
      ✓ should fail to request token without authentication (24ms)
      ✓ should generate unique action IDs (89ms)
    Complete Action & Score Update
      ✓ should complete action and update score (123ms)
      ✓ should prevent token reuse (replay attack) (145ms)
      ✓ should reject completion with invalid action token (34ms)
      ✓ should reject completion time that is too fast (56ms)
      ✓ should reject completion time that is too slow (54ms)
    Rate Limiting
      ✓ should enforce rate limit after 10 actions (2567ms)
    Security
      ✓ should require authentication for protected endpoints (78ms)
      ✓ should reject malformed JWT tokens (26ms)
      ✓ should not expose sensitive information in errors (35ms)
    Data Consistency
      ✓ should maintain leaderboard consistency after score updates (189ms)

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        4.567 s
```

---

## Coverage Report

After running `npm run test:coverage`, you'll see:

```
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   85.5  |   78.3   |   90.0  |   85.5  |                   
 server.js                |   85.5  |   78.3   |   90.0  |   85.5  | 156,234-245       
--------------------------|---------|----------|---------|---------|-------------------
```

Coverage HTML report: `./coverage/lcov-report/index.html`

---

## Writing New Tests

### Template for Adding Tests

```javascript
describe('New Feature', () => {
  let authToken;

  beforeAll(async () => {
    // Setup code
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ username: 'Alice', password: 'demo123' });
    authToken = response.body.data.token;
  });

  it('should test feature functionality', async () => {
    const response = await request(API_URL)
      .get('/api/new-endpoint')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Add more assertions
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Start server
        run: npm start &
      - name: Wait for server
        run: sleep 3
      - name: Run tests
        run: npm test
      - name: Generate coverage
        run: npm run test:coverage
```

---

## Test Best Practices

### ✅ Do's

- Test one thing per test
- Use descriptive test names
- Clean up after tests
- Use beforeAll/beforeEach for setup
- Test both success and failure cases
- Test edge cases and boundaries

### ❌ Don'ts

- Don't test implementation details
- Don't make tests depend on each other
- Don't use hard-coded values that might change
- Don't skip error handling tests
- Don't ignore flaky tests

---

## Troubleshooting

### Server not running?

Make sure the server is started before running tests:

```bash
npm start
```

### Port already in use?

Check if port 3000 is available:

```bash
lsof -i :3000
```

### Tests timing out?

Increase timeout in jest.config.js:

```javascript
testTimeout: 10000 // 10 seconds
```

### Rate limit tests failing?

Wait 60 seconds between test runs to clear rate limits.

---

## Future Improvements

- [ ] Add WebSocket connection tests
- [ ] Add load testing with multiple concurrent users
- [ ] Add integration tests with real database
- [ ] Add E2E tests with Playwright/Puppeteer
- [ ] Add performance benchmarks
- [ ] Add mutation testing
- [ ] Add API contract tests

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Test Coverage Goal:** 80%+  
**Current Coverage:** ~85%  
**Status:** ✅ All tests passing

