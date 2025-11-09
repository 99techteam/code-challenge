# Testing Documentation

## Overview

The CRUD API includes a comprehensive test suite using **Jest** and **Supertest** for integration testing.

## Test Framework

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **ts-jest**: TypeScript preprocessor for Jest

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Suite Coverage

### Total Tests: 22

#### 1. **POST /api/resources - Create Resource** (4 tests)
- ✅ Create resource with all fields
- ✅ Create resource with minimal fields
- ✅ Validation: Fail without required name
- ✅ Validation: Fail with empty name

#### 2. **GET /api/resources - List Resources** (6 tests)
- ✅ List all resources
- ✅ Filter by category
- ✅ Filter by status
- ✅ Search by name
- ✅ Pagination with limit
- ✅ Pagination with offset

#### 3. **GET /api/resources/:id - Get Single Resource** (3 tests)
- ✅ Get resource by valid ID
- ✅ Return 404 for non-existent resource
- ✅ Return 400 for invalid ID format

#### 4. **PUT /api/resources/:id - Update Resource** (4 tests)
- ✅ Update resource successfully
- ✅ Update only specified fields
- ✅ Return 404 for non-existent resource
- ✅ Return 400 if no fields provided

#### 5. **DELETE /api/resources/:id - Delete Resource** (3 tests)
- ✅ Delete resource successfully
- ✅ Return 404 for non-existent resource
- ✅ Return 400 for invalid ID format

#### 6. **API Response Format** (2 tests)
- ✅ Consistent success response format
- ✅ Consistent error response format

## Code Coverage

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Controllers** | 81.42% | 88.88% | 100% | 81.96% |
| **Services** | 92.75% | 72.72% | 100% | 92.75% |
| **Routes** | 100% | 100% | 100% | 100% |
| **Database** | 100% | 100% | 100% | 100% |
| **Overall** | 77.34% | 75.47% | 68.75% | 77.32% |

## Test Structure

### Test File Location
```
src/__tests__/
└── api.test.ts          # Integration tests for all API endpoints
```

### Test Configuration
```javascript
// jest.config.js
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts']
}
```

## Example Test

```typescript
describe('POST /api/resources', () => {
  it('should create a new resource', async () => {
    const response = await request(app)
      .post('/api/resources')
      .send({
        name: 'Test Product',
        category: 'electronics'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Product');
  });
});
```

## Continuous Testing

### Watch Mode

Run tests in watch mode during development:

```bash
npm run test:watch
```

This will:
- Monitor file changes
- Re-run affected tests automatically
- Provide instant feedback

### Coverage Reports

Generate detailed coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- **Text format**: Console output
- **HTML format**: `coverage/` directory
- **LCOV format**: `coverage/lcov.info`

View HTML coverage report:
```bash
open coverage/index.html  # macOS
```

## Best Practices

1. **Integration Tests**: Tests use real HTTP requests via Supertest
2. **Database**: Tests use the actual SQLite database for realistic scenarios
3. **Isolated Tests**: Each test creates its own resources to avoid conflicts
4. **Cleanup**: Resources are managed to prevent test pollution
5. **Assertions**: Clear, specific assertions for each test case
6. **Edge Cases**: Tests cover both success and failure scenarios

## Adding New Tests

To add a new test:

1. Open `src/__tests__/api.test.ts`
2. Add a new `describe` block or test case:

```typescript
describe('New Feature', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/new-endpoint');
    
    expect(response.status).toBe(200);
    // Add more assertions
  });
});
```

3. Run tests to verify:
```bash
npm test
```

## Troubleshooting

### Tests Failing

1. **Check database**: Ensure SQLite database is not corrupted
2. **Check dependencies**: Run `npm install`
3. **Check TypeScript**: Run `npm run build`
4. **Clear cache**: Delete `node_modules/.cache`

### Coverage Issues

If coverage seems incorrect:
```bash
# Clear Jest cache
npx jest --clearCache

# Run coverage again
npm run test:coverage
```

## CI/CD Integration

For continuous integration, add to your pipeline:

```yaml
# Example: GitHub Actions
- name: Run Tests
  run: npm test

- name: Generate Coverage
  run: npm run test:coverage
```

## Test Performance

Current test execution time: **~1-2 seconds**

All 22 tests run efficiently with:
- Fast database operations
- No external dependencies
- Optimized test structure

## Future Improvements

- [ ] Add unit tests for individual service methods
- [ ] Add mock database for isolated unit tests
- [ ] Add load testing for performance benchmarks
- [ ] Add e2e tests with test database setup/teardown
- [ ] Increase coverage to 90%+

