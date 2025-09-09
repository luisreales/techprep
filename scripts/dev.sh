#!/bin/bash
echo "🚀 Starting TechPrep development environment..."

# Navigate to backend directory
cd backend

echo "📦 Restoring packages..."
dotnet restore

echo "🔨 Building solution..."
dotnet build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "🗄️ Updating database..."
dotnet ef database update --project src/TechPrep.Infrastructure --startup-project src/TechPrep.API

echo ""
echo "✅ Starting API server..."
echo "📡 API will be available at:"
echo "  - HTTP: http://localhost:5000"
echo "  - HTTPS: https://localhost:5001"
echo "  - Swagger UI: https://localhost:5001/swagger"
echo ""
echo "Press Ctrl+C to stop the server"
echo "─────────────────────────────────────────────────"

dotnet run --project src/TechPrep.API