#!/bin/bash

# OpenProposal Test Suite Installation Script
# This script installs all necessary testing dependencies and sets up the test environment

set -e  # Exit on error

echo "🚀 Installing OpenProposal Test Suite..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install test dependencies
echo -e "${BLUE}📦 Step 1: Installing test dependencies...${NC}"
pnpm add -D \
  vitest@^1.1.0 \
  @vitest/ui@^1.1.0 \
  @vitejs/plugin-react@^4.2.1 \
  @testing-library/react@^14.1.2 \
  @testing-library/jest-dom@^6.1.5 \
  @testing-library/user-event@^14.5.1 \
  jsdom@^23.0.1 \
  @playwright/test@^1.40.1 \
  supertest@^6.3.3 \
  @types/supertest@^6.0.2 \
  msw@^2.0.11

echo -e "${GREEN}✓ Test dependencies installed${NC}"
echo ""

# Step 2: Install Playwright browsers
echo -e "${BLUE}🌐 Step 2: Installing Playwright browsers...${NC}"
npx playwright install --with-deps

echo -e "${GREEN}✓ Playwright browsers installed${NC}"
echo ""

# Step 3: Create test database (optional)
echo -e "${BLUE}🗄️  Step 3: Test database setup${NC}"
echo -e "${YELLOW}Note: You should create a separate test database${NC}"
echo -e "${YELLOW}Example: createdb openproposal_test${NC}"
echo -e "${YELLOW}Then set DATABASE_URL in your test environment${NC}"
echo ""

# Step 4: Update package.json scripts (check if already done)
echo -e "${BLUE}📝 Step 4: Checking package.json scripts...${NC}"

# Check if test script exists
if grep -q '"test":' package.json; then
  echo -e "${GREEN}✓ Test scripts already configured${NC}"
else
  echo -e "${YELLOW}⚠ Please add these scripts to your package.json:${NC}"
  cat << 'EOF'
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test && pnpm test:e2e"
  }
EOF
fi
echo ""

# Step 5: Run initial test check
echo -e "${BLUE}🧪 Step 5: Running initial tests...${NC}"

if pnpm test --run 2>/dev/null; then
  echo -e "${GREEN}✓ Tests are running successfully!${NC}"
else
  echo -e "${YELLOW}⚠ Some tests may need adjustment for your environment${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Test Suite Installation Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 Next Steps:"
echo ""
echo "  1. Set up test database:"
echo "     createdb openproposal_test"
echo ""
echo "  2. Configure .env.test with test database URL"
echo ""
echo "  3. Run tests:"
echo "     pnpm test              # Unit tests"
echo "     pnpm test:coverage     # With coverage"
echo "     pnpm test:e2e          # E2E tests"
echo ""
echo "  4. Read the documentation:"
echo "     - TESTING_QUICKSTART.md  # Quick start guide"
echo "     - TEST_STRATEGY.md       # Comprehensive strategy"
echo ""
echo -e "${BLUE}Happy Testing! 🎉${NC}"
