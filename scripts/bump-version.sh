#!/bin/bash

# ClipBridge Version Bump Script
# Usage: ./scripts/bump-version.sh <new-version>
# Example: ./scripts/bump-version.sh 0.2.0

set -e

if [ -z "$1" ]; then
    echo "Error: Version number required"
    echo "Usage: ./scripts/bump-version.sh <version>"
    echo "Example: ./scripts/bump-version.sh 0.2.0"
    exit 1
fi

NEW_VERSION=$1

echo "🔄 Bumping version to $NEW_VERSION..."

# Update root package.json
echo "📝 Updating package.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak

# Update protocol package
echo "📝 Updating packages/protocol/package.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/protocol/package.json
rm packages/protocol/package.json.bak

# Update core package
echo "📝 Updating packages/core/package.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/core/package.json
rm packages/core/package.json.bak

# Update desktop package
echo "📝 Updating packages/desktop/package.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/desktop/package.json
rm packages/desktop/package.json.bak

# Update Cargo.toml
echo "📝 Updating packages/desktop/src-tauri/Cargo.toml..."
sed -i.bak "s/^version = \".*\"/version = \"$NEW_VERSION\"/" packages/desktop/src-tauri/Cargo.toml
rm packages/desktop/src-tauri/Cargo.toml.bak

# Update tauri.conf.json
echo "📝 Updating packages/desktop/src-tauri/tauri.conf.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/desktop/src-tauri/tauri.conf.json
rm packages/desktop/src-tauri/tauri.conf.json.bak

echo "✅ Version bumped to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Update CHANGELOG.md"
echo "3. Commit changes: git add . && git commit -m 'chore: bump version to $NEW_VERSION'"
echo "4. Create tag: git tag v$NEW_VERSION"
echo "5. Push: git push origin main && git push origin v$NEW_VERSION"
