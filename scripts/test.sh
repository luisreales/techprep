#!/bin/bash
echo "🧪 Running TechPrep tests..."

cd backend

echo "📋 Running unit tests..."
dotnet test tests/TechPrep.Tests.Unit/TechPrep.Tests.Unit.csproj --verbosity normal

echo ""
echo "🌐 Running integration tests..."
dotnet test tests/TechPrep.Tests.Integration/TechPrep.Tests.Integration.csproj --verbosity normal

echo ""
echo "📊 Running all tests with coverage..."
dotnet test --collect:"XPlat Code Coverage" --results-directory:./TestResults

echo "✅ Tests completed!"
echo ""
echo "Test Results:"
echo "- Unit Tests: Check output above for detailed results"
echo "- Integration Tests: Check output above for detailed results"
echo "- Coverage Reports: Available in ./TestResults/"
echo ""
echo "To view coverage report:"
echo "  1. Install reportgenerator: dotnet tool install -g dotnet-reportgenerator-globaltool"
echo "  2. Generate report: reportgenerator -reports:TestResults/**/coverage.cobertura.xml -targetdir:coverage -reporttypes:Html"
echo "  3. Open: coverage/index.html"