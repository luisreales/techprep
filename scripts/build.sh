#!/bin/bash
echo "🔨 Building TechPrep for production..."

cd backend

echo "📦 Restoring packages..."
dotnet restore

echo "🔨 Building in Release mode..."
dotnet build --configuration Release

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Publishing API..."
dotnet publish src/TechPrep.API/TechPrep.API.csproj --configuration Release --output ./publish

echo "✅ Build completed successfully!"
echo "📁 Published files are in: backend/publish/"
echo ""
echo "To run the production build:"
echo "  cd backend/publish && dotnet TechPrep.API.dll"