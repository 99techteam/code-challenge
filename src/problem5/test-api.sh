#!/bin/bash

# CRUD API Test Script
# This script demonstrates all CRUD operations

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/resources"
API_KEY="test-api-key-12345"

echo "=========================================="
echo "CRUD API Testing Script"
echo "=========================================="
echo ""

# Health Check
echo "1. Health Check (No authentication required)"
echo "curl $BASE_URL/health"
curl -s $BASE_URL/health | jq .
echo ""
echo ""

# Create Resources
echo "2. Creating Resources"
echo "---"
echo "Creating Resource 1: Laptop"
RESOURCE1=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"Laptop","description":"High-performance laptop","category":"electronics","status":"active"}')
echo $RESOURCE1 | jq .
ID1=$(echo $RESOURCE1 | jq -r '.data.id')
echo ""

echo "Creating Resource 2: Book"
RESOURCE2=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"TypeScript Handbook","description":"Learn TypeScript","category":"books","status":"active"}')
echo $RESOURCE2 | jq .
ID2=$(echo $RESOURCE2 | jq -r '.data.id')
echo ""

echo "Creating Resource 3: Mouse"
RESOURCE3=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"Wireless Mouse","category":"electronics","status":"active"}')
echo $RESOURCE3 | jq .
ID3=$(echo $RESOURCE3 | jq -r '.data.id')
echo ""
echo ""

# List All Resources
echo "3. Listing All Resources"
echo "curl $API_URL"
curl -s $API_URL -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Filter by Category
echo "4. Filter by Category (electronics)"
echo "curl '$API_URL?category=electronics'"
curl -s "$API_URL?category=electronics" -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Filter by Name
echo "5. Filter by Name (partial match: 'Type')"
echo "curl '$API_URL?name=Type'"
curl -s "$API_URL?name=Type" -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Get Resource by ID
echo "6. Get Resource by ID (ID: $ID1)"
echo "curl $API_URL/$ID1"
curl -s $API_URL/$ID1 -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Update Resource
echo "7. Update Resource (ID: $ID1) - Change status to inactive"
echo "curl -X PUT $API_URL/$ID1 -d '{\"status\":\"inactive\"}'"
curl -s -X PUT $API_URL/$ID1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"status":"inactive","description":"Updated description"}' | jq .
echo ""
echo ""

# Verify Update
echo "8. Verify Update (ID: $ID1)"
curl -s $API_URL/$ID1 -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Delete Resource
echo "9. Delete Resource (ID: $ID2)"
echo "curl -X DELETE $API_URL/$ID2"
curl -s -X DELETE $API_URL/$ID2 -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Verify Deletion
echo "10. Verify Deletion (Should return 404)"
echo "curl $API_URL/$ID2"
curl -s $API_URL/$ID2 -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# List Remaining Resources
echo "11. List Remaining Resources"
curl -s $API_URL -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Test Validation - Missing Name
echo "12. Test Validation - Missing Required Field (name)"
echo "curl -X POST $API_URL -d '{}'"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{}' | jq .
echo ""
echo ""

# Test Validation - Invalid Status
echo "13. Test Validation - Invalid Status"
echo "curl -X POST $API_URL -d '{\"name\":\"Test\",\"status\":\"invalid\"}'"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"Test","status":"invalid"}' | jq .
echo ""
echo ""

# Test Pagination
echo "14. Test Pagination (limit=2, offset=0)"
echo "curl '$API_URL?limit=2&offset=0'"
curl -s "$API_URL?limit=2&offset=0" -H "x-api-key: $API_KEY" | jq .
echo ""
echo ""

# Test Authentication - Missing API Key
echo "15. Test Authentication - Missing API Key"
echo "curl $API_URL (without API key)"
curl -s $API_URL | jq .
echo ""
echo ""

# Test Authentication - Invalid API Key
echo "16. Test Authentication - Invalid API Key"
echo "curl $API_URL -H 'x-api-key: invalid-key'"
curl -s $API_URL -H "x-api-key: invalid-key" | jq .
echo ""
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
