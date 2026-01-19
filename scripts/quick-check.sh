#!/bin/bash

# Quick Check Script - Fast TypeScript and Rust checks without full build

set -e

echo "⚡ Quick CI Checks (no build)"
echo "=============================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# TypeScript checks (no compilation, just type checking)
run_check "TypeScript check (desktop)" "cd packages/desktop && pnpm exec tsc --noEmit && cd ../.."

# Rust format check (fast)
if command -v cargo &> /dev/null && command -v rustfmt &> /dev/null; then
    run_check "Rust format check" "cd packages/desktop/src-tauri && cargo fmt --check && cd ../../.."
fi

# Summary
echo "=============================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Quick checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Quick checks failed${NC}"
    exit 1
fi
