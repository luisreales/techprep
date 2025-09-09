# 🚀 TechPrep - Technical Interview Preparation Platform

## 📋 Project Instructions for Claude Code

This document contains complete specifications for developing TechPrep, a comprehensive web platform for technical interview preparation. Development should proceed **backend-first**, then frontend.

---

## 🎯 Project Overview

**Mission**: Create a platform where developers can practice for technical interviews with intelligent question evaluation, especially for written responses using text matching algorithms.

**Key Features**:
- Three question types: Single choice, Multiple choice, Written responses
- Text matching engine for written answers (≥80% accuracy threshold)
- Excel import system for bulk question loading
- Analytics and progress tracking
- Admin panel for content management

**Technology Stack**:
- **Backend**: .NET 8 Web API + SQLite (production-ready for PostgreSQL migration)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Architecture**: Clean Architecture with Repository Pattern
- **Authentication**: JWT with refresh tokens

---

## 🏗️ Development Phases

### **PHASE 1: Backend Development (Start Here)**

#### **Week 1: Foundation Setup**
**Task 1.1: Project Structure**
- Create .NET 8 Web API project with Clean Architecture structure
- Set up folders: `Controllers/`, `Models/`, `Services/`, `Repositories/`, `Infrastructure/`
- Configure `appsettings.json` for development and production environments
- Install required NuGet packages: EntityFramework.Core, EntityFramework.Sqlite, AutoMapper, FluentValidation, EPPlus, JWT packages

**Task 1.2: Database Design**
- Create Entity Framework models for all entities (detailed schema provided below)
- Implement `TechPrepDbContext` with proper configurations
- Generate initial migration with complete database schema
- Create seed data migration with basic topics (JavaScript, React, .NET, Python, etc.)

#### **Week 2: Core Domain Layer**
**Task 2.1: Entity Models**
- Implement all domain entities: `User`, `Topic`, `Question`, `QuestionOption`, `InterviewSession`, `InterviewAnswer`, `LearningResource`, `CodeChallenge`
- Add proper relationships, constraints, and indexes
- Create enums: `QuestionType`, `DifficultyLevel`, `PracticeMode`, `UserRole`

**Task 2.2: DTOs and Validation**
- Create DTOs for all API operations (Login, Register, Questions, Sessions, etc.)
- Implement FluentValidation rules for all DTOs
- Add model validation attributes where appropriate

#### **Week 3: Repository Pattern**
**Task 3.1: Repository Interfaces**
- Create repository interfaces for all entities
- Include methods for CRUD operations, filtering, pagination, and bulk operations
- Design interfaces to support complex queries (filter by topic, difficulty, type)

**Task 3.2: Repository Implementations**
- Implement all repository classes using Entity Framework
- Add proper error handling and logging
- Include pagination support and optimized queries
- Implement bulk insert operations for Excel import

#### **Week 4: Authentication System**
**Task 4.1: JWT Service**
- Create JWT token generation and validation service
- Implement refresh token mechanism with database storage
- Add claims-based authorization (User vs Admin roles)

**Task 4.2: Authentication Service**
- Implement login, registration, password reset functionality
- Use ASP.NET Core Identity's password hashing
- Add email service for password reset (mock implementation initially)
- Include proper security logging and failed attempt tracking

#### **Week 5: Text Matching Engine (CRITICAL)**
**Task 5.1: Text Normalization**
- Create service to normalize text (lowercase, remove accents, handle punctuation)
- Implement stop words filtering (configurable list in multiple languages)
- Add keyword extraction with minimum length requirements

**Task 5.2: Matching Algorithm**
- Implement percentage-based matching: (matched_keywords / total_official_keywords) × 100
- Create configurable threshold system (default 80%, user-customizable)
- Return detailed results: match percentage, found keywords, missing keywords
- Add support for fuzzy matching (optional enhancement)

#### **Week 6: Practice Session Logic**
**Task 6.1: Session Management**
- Create service to start practice sessions with filters (topic, difficulty, count)
- Implement random question selection with no repeats in same session
- Add session state tracking (current question, time spent, etc.)

**Task 6.2: Answer Evaluation**
- Implement answer submission and evaluation logic
- Handle different question types (single, multiple, written)
- Calculate scores and provide immediate feedback (study mode) or delayed (interview mode)
- Track time spent per question and total session time

#### **Week 7: Excel Import System**
**Task 7.1: Excel Processing**
- Create Excel import service using EPPlus library
- Support .xlsx and .xls formats up to 10MB
- Validate required columns: Pregunta, Categoria, TipoPregunta, Nivel, Respuesta, Opciones, Correctas, Recursos
- Generate downloadable Excel template

**Task 7.2: Import Validation**
- Implement comprehensive row-by-row validation
- Create detailed error reporting with row and column information
- Support preview mode before final import
- Add rollback capability for failed imports

#### **Week 8: Analytics and Reporting**
**Task 8.1: Performance Calculation**
- Create service to calculate user statistics (accuracy, total questions, time spent)
- Implement topic-based performance analysis
- Generate session summaries with detailed metrics

**Task 8.2: Data Export**
- Implement CSV export for incorrect/unresolved questions
- Include associated learning resources in exports
- Add filters for export data (date range, topics, etc.)

### **PHASE 2: API Controllers**

#### **Week 9: Authentication APIs**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

#### **Week 10: Question Management APIs**
- `GET /api/questions` - List questions with filters (topic, type, level, pagination)
- `GET /api/questions/{id}` - Get single question with options and resources
- `POST /api/questions` - Create question (Admin only)
- `PUT /api/questions/{id}` - Update question (Admin only)
- `DELETE /api/questions/{id}` - Delete question (Admin only)

#### **Week 11: Practice Session APIs**
- `POST /api/practice/start` - Start new practice session
- `GET /api/practice/{sessionId}` - Get session details
- `POST /api/practice/{sessionId}/answer` - Submit answer
- `GET /api/practice/{sessionId}/next` - Get next question
- `POST /api/practice/{sessionId}/finish` - Complete session

#### **Week 12: Admin and Import APIs**
- `POST /api/admin/import/excel` - Upload and import Excel file
- `GET /api/admin/import/template` - Download Excel template
- `GET /api/admin/import/{importId}/status` - Check import status
- `GET /api/admin/statistics` - Global platform statistics

---

## 🗄️ Database Schema Specifications

### **Required Tables and Relationships**

**Users Table**:
```
- Id (GUID, Primary Key)
- Email (NVARCHAR(255), Unique, Not Null)
- PasswordHash (NVARCHAR(255), Not Null)
- FirstName (NVARCHAR(100), Not Null)
- LastName (NVARCHAR(100), Not Null)
- Role (NVARCHAR(50), Default 'Student') - Values: 'Student', 'Admin'
- Specialization (NVARCHAR(100), Nullable)
- YearsOfExperience (INT, Nullable)
- MatchingThreshold (DECIMAL(5,2), Default 80.0)
- CreatedAt (DATETIME2, Default GETUTCDATE())
- UpdatedAt (DATETIME2, Default GETUTCDATE())
```

**Topics Table**:
```
- Id (INT, Identity, Primary Key)
- Name (NVARCHAR(100), Unique, Not Null)
- Description (NVARCHAR(500), Nullable)
- CreatedAt (DATETIME2, Default GETUTCDATE())
```

**Questions Table**:
```
- Id (GUID, Primary Key)
- TopicId (INT, Foreign Key to Topics, Not Null)
- Text (NVARCHAR(MAX), Not Null)
- Type (NVARCHAR(20), Check: 'single_choice', 'multi_choice', 'written')
- Level (NVARCHAR(20), Check: 'basic', 'intermediate', 'advanced')
- OfficialAnswer (NVARCHAR(MAX), Nullable - Required for 'written' type)
- CreatedAt (DATETIME2, Default GETUTCDATE())
- UpdatedAt (DATETIME2, Default GETUTCDATE())
```

**QuestionOptions Table** (Only for choice questions):
```
- Id (GUID, Primary Key)
- QuestionId (GUID, Foreign Key to Questions, CASCADE DELETE)
- Text (NVARCHAR(MAX), Not Null)
- IsCorrect (BIT, Default 0)
- OrderIndex (INT, Not Null)
```

**InterviewSessions Table**:
```
- Id (GUID, Primary Key)
- UserId (GUID, Foreign Key to Users)
- Mode (NVARCHAR(20), Check: 'study', 'interview')
- TopicId (INT, Foreign Key to Topics, Nullable)
- Level (NVARCHAR(20), Nullable)
- TotalQuestions (INT, Not Null)
- CorrectAnswers (INT, Default 0)
- Score (DECIMAL(5,2), Default 0)
- StartedAt (DATETIME2, Not Null)
- FinishedAt (DATETIME2, Nullable)
- IsCompleted (BIT, Default 0)
```

**InterviewAnswers Table**:
```
- Id (GUID, Primary Key)
- SessionId (GUID, Foreign Key to InterviewSessions, CASCADE DELETE)
- QuestionId (GUID, Foreign Key to Questions)
- GivenAnswer (NVARCHAR(MAX), Nullable - For written questions)
- SelectedOptionsJson (NVARCHAR(MAX), Nullable - For choice questions, JSON array)
- IsCorrect (BIT, Default 0)
- MatchPercentage (DECIMAL(5,2), Nullable - For written questions)
- TimeSpentSeconds (INT, Default 0)
- AnsweredAt (DATETIME2, Default GETUTCDATE())
```

### **Required Indexes for Performance**:
- IX_Users_Email (Unique)
- IX_Questions_TopicId
- IX_Questions_Type  
- IX_Questions_Level
- IX_InterviewSessions_UserId
- IX_InterviewAnswers_SessionId

---

## 🔧 Critical Implementation Requirements

### **Text Matching Algorithm Specifications**
1. **Normalization Process**:
   - Convert to lowercase
   - Remove diacritics/accents (á→a, é→e, etc.)
   - Remove punctuation except hyphens
   - Replace multiple spaces with single space

2. **Keyword Extraction**:
   - Split text into words
   - Remove words shorter than 2 characters
   - Filter out stop words (configurable list)
   - Return unique keywords only

3. **Matching Calculation**:
   - Formula: (number of official keywords found in user answer / total official keywords) × 100
   - Round to 2 decimal places
   - Return detailed match information (found keywords, missing keywords)

4. **Stop Words List** (minimum required):
   - Spanish: "el", "la", "los", "las", "un", "una", "de", "del", "en", "con", "por", "para", "que", "es", "son"
   - English: "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are"

### **Excel Import Format Specifications**
**Required Columns (exact names)**:
1. **Pregunta** - Question text (required)
2. **Categoria** - Topic name (must exist in Topics table)  
3. **TipoPregunta** - "single" | "multi" | "written"
4. **Nivel** - "basico" | "medio" | "dificil" 
5. **Respuesta** - Official answer (required for written, correct option text for others)
6. **Opciones** - Pipe-separated options for choice questions: "Option A|Option B|Option C"
7. **Correctas** - For single: option text or index. For multi: pipe-separated correct options
8. **Recursos** - Pipe-separated URLs: "http://link1.com|http://link2.com"

**Validation Rules**:
- All fields except Recursos are required
- TipoPregunta must be valid enum value
- Categoria must exist in database (auto-create if Admin setting enabled)
- For choice questions: Opciones must have 2-6 options
- For single choice: Correctas must match exactly one option
- For multiple choice: Correctas must match 1-5 options
- URLs in Recursos must be valid format

### **API Response Standards**
**Success Response Format**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "User-friendly error message",
    "details": { /* detailed error information */ }
  }
}
```

**Pagination Format**:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 📊 Quality Requirements

### **Performance Targets**:
- API response time: ≤200ms (95th percentile)
- Database query optimization for >10,000 questions
- Excel import processing: ≤30 seconds for 1,000 questions
- Text matching: ≤100ms per evaluation

### **Security Requirements**:
- JWT tokens expire in 15 minutes, refresh tokens in 7 days
- Password hashing using ASP.NET Core Identity (minimum cost factor 12)
- Rate limiting: 100 requests per minute per IP
- Input validation on all endpoints
- SQL injection prevention through EF Core parameterized queries

### **Testing Requirements**:
- Unit test coverage ≥80% for business logic
- Integration tests for all API endpoints
- Dedicated tests for text matching algorithm with edge cases
- Performance tests for bulk operations

### **Logging Requirements**:
- Structured logging using Serilog
- Log levels: Information (successful operations), Warning (validation failures), Error (exceptions)
- Include correlation IDs for request tracking
- Log sensitive operations (login attempts, admin actions)

---

## 🚧 Development Guidelines

### **Code Organization**:
- Follow Clean Architecture principles
- Use dependency injection for all services
- Implement async/await patterns consistently
- Add XML documentation for all public methods

### **Database Migrations**:
- Create separate migrations for schema and data changes
- Include rollback scripts for production deployments
- Use meaningful migration names with timestamps

### **Error Handling**:
- Global exception middleware for unhandled exceptions
- Custom exceptions for business logic violations
- Return appropriate HTTP status codes
- Log all errors with sufficient context

### **Configuration Management**:
- Use strongly-typed configuration classes
- Support multiple environments (Development, Staging, Production)
- Externalize connection strings and sensitive settings
- Include feature flags for gradual rollouts

---

## ✅ Definition of Done for Backend

Each feature/API is considered complete when:

1. **Implementation**: 
   - Feature implemented according to specifications
   - Code follows project architecture patterns
   - All edge cases handled appropriately

2. **Testing**:
   - Unit tests written and passing (≥80% coverage)
   - Integration tests for API endpoints
   - Manual testing completed

3. **Documentation**:
   - API endpoints documented with Swagger
   - Complex business logic commented
   - README updated if needed

4. **Security & Performance**:
   - Security requirements met
   - Performance targets achieved
   - No SQL N+1 problems

5. **Code Quality**:
   - Code review completed
   - No critical SonarQube issues
   - Proper error handling implemented

---

## 🔄 Next Steps After Backend

Once backend is complete and tested, proceed with:
1. Frontend React application setup
2. API integration layer
3. UI component development  
4. End-to-end testing
5. Deployment pipeline setup

---

**Start with Task 1.1: Project Structure Setup. Focus on getting the foundation solid before moving to the next phase.**

## 📋 Package Dependencies

### **Backend Dependencies (NuGet)**

**Core Framework:**
```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
```

**Authentication & Security:**
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />
```

**Additional Libraries:**
```xml
<PackageReference Include="AutoMapper" Version="12.0.1" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
<PackageReference Include="FluentValidation" Version="11.8.0" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
<PackageReference Include="EPPlus" Version="7.0.0" />
<PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="5.0.0" />
<PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
```

**Testing:**
```xml
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
<PackageReference Include="xunit" Version="2.6.1" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.3" />
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
<PackageReference Include="Moq" Version="4.20.69" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
```

### **Frontend Dependencies (package.json)**

**Core Framework:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.2.2"
  }
}
```

**State Management & API:**
```json
{
  "dependencies": {
    "zustand": "^4.4.6",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2"
  }
}
```

**UI & Styling:**
```json
{
  "dependencies": {
    "tailwindcss": "^3.3.5",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^10.16.4",
    "recharts": "^2.8.0"
  }
}
```

**Development Tools:**
```json
{
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "vite": "^5.0.0",
    "eslint": "^8.53.0",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "prettier": "^3.0.3",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

**Testing:**
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1",
    "vitest": "^0.34.6",
    "jsdom": "^22.1.0",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 🛠️ Development Scripts

### **Root Level Scripts (scripts/)**

**setup.sh** - Initial project setup:
```bash
#!/bin/bash
echo "🚀 Setting up TechPrep monorepo..."

# Backend setup
cd backend
dotnet restore
dotnet ef database update
cd ..

# Frontend setup
cd frontend
npm install
cd ..

# Create local environment files
cp backend/src/TechPrep.API/appsettings.Development.example.json backend/src/TechPrep.API/appsettings.Development.json
cp frontend/.env.example frontend/.env.local

echo "✅ Setup completed! Run './scripts/dev.sh' to start development servers"
```

**dev.sh** - Start development servers:
```bash
#!/bin/bash
echo "🏃 Starting development servers..."

# Kill any existing processes on ports 5000 and 3000
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend in background
cd backend
dotnet run --project src/TechPrep.API &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "🔧 Backend running on http://localhost:5000"
echo "🎨 Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C and cleanup
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
```

**build.sh** - Build both applications:
```bash
#!/bin/bash
echo "🔨 Building TechPrep applications..."

# Build backend
cd backend
dotnet build --configuration Release
dotnet publish src/TechPrep.API --configuration Release --output ../dist/backend

# Build frontend
cd ../frontend
npm run build
cp -r dist ../dist/frontend

echo "✅ Build completed! Artifacts in ./dist/"
```

**test.sh** - Run all tests:
```bash
#!/bin/bash
echo "🧪 Running all tests..."

# Backend tests
cd backend
dotnet test --configuration Release --logger trx --results-directory ../test-results/backend

# Frontend tests
cd ../frontend
npm run test:unit
npm run test:e2e

echo "📊 Test results available in ./test-results/"
```

---

## 🔧 Configuration Files

### **Backend Configuration**

**appsettings.json**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=techprep.db"
  },
  "JwtSettings": {
    "Key": "your-super-secret-jwt-key-change-in-production",
    "Issuer": "TechPrep",
    "Audience": "TechPrep-Users",
    "ExpiryInMinutes": 15,
    "RefreshTokenExpiryInDays": 7
  },
  "EmailSettings": {
    "SmtpServer": "localhost",
    "SmtpPort": 587,
    "FromEmail": "noreply@techprep.com",
    "FromName": "TechPrep"
  },
  "ImportSettings": {
    "MaxFileSizeInMB": 10,
    "AllowedFileTypes": [".xlsx", ".xls"],
    "MaxQuestionsPerImport": 1000
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**appsettings.Production.json**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TechPrepProd;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "Key": "${JWT_SECRET_KEY}",
    "ExpiryInMinutes": 15
  },
  "EmailSettings": {
    "SmtpServer": "${SMTP_SERVER}",
    "SmtpPort": 587,
    "Username": "${SMTP_USERNAME}",
    "Password": "${SMTP_PASSWORD}"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "TechPrep": "Information"
    }
  }
}
```

### **Frontend Configuration**

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts']
        }
      }
    }
  }
})
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e293b'
        },
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706'
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
```

**.env.example**:
```
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TechPrep
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANALYTICS=false

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

---

## 🚀 Docker Configuration

**docker-compose.yml** (Development):
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/techprep.db
    volumes:
      - ./backend:/app
      - backend-data:/app/data
    command: dotnet watch run --project src/TechPrep.API

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  backend-data:
```

**docker-compose.prod.yml** (Production):
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=${DATABASE_CONNECTION_STRING}
      - JwtSettings__Key=${JWT_SECRET_KEY}
    volumes:
      - app-data:/app/data

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8080/api
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  app-data:
```

---

## 📋 Development Workflow Instructions

### **Initial Setup Process**

1. **Clone and Setup**:
   ```bash
   git clone <repository-url> techprep
   cd techprep
   chmod +x scripts/*.sh
   ./scripts/setup.sh
   ```

2. **Environment Configuration**:
   - Copy `backend/src/TechPrep.API/appsettings.Development.example.json` to `appsettings.Development.json`
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Update configuration values as needed

3. **Database Initialization**:
   ```bash
   cd backend
   dotnet ef database update
   dotnet run --project src/TechPrep.API -- --seed-data
   ```

### **Daily Development Workflow**

1. **Start Development Servers**:
   ```bash
   ./scripts/dev.sh
   ```

2. **Run Tests**:
   ```bash
   ./scripts/test.sh
   ```

3. **Create Database Migration** (when needed):
   ```bash
   cd backend
   dotnet ef migrations add <MigrationName>
   dotnet ef database update
   ```

4. **Build for Production**:
   ```bash
   ./scripts/build.sh
   ```

### **Code Quality Checks**

**Backend**:
```bash
cd backend
dotnet format
dotnet build --verbosity quiet
dotnet test --logger trx
```

**Frontend**:
```bash
cd frontend
npm run lint
npm run type-check
npm run test:unit
```

---

## 📁 Shared Types Structure

### **shared/types/api.ts**
```typescript
// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

### **shared/types/entities.ts**
```typescript
export enum QuestionType {
  SingleChoice = 'single_choice',
  MultiChoice = 'multi_choice',
  Written = 'written'
}

export enum DifficultyLevel {
  Basic = 'basic',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export enum PracticeMode {
  Study = 'study',
  Interview = 'interview'
}

export enum UserRole {
  Student = 'student',
  Admin = 'admin'
}
```

### **shared/constants/apiRoutes.ts**
```typescript
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  QUESTIONS: {
    BASE: '/questions',
    BY_ID: (id: string) => `/questions/${id}`,
    BY_FILTERS: '/questions/search'
  },
  PRACTICE: {
    START: '/practice/start',
    SESSION: (id: string) => `/practice/${id}`,
    ANSWER: (sessionId: string) => `/practice/${sessionId}/answer`,
    FINISH: (sessionId: string) => `/practice/${sessionId}/finish`
  },
  ADMIN: {
    IMPORT: '/admin/import/excel',
    TEMPLATE: '/admin/import/template',
    STATISTICS: '/admin/statistics'
  }
} as const;
```

---

**This completes the comprehensive monorepo structure. Start development with Task 1.1: Monorepo Structure Setup, then proceed through the backend implementation phases before moving to frontend development.**# 🚀 TechPrep - Technical Interview Preparation Platform

## 📋 Project Instructions for Claude Code

This document contains complete specifications for developing TechPrep, a comprehensive web platform for technical interview preparation. Development should proceed **backend-first**, then frontend.

---

## 🎯 Project Overview

**Mission**: Create a platform where developers can practice for technical interviews with intelligent question evaluation, especially for written responses using text matching algorithms.

**Key Features**:
- Three question types: Single choice, Multiple choice, Written responses
- Text matching engine for written answers (≥80% accuracy threshold)
- Excel import system for bulk question loading
- Analytics and progress tracking
- Admin panel for content management

**Technology Stack**:
- **Backend**: .NET 8 Web API + SQLite (production-ready for PostgreSQL migration)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Architecture**: Clean Architecture with Repository Pattern
- **Authentication**: JWT with refresh tokens

---

## 🏗️ Development Phases

### **PHASE 1: Backend Development (Start Here)**

#### **Week 1: Foundation Setup**
**Task 1.1: Project Structure**
- Create .NET 8 Web API project with Clean Architecture structure
- Set up folders: `Controllers/`, `Models/`, `Services/`, `Repositories/`, `Infrastructure/`
- Configure `appsettings.json` for development and production environments
- Install required NuGet packages: EntityFramework.Core, EntityFramework.Sqlite, AutoMapper, FluentValidation, EPPlus, JWT packages

**Task 1.2: Database Design**
- Create Entity Framework models for all entities (detailed schema provided below)
- Implement `TechPrepDbContext` with proper configurations
- Generate initial migration with complete database schema
- Create seed data migration with basic topics (JavaScript, React, .NET, Python, etc.)

#### **Week 2: Core Domain Layer**
**Task 2.1: Entity Models**
- Implement all domain entities: `User`, `Topic`, `Question`, `QuestionOption`, `InterviewSession`, `InterviewAnswer`, `LearningResource`, `CodeChallenge`
- Add proper relationships, constraints, and indexes
- Create enums: `QuestionType`, `DifficultyLevel`, `PracticeMode`, `UserRole`

**Task 2.2: DTOs and Validation**
- Create DTOs for all API operations (Login, Register, Questions, Sessions, etc.)
- Implement FluentValidation rules for all DTOs
- Add model validation attributes where appropriate

#### **Week 3: Repository Pattern**
**Task 3.1: Repository Interfaces**
- Create repository interfaces for all entities
- Include methods for CRUD operations, filtering, pagination, and bulk operations
- Design interfaces to support complex queries (filter by topic, difficulty, type)

**Task 3.2: Repository Implementations**
- Implement all repository classes using Entity Framework
- Add proper error handling and logging
- Include pagination support and optimized queries
- Implement bulk insert operations for Excel import

#### **Week 4: Authentication System**
**Task 4.1: JWT Service**
- Create JWT token generation and validation service
- Implement refresh token mechanism with database storage
- Add claims-based authorization (User vs Admin roles)

**Task 4.2: Authentication Service**
- Implement login, registration, password reset functionality
- Use ASP.NET Core Identity's password hashing
- Add email service for password reset (mock implementation initially)
- Include proper security logging and failed attempt tracking

#### **Week 5: Text Matching Engine (CRITICAL)**
**Task 5.1: Text Normalization**
- Create service to normalize text (lowercase, remove accents, handle punctuation)
- Implement stop words filtering (configurable list in multiple languages)
- Add keyword extraction with minimum length requirements

**Task 5.2: Matching Algorithm**
- Implement percentage-based matching: (matched_keywords / total_official_keywords) × 100
- Create configurable threshold system (default 80%, user-customizable)
- Return detailed results: match percentage, found keywords, missing keywords
- Add support for fuzzy matching (optional enhancement)

#### **Week 6: Practice Session Logic**
**Task 6.1: Session Management**
- Create service to start practice sessions with filters (topic, difficulty, count)
- Implement random question selection with no repeats in same session
- Add session state tracking (current question, time spent, etc.)

**Task 6.2: Answer Evaluation**
- Implement answer submission and evaluation logic
- Handle different question types (single, multiple, written)
- Calculate scores and provide immediate feedback (study mode) or delayed (interview mode)
- Track time spent per question and total session time

#### **Week 7: Excel Import System**
**Task 7.1: Excel Processing**
- Create Excel import service using EPPlus library
- Support .xlsx and .xls formats up to 10MB
- Validate required columns: Pregunta, Categoria, TipoPregunta, Nivel, Respuesta, Opciones, Correctas, Recursos
- Generate downloadable Excel template

**Task 7.2: Import Validation**
- Implement comprehensive row-by-row validation
- Create detailed error reporting with row and column information
- Support preview mode before final import
- Add rollback capability for failed imports

#### **Week 8: Analytics and Reporting**
**Task 8.1: Performance Calculation**
- Create service to calculate user statistics (accuracy, total questions, time spent)
- Implement topic-based performance analysis
- Generate session summaries with detailed metrics

**Task 8.2: Data Export**
- Implement CSV export for incorrect/unresolved questions
- Include associated learning resources in exports
- Add filters for export data (date range, topics, etc.)

### **PHASE 2: API Controllers**

#### **Week 9: Authentication APIs**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

#### **Week 10: Question Management APIs**
- `GET /api/questions` - List questions with filters (topic, type, level, pagination)
- `GET /api/questions/{id}` - Get single question with options and resources
- `POST /api/questions` - Create question (Admin only)
- `PUT /api/questions/{id}` - Update question (Admin only)
- `DELETE /api/questions/{id}` - Delete question (Admin only)

#### **Week 11: Practice Session APIs**
- `POST /api/practice/start` - Start new practice session
- `GET /api/practice/{sessionId}` - Get session details
- `POST /api/practice/{sessionId}/answer` - Submit answer
- `GET /api/practice/{sessionId}/next` - Get next question
- `POST /api/practice/{sessionId}/finish` - Complete session

#### **Week 12: Admin and Import APIs**
- `POST /api/admin/import/excel` - Upload and import Excel file
- `GET /api/admin/import/template` - Download Excel template
- `GET /api/admin/import/{importId}/status` - Check import status
- `GET /api/admin/statistics` - Global platform statistics

---

## 🗄️ Database Schema Specifications

### **Required Tables and Relationships**

**Users Table**:
```
- Id (GUID, Primary Key)
- Email (NVARCHAR(255), Unique, Not Null)
- PasswordHash (NVARCHAR(255), Not Null)
- FirstName (NVARCHAR(100), Not Null)
- LastName (NVARCHAR(100), Not Null)
- Role (NVARCHAR(50), Default 'Student') - Values: 'Student', 'Admin'
- Specialization (NVARCHAR(100), Nullable)
- YearsOfExperience (INT, Nullable)
- MatchingThreshold (DECIMAL(5,2), Default 80.0)
- CreatedAt (DATETIME2, Default GETUTCDATE())
- UpdatedAt (DATETIME2, Default GETUTCDATE())
```

**Topics Table**:
```
- Id (INT, Identity, Primary Key)
- Name (NVARCHAR(100), Unique, Not Null)
- Description (NVARCHAR(500), Nullable)
- CreatedAt (DATETIME2, Default GETUTCDATE())
```

**Questions Table**:
```
- Id (GUID, Primary Key)
- TopicId (INT, Foreign Key to Topics, Not Null)
- Text (NVARCHAR(MAX), Not Null)
- Type (NVARCHAR(20), Check: 'single_choice', 'multi_choice', 'written')
- Level (NVARCHAR(20), Check: 'basic', 'intermediate', 'advanced')
- OfficialAnswer (NVARCHAR(MAX), Nullable - Required for 'written' type)
- CreatedAt (DATETIME2, Default GETUTCDATE())
- UpdatedAt (DATETIME2, Default GETUTCDATE())
```

**QuestionOptions Table** (Only for choice questions):
```
- Id (GUID, Primary Key)
- QuestionId (GUID, Foreign Key to Questions, CASCADE DELETE)
- Text (NVARCHAR(MAX), Not Null)
- IsCorrect (BIT, Default 0)
- OrderIndex (INT, Not Null)
```

**InterviewSessions Table**:
```
- Id (GUID, Primary Key)
- UserId (GUID, Foreign Key to Users)
- Mode (NVARCHAR(20), Check: 'study', 'interview')
- TopicId (INT, Foreign Key to Topics, Nullable)
- Level (NVARCHAR(20), Nullable)
- TotalQuestions (INT, Not Null)
- CorrectAnswers (INT, Default 0)
- Score (DECIMAL(5,2), Default 0)
- StartedAt (DATETIME2, Not Null)
- FinishedAt (DATETIME2, Nullable)
- IsCompleted (BIT, Default 0)
```

**InterviewAnswers Table**:
```
- Id (GUID, Primary Key)
- SessionId (GUID, Foreign Key to InterviewSessions, CASCADE DELETE)
- QuestionId (GUID, Foreign Key to Questions)
- GivenAnswer (NVARCHAR(MAX), Nullable - For written questions)
- SelectedOptionsJson (NVARCHAR(MAX), Nullable - For choice questions, JSON array)
- IsCorrect (BIT, Default 0)
- MatchPercentage (DECIMAL(5,2), Nullable - For written questions)
- TimeSpentSeconds (INT, Default 0)
- AnsweredAt (DATETIME2, Default GETUTCDATE())
```

### **Required Indexes for Performance**:
- IX_Users_Email (Unique)
- IX_Questions_TopicId
- IX_Questions_Type  
- IX_Questions_Level
- IX_InterviewSessions_UserId
- IX_InterviewAnswers_SessionId

---

## 🔧 Critical Implementation Requirements

### **Text Matching Algorithm Specifications**
1. **Normalization Process**:
   - Convert to lowercase
   - Remove diacritics/accents (á→a, é→e, etc.)
   - Remove punctuation except hyphens
   - Replace multiple spaces with single space

2. **Keyword Extraction**:
   - Split text into words
   - Remove words shorter than 2 characters
   - Filter out stop words (configurable list)
   - Return unique keywords only

3. **Matching Calculation**:
   - Formula: (number of official keywords found in user answer / total official keywords) × 100
   - Round to 2 decimal places
   - Return detailed match information (found keywords, missing keywords)

4. **Stop Words List** (minimum required):
   - Spanish: "el", "la", "los", "las", "un", "una", "de", "del", "en", "con", "por", "para", "que", "es", "son"
   - English: "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are"

### **Excel Import Format Specifications**
**Required Columns (exact names)**:
1. **Pregunta** - Question text (required)
2. **Categoria** - Topic name (must exist in Topics table)  
3. **TipoPregunta** - "single" | "multi" | "written"
4. **Nivel** - "basico" | "medio" | "dificil" 
5. **Respuesta** - Official answer (required for written, correct option text for others)
6. **Opciones** - Pipe-separated options for choice questions: "Option A|Option B|Option C"
7. **Correctas** - For single: option text or index. For multi: pipe-separated correct options
8. **Recursos** - Pipe-separated URLs: "http://link1.com|http://link2.com"

**Validation Rules**:
- All fields except Recursos are required
- TipoPregunta must be valid enum value
- Categoria must exist in database (auto-create if Admin setting enabled)
- For choice questions: Opciones must have 2-6 options
- For single choice: Correctas must match exactly one option
- For multiple choice: Correctas must match 1-5 options
- URLs in Recursos must be valid format

### **API Response Standards**
**Success Response Format**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "User-friendly error message",
    "details": { /* detailed error information */ }
  }
}
```

**Pagination Format**:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 📊 Quality Requirements

### **Performance Targets**:
- API response time: ≤200ms (95th percentile)
- Database query optimization for >10,000 questions
- Excel import processing: ≤30 seconds for 1,000 questions
- Text matching: ≤100ms per evaluation

### **Security Requirements**:
- JWT tokens expire in 15 minutes, refresh tokens in 7 days
- Password hashing using ASP.NET Core Identity (minimum cost factor 12)
- Rate limiting: 100 requests per minute per IP
- Input validation on all endpoints
- SQL injection prevention through EF Core parameterized queries

### **Testing Requirements**:
- Unit test coverage ≥80% for business logic
- Integration tests for all API endpoints
- Dedicated tests for text matching algorithm with edge cases
- Performance tests for bulk operations

### **Logging Requirements**:
- Structured logging using Serilog
- Log levels: Information (successful operations), Warning (validation failures), Error (exceptions)
- Include correlation IDs for request tracking
- Log sensitive operations (login attempts, admin actions)

---

## 🚧 Development Guidelines

### **Code Organization**:
- Follow Clean Architecture principles
- Use dependency injection for all services
- Implement async/await patterns consistently
- Add XML documentation for all public methods

### **Database Migrations**:
- Create separate migrations for schema and data changes
- Include rollback scripts for production deployments
- Use meaningful migration names with timestamps

### **Error Handling**:
- Global exception middleware for unhandled exceptions
- Custom exceptions for business logic violations
- Return appropriate HTTP status codes
- Log all errors with sufficient context

### **Configuration Management**:
- Use strongly-typed configuration classes
- Support multiple environments (Development, Staging, Production)
- Externalize connection strings and sensitive settings
- Include feature flags for gradual rollouts

---

## ✅ Definition of Done for Backend

Each feature/API is considered complete when:

1. **Implementation**: 
   - Feature implemented according to specifications
   - Code follows project architecture patterns
   - All edge cases handled appropriately

2. **Testing**:
   - Unit tests written and passing (≥80% coverage)
   - Integration tests for API endpoints
   - Manual testing completed

3. **Documentation**:
   - API endpoints documented with Swagger
   - Complex business logic commented
   - README updated if needed

4. **Security & Performance**:
   - Security requirements met
   - Performance targets achieved
   - No SQL N+1 problems

5. **Code Quality**:
   - Code review completed
   - No critical SonarQube issues
   - Proper error handling implemented

---

## 🔄 Next Steps After Backend

Once backend is complete and tested, proceed with:
1. Frontend React application setup
2. API integration layer
3. UI component development  
4. End-to-end testing
5. Deployment pipeline setup

---

**Start with Task 1.1: Project Structure Setup. Focus on getting the foundation solid before moving to the next phase.**