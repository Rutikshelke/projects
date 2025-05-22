#!/bin/bash

echo "🚀 Deploying to development Kubernetes environment..."

# Check for kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install it."
    exit 1
fi

# Set namespace
NAMESPACE="fantasy-stock"

# Apply namespace config
echo "🗂️ Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Deploy databases
echo "🛢️ Deploying MongoDB and Redis..."
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml

# Wait for MongoDB and Redis to be ready
echo "⏳ Waiting for MongoDB and Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s || echo "⚠️ MongoDB may not be ready"
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s || echo "⚠️ Redis may not be ready"

# Deploy backend services
echo "🔧 Deploying backend services..."
services=("auth" "wallet" "contest" "scoring" "notification" "leaderboard" "analytics" "admin-service")
for svc in "${services[@]}"; do
    echo "🚀 Deploying $svc..."
    kubectl apply -f "k8s/${svc}-service.yaml"
done

# Deploy frontend apps
echo "🎨 Deploying frontend applications..."
kubectl apply -f k8s/dashboard-frontend.yaml
kubectl apply -f k8s/admin-panel-frontend.yaml

# Deploy Ingress (NGINX)
echo "🌐 Deploying NGINX Ingress..."
kubectl apply -f k8s/nginx-ingress.yaml

echo ""
echo "✅ All services and applications deployed successfully!"
echo ""
echo "🌍 Access your applications:"
echo "   🧑 Dashboard:   http://dashboard.fantasy-stock.local"
echo "   🛠️ Admin Panel: http://admin.fantasy-stock.local"
echo "   🔗 API Gateway: http://api.fantasy-stock.local"
