#!/bin/bash

# ClipBridge CI Check Script
# Run the same checks that GitHub Actions runs

set -e

echo "🔍 ClipBridge CI Checks"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

run_check() {
    local name="$1"
    local command="$2"

    echo -e "${YELLOW}▶ $name${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✓ $name passed${NC}"
        echo ""
    else
        echo -e "${RED}✗ $name failed${NC}"
        echo ""
        FAILED=1
    fi
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    echo "Install with: npm install -g pnpm"
    exit 1
fi

# Install root dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install
echo ""

# 1. Build protocol package
run_check "Build protocol package" "cd packages/protocol && pnpm install && pnpm run build && cd ../.."

# 2. Build core package
run_check "Build core package" "cd packages/core && pnpm install && pnpm run build && cd ../.."

# 3. Build desktop frontend
run_check "Build desktop frontend" "cd packages/desktop && pnpm install && pnpm run build && cd ../.."

# 4. TypeScript checks
run_check "TypeScript check (protocol)" "cd packages/protocol && pnpm exec tsc --noEmit && cd ../.."
run_check "TypeScript check (core)" "cd packages/core && pnpm exec tsc --noEmit && cd ../.."
run_check "TypeScript check (desktop)" "cd packages/desktop && pnpm exec tsc --noEmit && cd ../.."

# 5. Rust checks (if available)
if command -v cargo &> /dev/null; then
    echo -e "${YELLOW}🦀 Checking Rust code...${NC}"

    if command -v rustfmt &> /dev/null; then
        run_check "Rust format check" "cd packages/desktop/src-tauri && cargo fmt --check && cd ../../.."
    else
        echo -e "${YELLOW}⚠ rustfmt not installed, skipping format check${NC}"
        echo ""
    fi

    if command -v cargo-clippy &> /dev/null || cargo clippy --version &> /dev/null; then
        run_check "Rust clippy check" "cd packages/desktop/src-tauri && cargo clippy -- -D warnings && cd ../../.."
    else
        echo -e "${YELLOW}⚠ clippy not installed, skipping lint check${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠ Rust not installed, skipping Rust checks${NC}"
    echo ""
fi

# Summary
echo "======================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You can safely push to GitHub."
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please fix the errors before pushing to GitHub."
    exit 1
fi
