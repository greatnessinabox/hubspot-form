#!/bin/bash

# Build script for @greatnessinabox/hubspot-form package

echo "Building @greatnessinabox/hubspot-form..."

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the package
echo "Building package..."
pnpm build

# Type check
echo "Type checking..."
pnpm type-check

echo "Build complete!"
echo ""
echo "To use this package:"
echo "1. For local development, add to your root package.json:"
echo '   "@greatnessinabox/hubspot-form": "workspace:*"'
echo ""
echo "2. Or publish to npm:"
echo "   npm publish --access public"



