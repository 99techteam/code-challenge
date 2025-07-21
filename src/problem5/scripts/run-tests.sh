#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Running E2E Tests in Docker${NC}"
echo "========================================"

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up test containers...${NC}"
    docker-compose --profile test down
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Step 1: Start MySQL database
echo -e "${YELLOW}📊 Starting MySQL database...${NC}"
docker-compose up -d mysql

# Wait for MySQL to be healthy
echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
while [ "$(docker-compose ps mysql --format json | jq -r '.[0].Health')" != "healthy" ]; do
    sleep 2
    echo -n "."
done
echo -e "\n${GREEN}✅ MySQL is ready!${NC}"

# Step 2: Create test database and grant permissions
echo -e "${YELLOW}🗄️ Setting up test database...${NC}"
docker-compose exec mysql mysql -u root -ppassword -e "
    CREATE DATABASE IF NOT EXISTS resources_test_db;
    GRANT ALL PRIVILEGES ON resources_test_db.* TO 'appuser'@'%';
    FLUSH PRIVILEGES;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test database setup complete!${NC}"
else
    echo -e "${RED}❌ Failed to setup test database${NC}"
    exit 1
fi

# Step 3: Run the tests
echo -e "${YELLOW}🚀 Running E2E tests...${NC}"
echo "========================================"

# Run tests with profile
docker-compose --profile test run --rm test

# Capture exit code
TEST_EXIT_CODE=$?

# Step 4: Results
echo "========================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed. Exit code: $TEST_EXIT_CODE${NC}"
fi

exit $TEST_EXIT_CODE 