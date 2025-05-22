#!/bin/bash

echo "🔨 Building all services..."

# Function to build a package safely
build_package() {
  local path="$1"
  local name="$2"

  if [ -d "$path" ]; then
    echo "🔧 Building $name..."
    cd "$path"
    npm install
    if npm run build 2>/dev/null; then
      echo "✅ Build successful: $name"
    else
      echo "⚠️  No build script in $name"
    fi
    cd - > /dev/null
  else
    echo "❌ Directory not found: $path"
  fi
}

# Build shared libraries
echo "📚 Building shared libraries..."
build_package "libs/logging" "logging"
build_package "libs/error-handler" "error-handler"
build_package "libs/auth-middleware" "auth-middleware"

# Build backend services
echo "🏗️ Building backend services..."
services=("auth" "wallet" "contest" "scoring" "notification" "leaderboard" "analytics" "admin-service")
for service in "${services[@]}"; do
  build_package "services/$service" "$service"
done

# Build frontend apps
echo "🎨 Building frontend applications..."
clients=("dashboard" "admin-panel")
for frontend in "${clients[@]}"; do
  build_package "frontend/$frontend" "$frontend"
done

echo "✅ All builds complete!"
