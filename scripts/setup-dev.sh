#!/bin/bash

echo "🚀 Setting up Fantasy Stock Market Development Environment"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it."
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it."
    exit 1
fi

# Create directories
echo "📁 Creating required directories..."
mkdir -p logs data/mongodb data/redis

# Create .env files if missing
echo "📝 Creating .env files..."
for service in auth wallet contest scoring notification leaderboard analytics admin-service; do
    if [ ! -f "services/$service/.env" ]; then
        cp "services/$service/.env.example" "services/$service/.env"
        echo "✅ Created .env for $service"
    fi
done

for frontend in dashboard admin-panel; do
    if [ ! -f "clients/$frontend/.env" ]; then
        cp "clients/$frontend/.env.example" "clients/$frontend/.env"
        echo "✅ Created .env for $frontend"
    fi
done

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Bootstrap with Lerna
echo "🔄 Bootstrapping with Lerna..."
npx lerna bootstrap

# Build shared libraries
echo "🔨 Building shared libraries..."
cd libs/logging && npm install && cd ../..
cd libs/error-handler && npm install && cd ../..
cd libs/auth-middleware && npm install && cd ../..

echo "✅ Development setup complete!"
echo ""
echo "🚀 Run your stack with: npm run dev"
echo "🌐 URLs:"
echo "   Dashboard: http://localhost:3000"
echo "   Admin:     http://localhost:3010"
echo "   API:       http://localhost:8080"
