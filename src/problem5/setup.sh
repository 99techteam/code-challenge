#!/bin/bash

echo "========================================="
echo "Express Task API - Setup Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo "✗ Failed to install dependencies"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Creating .env file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created from .env.example${NC}"
    echo "  Please update DATABASE_URL in .env with your database credentials"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Generating Prisma Client...${NC}"
npm run prisma:generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated successfully${NC}"
else
    echo "✗ Failed to generate Prisma Client"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Update DATABASE_URL in .env with your database credentials"
echo "  2. Start PostgreSQL (or run: npm run docker:up)"
echo "  3. Run migrations: npm run prisma:migrate"
echo "  4. (Optional) Seed database: npm run prisma:seed"
echo "  5. Start development server: npm run dev"
echo ""
echo "The API will be available at http://localhost:3000"
echo "API documentation is available in README.md"
echo ""
