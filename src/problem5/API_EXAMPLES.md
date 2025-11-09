# API Testing Examples

Quick reference guide for testing the CRUD API endpoints.

## Starting the Server

```bash
npm run start:dev
```

Server runs at: **http://localhost:3000**

---

## Test All CRUD Operations

### 1. Create Resources

```bash
# Create Laptop
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "category": "electronics",
    "status": "active"
  }'

# Create Phone
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest smartphone",
    "category": "electronics",
    "status": "active"
  }'

# Create Book
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TypeScript Handbook",
    "description": "Learn TypeScript",
    "category": "books",
    "status": "available"
  }'
```

### 2. List All Resources

```bash
curl http://localhost:3000/api/resources
```

### 3. Get Single Resource

```bash
curl http://localhost:3000/api/resources/1
```

### 4. Update Resource

```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "status": "inactive"
  }'
```

### 5. Delete Resource

```bash
curl -X DELETE http://localhost:3000/api/resources/2
```

---

## Test Filtering Features

### Filter by Category

```bash
curl "http://localhost:3000/api/resources?category=electronics"
```

### Filter by Status

```bash
curl "http://localhost:3000/api/resources?status=active"
```

### Combine Multiple Filters

```bash
curl "http://localhost:3000/api/resources?category=electronics&status=active"
```

### Search in Name/Description

```bash
curl "http://localhost:3000/api/resources?search=laptop"
```

### Pagination

```bash
# Get first 5 resources
curl "http://localhost:3000/api/resources?limit=5&offset=0"

# Get next 5 resources
curl "http://localhost:3000/api/resources?limit=5&offset=5"
```

### Complex Query

```bash
curl "http://localhost:3000/api/resources?category=electronics&status=active&search=phone&limit=10"
```

---

## Test Error Handling

### Invalid Resource ID

```bash
curl http://localhost:3000/api/resources/999
# Returns 404: Resource not found
```

### Missing Required Field

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Missing name field"
  }'
# Returns 400: Name is required
```

### Invalid ID Format

```bash
curl http://localhost:3000/api/resources/abc
# Returns 400: Invalid resource ID
```

---

## Using Python Requests

```python
import requests

BASE_URL = "http://localhost:3000/api"

# Create
response = requests.post(f"{BASE_URL}/resources", json={
    "name": "Tablet",
    "description": "10-inch tablet",
    "category": "electronics",
    "status": "active"
})
print(response.json())

# List
response = requests.get(f"{BASE_URL}/resources")
print(response.json())

# Get
response = requests.get(f"{BASE_URL}/resources/1")
print(response.json())

# Update
response = requests.put(f"{BASE_URL}/resources/1", json={
    "name": "Updated Tablet"
})
print(response.json())

# Delete
response = requests.delete(f"{BASE_URL}/resources/1")
print(response.json())

# With filters
response = requests.get(f"{BASE_URL}/resources", params={
    "category": "electronics",
    "status": "active",
    "limit": 10
})
print(response.json())
```

---

## Using JavaScript Fetch

```javascript
const BASE_URL = 'http://localhost:3000/api';

// Create
fetch(`${BASE_URL}/resources`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Tablet',
    description: '10-inch tablet',
    category: 'electronics',
    status: 'active'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// List
fetch(`${BASE_URL}/resources`)
  .then(res => res.json())
  .then(data => console.log(data));

// Get
fetch(`${BASE_URL}/resources/1`)
  .then(res => res.json())
  .then(data => console.log(data));

// Update
fetch(`${BASE_URL}/resources/1`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Tablet'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// Delete
fetch(`${BASE_URL}/resources/1`, {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Expected Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Tips

1. **Pretty Print JSON** (if you have `jq` installed):
   ```bash
   curl http://localhost:3000/api/resources | jq
   ```

2. **Save Response to File**:
   ```bash
   curl http://localhost:3000/api/resources > response.json
   ```

3. **View Server Logs**: Check the terminal where the server is running to see request logs

4. **Reset Database**: Delete `database.sqlite` and restart the server to start fresh

