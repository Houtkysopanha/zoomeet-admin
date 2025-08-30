#!/bin/bash

# Environment Validation Script
# This script helps validate that environment variables are properly configured

echo "🔍 Environment Configuration Validation"
echo "========================================"

# Load .env file if it exists and no NODE_ENV is set
if [ -z "$NODE_ENV" ] && [ -f ".env" ]; then
    echo "📝 Loading .env file for validation..."
    set -o allexport
    source .env
    set +o allexport
fi

# Also load environment-specific file for validation
ENV_FILE=".env.${NODE_ENV:-development}"
if [ -f "$ENV_FILE" ]; then
    echo "📝 Loading $ENV_FILE for validation..."
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
fi

# Check NODE_ENV
echo "📍 NODE_ENV: ${NODE_ENV:-'(not set)'}"

# Check if running in development
if [ "$NODE_ENV" = "development" ]; then
    echo "🚀 Running in DEVELOPMENT mode"
    echo "Expected files: .env.development, .env (optional)"
elif [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in PRODUCTION mode"
    echo "Expected files: .env.production"
else
    echo "⚠️  NODE_ENV not set or invalid. Defaulting to development mode."
fi

echo ""
echo "📁 Environment Files Status:"
echo "----------------------------"

# Check which env files exist
for file in .env.example .env.development .env.production .env .env.local; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" | tr -d ' ')
        if [ "$size" -gt 0 ]; then
            echo "✅ $file (${size} bytes)"
        else
            echo "⚠️  $file (empty)"
        fi
    else
        echo "❌ $file (missing)"
    fi
done

echo ""
echo "🔧 Current Configuration:"
echo "------------------------"
echo "API Base URL: ${NUXT_PUBLIC_API_BASE_URL:-'(not set)'}"
echo "Admin API URL: ${NUXT_PUBLIC_API_ADMIN_BASE_URL:-'(not set)'}"
echo "App Name: ${NUXT_PUBLIC_APP_NAME:-'(not set)'}"
echo "App Version: ${NUXT_PUBLIC_APP_VERSION:-'(not set)'}"
echo "Environment: ${NUXT_PUBLIC_ENVIRONMENT:-'(not set)'}"

echo ""
echo "🛡️  Security:"
echo "-------------"
if [ -n "$TOKEN_SECRET" ]; then
    echo "✅ TOKEN_SECRET is set"
else
    echo "⚠️  TOKEN_SECRET is not set"
fi

echo ""
echo "💡 Quick Commands:"
echo "-----------------"
echo "Development: npm run dev"
echo "Production:  NODE_ENV=production npm run build && npm start"
echo "Test env:    source .env && npm run dev"
