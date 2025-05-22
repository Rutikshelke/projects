#!/bin/bash

echo "🚀 Deploying to PRODUCTION environment..."

# Check for required tools
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl."
    exit 1
fi

# Set namespace
NAMESPACE=fantasy-stock-prod

# Create or ensure namespace exists
echo "📝 Creating namespace ($NAMESPACE) if it doesn't exist..."
kubectl get ns $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

# Apply secrets (you should pre-create them securely or manage via sealed-secrets)
echo "🔐 Applying secrets (ensure they're pre-created securely)..."
# Example: kubectl apply -f k8s/secrets/prod-secrets.yaml

# Deploy core services
echo "🗃 Deploying MongoDB and Redis..."
kubectl apply -n $NAMESPACE -f k8s/mongodb.yaml
kubectl apply -n $NAMESPACE -f k8s/redis.yaml

echo "⏳ Waiting for MongoDB and Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s

# Deploy backend services
echo "🔧 Deploying backend microservices..."
for service in auth wallet contest scoring notification leaderboard analytics admin-service; do
    echo "🚀 Deploying $service..."
    kubectl apply -n $NAMESPACE -f k8s/${service}-service.yaml
done

# Deploy frontend applications
echo "🎨 Deploying frontend apps..."
kubectl apply -n $NAMESPACE -f k8s/dashboard-frontend.yaml
kubectl apply -n $NAMESPACE -f k8s/admin-panel-frontend.yaml

# Apply ingress configuration
echo "🌐 Applying ingress..."
kubectl apply -n $NAMESPACE -f k8s/nginx-ingress.yaml

echo "✅ Production deployment complete!"
echo ""
echo "🌍 Live URLs:"
echo "   Dashboard: https://dashboard.fantasy-stock.com"
echo "   Admin Panel: https://admin.fantasy-stock.com"
echo "   API Gateway: https://api.fantasy-stock.com"
