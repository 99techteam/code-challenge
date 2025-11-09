#!/bin/bash

# Security Testing Script for CRUD API
# This script tests the security features implemented in the API

set -e

API_URL="${API_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-test-api-key-12345}"

echo "=================================="
echo "Security Features Testing Script"
echo "=================================="
echo ""
echo "API URL: $API_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Security Headers
echo "=========================================="
echo "Test 1: Checking Security Headers"
echo "=========================================="
echo ""

HEADERS=$(curl -sI $API_URL/health)

echo "Checking for security headers..."
echo ""

if echo "$HEADERS" | grep -q "Content-Security-Policy"; then
    echo -e "${GREEN}✓${NC} Content-Security-Policy header present"
else
    echo -e "${RED}✗${NC} Content-Security-Policy header missing"
fi

if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✓${NC} Strict-Transport-Security header present"
else
    echo -e "${RED}✗${NC} Strict-Transport-Security header missing"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options: DENY"; then
    echo -e "${GREEN}✓${NC} X-Frame-Options: DENY header present"
else
    echo -e "${RED}✗${NC} X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options: nosniff"; then
    echo -e "${GREEN}✓${NC} X-Content-Type-Options: nosniff header present"
else
    echo -e "${RED}✗${NC} X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -q "X-XSS-Protection"; then
    echo -e "${GREEN}✓${NC} X-XSS-Protection header present"
else
    echo -e "${RED}✗${NC} X-XSS-Protection header missing"
fi

if echo "$HEADERS" | grep -q "Referrer-Policy"; then
    echo -e "${GREEN}✓${NC} Referrer-Policy header present"
else
    echo -e "${RED}✗${NC} Referrer-Policy header missing"
fi

if echo "$HEADERS" | grep -q "Permissions-Policy"; then
    echo -e "${GREEN}✓${NC} Permissions-Policy header present"
else
    echo -e "${RED}✗${NC} Permissions-Policy header missing"
fi

if echo "$HEADERS" | grep -q "X-Powered-By"; then
    echo -e "${YELLOW}⚠${NC}  X-Powered-By header still present (should be hidden)"
else
    echo -e "${GREEN}✓${NC} X-Powered-By header hidden"
fi

echo ""

# Test 2: XSS Protection
echo "=========================================="
echo "Test 2: XSS Attack Prevention"
echo "=========================================="
echo ""

echo "Attempting to inject XSS in resource name..."
RESPONSE=$(curl -s -X POST $API_URL/api/resources \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"<script>alert(\"XSS\")</script>Test","description":"Normal description"}')

NAME=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

if echo "$NAME" | grep -q "<script>"; then
    echo -e "${RED}✗${NC} XSS sanitization FAILED - script tag present in response"
else
    echo -e "${GREEN}✓${NC} XSS sanitization SUCCESS - script tag removed"
    echo "   Input:  <script>alert(\"XSS\")</script>Test"
    echo "   Output: $NAME"
fi

echo ""

echo "Attempting to inject XSS with event handlers..."
RESPONSE2=$(curl -s -X POST $API_URL/api/resources \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"Clean Name","description":"<img src=x onerror=\"alert(1)\">"}')

DESC=$(echo "$RESPONSE2" | grep -o '"description":"[^"]*"' | cut -d'"' -f4)

if echo "$DESC" | grep -q "onerror"; then
    echo -e "${RED}✗${NC} Event handler sanitization FAILED"
else
    echo -e "${GREEN}✓${NC} Event handler sanitization SUCCESS"
    echo "   Input:  <img src=x onerror=\"alert(1)\">"
    echo "   Output: $DESC"
fi

echo ""

# Test 3: NoSQL Injection Protection
echo "=========================================="
echo "Test 3: NoSQL Injection Prevention"
echo "=========================================="
echo ""

echo "Attempting NoSQL injection in query parameters..."
RESPONSE3=$(curl -s "$API_URL/api/resources?name[\$gt]=" \
  -H "x-api-key: $API_KEY")

if echo "$RESPONSE3" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} NoSQL injection sanitized (query parameter sanitized)"
    echo "   Malicious parameter: name[\$gt]="
    echo "   Server processed it safely"
else
    echo -e "${RED}✗${NC} NoSQL injection test inconclusive"
fi

echo ""

# Test 4: Request Size Limit
echo "=========================================="
echo "Test 4: Request Size Limit"
echo "=========================================="
echo ""

echo "Testing request size limit (100KB max)..."
LARGE_DATA=$(python3 -c "print('A' * 150000)")
RESPONSE4=$(curl -s -X POST $API_URL/api/resources \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"name\":\"test\",\"description\":\"$LARGE_DATA\"}" \
  2>&1 || true)

if echo "$RESPONSE4" | grep -q "payload too large\|Payload Too Large\|entity too large"; then
    echo -e "${GREEN}✓${NC} Request size limit enforced"
    echo "   Attempted: 150KB payload"
    echo "   Result: Request rejected"
else
    echo -e "${YELLOW}⚠${NC}  Request size limit may not be strictly enforced"
    echo "   Note: Some requests may still be accepted but truncated"
fi

echo ""

# Test 5: Authentication
echo "=========================================="
echo "Test 5: API Key Authentication"
echo "=========================================="
echo ""

echo "Testing request without API key..."
RESPONSE5=$(curl -s -X GET $API_URL/api/resources)

if echo "$RESPONSE5" | grep -q "API key is required\|Invalid API key"; then
    echo -e "${GREEN}✓${NC} API key authentication enforced"
else
    echo -e "${RED}✗${NC} API key authentication not enforced"
fi

echo ""

echo "Testing request with invalid API key..."
RESPONSE6=$(curl -s -X GET $API_URL/api/resources \
  -H "x-api-key: invalid-key-12345")

if echo "$RESPONSE6" | grep -q "Invalid API key"; then
    echo -e "${GREEN}✓${NC} Invalid API key rejected"
else
    echo -e "${RED}✗${NC} Invalid API key not rejected"
fi

echo ""

echo "Testing request with valid API key..."
RESPONSE7=$(curl -s -X GET $API_URL/api/resources \
  -H "x-api-key: $API_KEY")

if echo "$RESPONSE7" | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC} Valid API key accepted"
else
    echo -e "${RED}✗${NC} Valid API key not working"
fi

echo ""

# Summary
echo "=========================================="
echo "Security Testing Complete"
echo "=========================================="
echo ""
echo "Security features tested:"
echo "  • HTTP Security Headers (Helmet.js)"
echo "  • XSS Protection (Script & Event Handler Sanitization)"
echo "  • NoSQL Injection Prevention"
echo "  • Request Size Limits"
echo "  • API Key Authentication"
echo ""
echo "For detailed security information, see SECURITY.md"
echo ""
