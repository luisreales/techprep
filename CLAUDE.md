# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TechPrep is a comprehensive technical interview preparation platform with a **backend-first development approach**. The platform features intelligent question evaluation with a text matching engine for written responses, three question types (single choice, multiple choice, written), Excel import system, analytics, and admin panel.

**Mission**: Create a platform where developers can practice for technical interviews with intelligent question evaluation, especially for written responses using text matching algorithms.

## Technology Stack

- **Backend**: .NET 8 Web API + Clean Architecture + Repository Pattern
- **Database**: SQLite (development) → PostgreSQL (production)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Authentication**: JWT with refresh tokens
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS + Lucide React icons

## Development Commands

**Initial Setup:**
```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

**Daily Development:**
```bash
./scripts/dev.sh      # Start both servers (backend: 5000, frontend: 3000)
./scripts/test.sh     # Run all tests
./scripts/build.sh    # Build for production
```

**Backend Specific:**
```bash
cd backend
dotnet restore                           # Install packages
dotnet build                            # Build solution  
dotnet run --project src/TechPrep.API   # Start API server
dotnet test                             # Run tests
dotnet ef migrations add <Name>         # Create migration
dotnet ef database update              # Apply migrations
dotnet format                           # Code formatting
```

**Frontend Specific:**
```bash
cd frontend
npm install         # Install packages
npm run dev         # Start dev server
npm run build       # Build for production
npm run test:unit   # Unit tests
npm run type-check  # TypeScript validation
npm run lint        # ESLint validation
```

## Architecture & Project Structure

**Backend Clean Architecture:**
```
backend/
├── src/TechPrep.API/           # Controllers, middleware, startup
├── src/TechPrep.Core/          # Domain entities, enums, interfaces
├── src/TechPrep.Application/   # Business logic, DTOs, services
├── src/TechPrep.Infrastructure/ # Repositories, EF Core, external services
└── tests/                      # Unit and integration tests
```

**Frontend Structure:**
```
frontend/
├── src/components/             # Reusable UI components
├── src/pages/                  # Route-level page components
├── src/services/               # API integration layer
├── src/stores/                 # Zustand state management
├── src/types/                  # TypeScript type definitions
└── src/utils/                  # Utility functions
```

## Database Schema

**Key Entities:**
- Users (GUID PK, Email, PasswordHash, Role, MatchingThreshold)
- Topics (INT Identity PK, Name, Description)
- Questions (GUID PK, TopicId FK, Text, Type, Level, OfficialAnswer)
- QuestionOptions (GUID PK, QuestionId FK, Text, IsCorrect, OrderIndex)
- InterviewSessions (GUID PK, UserId FK, Mode, Score, StartedAt, FinishedAt)
- InterviewAnswers (GUID PK, SessionId FK, QuestionId FK, GivenAnswer, MatchPercentage)

**Question Types**: single_choice, multi_choice, written
**Difficulty Levels**: basic, intermediate, advanced  
**Practice Modes**: study (immediate feedback), interview (delayed feedback)

## Critical Implementation Requirements

### Text Matching Algorithm (Core Feature)
1. **Normalization**: lowercase, remove accents/punctuation, normalize spaces
2. **Keyword Extraction**: split words, filter stop words, min 2 chars, unique only
3. **Matching Calculation**: (matched_keywords / total_official_keywords) × 100
4. **Performance**: ≤100ms per evaluation
5. **Stop Words**: Configurable list for Spanish/English

### Excel Import System
- **Required Columns**: Pregunta, Categoria, TipoPregunta, Nivel, Respuesta, Opciones, Correctas, Recursos
- **Validation**: Row-by-row with detailed error reporting
- **Limits**: 10MB max file size, 1000 questions per import
- **Library**: EPPlus for .xlsx/.xls processing

### API Response Standards
All endpoints return:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": { "code": string, "message": string, "details": any }
}
```

## Development Phases

**PHASE 1: Backend Development (Current Focus)**
1. **Week 1**: Project structure, EF Core setup, database schema
2. **Week 2**: Domain entities, DTOs, validation (FluentValidation)
3. **Week 3**: Repository pattern implementation
4. **Week 4**: JWT authentication with ASP.NET Core Identity
5. **Week 5**: Text matching engine (CRITICAL)
6. **Week 6**: Practice session management
7. **Week 7**: Excel import system with EPPlus
8. **Week 8**: Analytics and reporting
9. **Weeks 9-12**: API controllers for all endpoints

**PHASE 2: Frontend Development**
- React application with TypeScript
- Tailwind CSS styling
- Zustand state management  
- React Query for API integration

## Required NuGet Packages

**Core Framework:**
- Microsoft.EntityFrameworkCore.Sqlite (8.0.0)
- Microsoft.AspNetCore.OpenApi (8.0.0)
- Microsoft.EntityFrameworkCore.Design (8.0.0)
- Microsoft.EntityFrameworkCore.Tools (8.0.0)

**Authentication:**
- Microsoft.AspNetCore.Authentication.JwtBearer (8.0.0)
- Microsoft.AspNetCore.Identity (8.0.0)
- System.IdentityModel.Tokens.Jwt (7.0.3)

**Business Logic:**
- AutoMapper.Extensions.Microsoft.DependencyInjection (12.0.1)
- FluentValidation.AspNetCore (11.3.0)
- EPPlus (7.0.0)
- Serilog.AspNetCore (8.0.0)
- Swashbuckle.AspNetCore (6.5.0)

**Testing:**
- xunit (2.6.1), Moq (4.20.69), FluentAssertions (6.12.0)
- Microsoft.AspNetCore.Mvc.Testing (8.0.0)
- Microsoft.EntityFrameworkCore.InMemory (8.0.0)

## Quality Standards

**Performance Requirements:**
- API response: ≤200ms (95th percentile)
- Text matching: ≤100ms per evaluation
- Excel import: ≤30 seconds for 1000 questions
- Database optimization for >10,000 questions

**Security Requirements:**
- JWT tokens: 15min expiry, refresh tokens: 7 days
- Password hashing via ASP.NET Core Identity (min cost 12)
- Rate limiting: 100 requests/minute per IP
- Input validation on all endpoints

**Testing Requirements:**
- Unit test coverage: ≥80% for business logic
- Integration tests for all API endpoints
- Text matching algorithm edge case tests
- Performance tests for bulk operations

**Logging Requirements:**
- Structured logging with Serilog
- Correlation IDs for request tracking
- Security event logging (login attempts, admin actions)

## Configuration

**appsettings.json includes:**
- ConnectionStrings (SQLite/PostgreSQL)
- JwtSettings (Key, Issuer, ExpiryInMinutes, RefreshTokenExpiryInDays)
- EmailSettings (SMTP configuration)
- ImportSettings (MaxFileSizeInMB, AllowedFileTypes, MaxQuestionsPerImport)
- Logging configuration

**Environment Variables for Production:**
- JWT_SECRET_KEY: Secure JWT signing key
- DATABASE_CONNECTION_STRING: Production database
- SMTP_*: Email service configuration

## Development Guidelines

- **Architecture**: Follow Clean Architecture (Core → Application → Infrastructure → API)
- **Async/Await**: Use consistently throughout
- **Error Handling**: Global exception middleware + custom exceptions
- **Dependency Injection**: For all services
- **Migrations**: Separate schema vs data changes
- **Documentation**: XML docs for public methods
- **Logging**: Structured with correlation IDs

## Current Development Status

Project is in specification phase. **Start with Task 1.1: Project Structure Setup** - creating the .NET 8 Web API with Clean Architecture structure. Focus on backend foundation before frontend development.

**Next immediate task**: Create backend project structure with proper folders and install required NuGet packages.