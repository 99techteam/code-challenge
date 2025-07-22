#!/bin/sh

# Create a Resource
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "My Resource"}'

echo "\n---"

# List All Resources
curl http://localhost:3000/resources

echo "\n---"

# List Resources with Filter (by name)
curl "http://localhost:3000/resources?name=My"

echo "\n---"

# Get Resource Details by ID
# Replace <RESOURCE_ID> with the actual ID
echo "curl http://localhost:3000/resources/<RESOURCE_ID>"

echo "\n---"

# Update a Resource by ID
# Replace <RESOURCE_ID> with the actual ID
echo "curl -X PUT http://localhost:3000/resources/<RESOURCE_ID> \
  -H \"Content-Type: application/json\" \
  -d '{\"name\": \"Updated Name\"}'" 