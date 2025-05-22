#!/bin/bash

echo "🔨 Building all services..."

# Build shared libraries
echo "📚 Building shared libraries..."
cd libs/logging && npm install && npm run build 2>/dev/null || echo "No build script in logging" && cd ../..
cd libs/error-handler && npm install && npm run build 2>/dev/null || echo "No build script in error-handler" && cd ../..
cd libs/auth-middleware && npm install && npm run build 2>/dev/null || echo "No build script in auth-middleware" && cd ../..

# Build backend services
echo "🏗️ Building backend services..."
services=("auth" "wallet" "contest" "scoring" "notification" "leaderboard" "analytics" "admin-service")
for service in "${services[@]}"; do
    echo "🔧 Building $service..."
    cd "services/$service"
    npm install
    npm run build 2>/dev/null || echo "No build script in $service"
    cd ../..
done

# Build frontend apps
echo "🎨 Building frontend applications..."
frontends=("dashboard" "admin-panel")
for frontend in "${frontends[@]}"; do
    echo "🔧 Building $frontend..."
    cd "frontend/$frontend"
    npm install
    npm run build
    cd ../..
done

echo "✅ All builds complete!"
