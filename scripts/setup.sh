#!/bin/bash
echo "🚀 Setting up TechPrep backend..."

# Navigate to backend directory
cd backend

# Restore packages
echo "📦 Restoring packages..."
dotnet restore

# Apply database migrations
echo "🗄️ Applying database migrations..."
dotnet ef database update --project src/TechPrep.Infrastructure --startup-project src/TechPrep.API

# Build the solution
echo "🔨 Building solution..."
dotnet build

echo "✅ Setup completed!"
echo ""
echo "To start the API server, run:"
echo "  cd backend && dotnet run --project src/TechPrep.API"
echo ""
echo "The API will be available at:"
echo "  - HTTP: http://localhost:5000"
echo "  - HTTPS: https://localhost:5001"
echo "  - Swagger UI: https://localhost:5001/swagger"