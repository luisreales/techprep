# TechPrep 🚀

**Smart Platform to Prepare for Technical Interviews**

TechPrep is a comprehensive technical interview preparation platform designed to help developers build their skills through intelligent question evaluation, practice sessions, and curated learning resources. The platform features a **backend-first development approach** with advanced text matching algorithms for written responses.

## 🎯 Mission

Create a platform where developers can practice for technical interviews with intelligent question evaluation, especially for written responses using sophisticated text matching algorithms, while providing a stress-free learning environment with immediate feedback and educational support.

## 🏗️ Architecture Overview

TechPrep follows **Clean Architecture** principles with a robust, scalable design:

- **Backend**: .NET 8 Web API with Clean Architecture pattern
- **Frontend**: React 18 + TypeScript with modern UI/UX
- **Database**: SQLite (development) → PostgreSQL (production)
- **Authentication**: JWT with refresh tokens and ASP.NET Core Identity
- **State Management**: Zustand + React Query for optimal performance

## 🌟 Core Modules

### 1. 📚 Practice Module (Educational Learning)
The **Practice Module** is designed for stress-free learning and skill building with immediate feedback.

#### Key Features:
- **Question Browsing**: Advanced filtering by topic, difficulty, type, and search
- **Individual Practice**: Complete question practice with immediate feedback
- **Progress Tracking**: Comprehensive analytics and streak tracking
- **Text Matching Engine**: Intelligent evaluation for written answers (≤100ms per evaluation)
- **Bookmark System**: Save and organize favorite questions
- **Quick Start**: Smart topic recommendations based on performance
- **Student Resources**: Curated learning materials with personalized recommendations

#### Practice Module Architecture:
```
Practice Module/
├── Question Management
│   ├── Browsing & Filtering
│   ├── Real-time Search (300ms debouncing)
│   ├── Individual Question Practice
│   └── Immediate Feedback System
├── Progress Tracking
│   ├── Personal Dashboard
│   ├── Topic-specific Analytics
│   ├── Streak Counter
│   └── Performance Metrics
├── Learning Resources
│   ├── Curated Materials
│   ├── Personalized Recommendations
│   ├── Question-linked Resources
│   └── Access Tracking
└── Text Matching Engine
    ├── Normalization Pipeline
    ├── Keyword Extraction
    ├── Scoring Algorithm
    └── Performance Optimization
```

#### API Endpoints:
- **Practice API** (`/api/practice`): Question browsing, attempts, progress, bookmarks
- **Resources API** (`/api/resources`): Learning materials, recommendations, access tracking

### 2. 🎯 Interview Module (Assessment & Evaluation)
The **Interview Module** provides formal assessment capabilities for technical interviews.

#### Key Features:
- **Interview Templates**: Customizable question sets with difficulty progression
- **Session Management**: Timed interviews with pause/resume functionality
- **Assignment System**: Assign interviews to specific users or groups
- **Comprehensive Evaluation**: Detailed scoring and performance analysis
- **Practice Interview Mode**: Simulate real interview conditions

#### Interview Module Components:
- **Templates Management**: Create and manage interview question sets
- **Session Control**: Real-time interview session management
- **Group Assignments**: Bulk assignment to user groups
- **Credit System**: Manage interview credits and usage
- **Results Analysis**: Detailed performance reports

## 🚀 Technology Stack

### Backend (.NET 8)
```
Backend Architecture/
├── TechPrep.API/           # Controllers, middleware, startup
├── TechPrep.Core/          # Domain entities, enums, interfaces
├── TechPrep.Application/   # Business logic, DTOs, services
├── TechPrep.Infrastructure/ # Repositories, EF Core, external services
└── Tests/                  # Unit and integration tests
```

**Key Technologies:**
- **Framework**: .NET 8 Web API
- **ORM**: Entity Framework Core 8.0
- **Authentication**: ASP.NET Core Identity + JWT
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Logging**: Serilog
- **Excel Processing**: EPPlus

### Frontend (React 18)
```
Frontend Architecture/
├── src/components/         # Reusable UI components
├── src/pages/             # Route-level page components
├── src/services/          # API integration layer
├── src/stores/            # Zustand state management
├── src/types/             # TypeScript type definitions
├── src/hooks/             # Custom React hooks
└── src/utils/             # Utility functions
```

**Key Technologies:**
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: Zustand for global state
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Build Tool**: Vite

## 📊 Database Schema

### Core Entities
- **Users**: User management with practice statistics
- **Topics**: Question categories and organization
- **Questions**: Question bank with practice/interview flags
- **QuestionOptions**: Multiple choice options
- **LearningResources**: Educational materials and links

### Practice Module Entities
- **PracticeAttempts**: Individual question attempts with scoring
- **PracticeBookmarks**: User's saved questions with notes
- **ResourceAccessLog**: Track resource usage and engagement
- **ResourceBookmark**: User's saved learning resources

### Interview Module Entities
- **InterviewTemplates**: Configurable interview question sets
- **InterviewSessions**: Formal interview session management
- **SessionAssignments**: Assign interviews to users/groups
- **CreditLedger**: Track interview credit usage

## 🛠️ Development Setup

### Prerequisites
- **.NET 8 SDK**
- **Node.js 18+**
- **Git**

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd techprep

# Make scripts executable
chmod +x scripts/*.sh

# Initial setup (installs dependencies, sets up database)
./scripts/setup.sh

# Start development servers
./scripts/dev.sh
```

### Development Commands

**Full Stack Development:**
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
```

**Frontend Specific:**
```bash
cd frontend
npm install         # Install packages
npm run dev         # Start dev server
npm run build       # Build for production
npm run test:unit   # Unit tests
npm run type-check  # TypeScript validation
```

## 🎨 Key Features

### Text Matching Algorithm (Core Innovation)
- **Normalization**: Lowercase, remove accents/punctuation, normalize spaces
- **Keyword Extraction**: Split words, filter stop words, minimum 2 characters
- **Matching Calculation**: `(matched_keywords / total_official_keywords) × 100`
- **Performance**: ≤100ms per evaluation
- **Multilingual**: Configurable stop words for Spanish/English

### Excel Import System
- **File Support**: .xlsx/.xls files up to 10MB
- **Validation**: Row-by-row with detailed error reporting
- **Batch Processing**: Up to 1000 questions per import
- **Required Columns**: Question, Category, Type, Level, Answer, Options, etc.

### Authentication & Security
- **JWT Tokens**: 15-minute expiry with 7-day refresh tokens
- **Role-based Access**: Admin/Student role separation
- **Password Security**: ASP.NET Core Identity with minimum cost 12
- **Rate Limiting**: 100 requests/minute per IP

## 📈 Performance Requirements

### API Performance
- **Response Time**: ≤200ms (95th percentile)
- **Text Matching**: ≤100ms per evaluation
- **Excel Import**: ≤30 seconds for 1000 questions
- **Database**: Optimized for >10,000 questions

### Quality Standards
- **Test Coverage**: ≥80% for business logic
- **Integration Tests**: All API endpoints covered
- **Performance Tests**: Bulk operations validated
- **Security Events**: Comprehensive logging with correlation IDs

## 🔧 Configuration

### Environment Variables (Production)
```bash
JWT_SECRET_KEY=<secure-jwt-signing-key>
DATABASE_CONNECTION_STRING=<production-database>
SMTP_HOST=<email-service-host>
SMTP_PORT=<email-service-port>
SMTP_USERNAME=<email-username>
SMTP_PASSWORD=<email-password>
```

### appsettings.json Structure
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=Data/techprep.db"
  },
  "JwtSettings": {
    "Key": "your-secret-key",
    "Issuer": "TechPrep",
    "ExpiryInMinutes": 15,
    "RefreshTokenExpiryInDays": 7
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587
  },
  "ImportSettings": {
    "MaxFileSizeInMB": 10,
    "AllowedFileTypes": [".xlsx", ".xls"],
    "MaxQuestionsPerImport": 1000
  }
}
```

## 🚀 Deployment

### Production Deployment
1. **Backend**: Deploy .NET 8 application to cloud provider
2. **Frontend**: Build React app and deploy to CDN/static hosting
3. **Database**: Migrate to PostgreSQL for production
4. **Environment**: Configure production environment variables

### Docker Support (Future)
```dockerfile
# Dockerfile example for backend
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "TechPrep.API.dll"]
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: xUnit + Moq + FluentAssertions
- **Integration Tests**: Microsoft.AspNetCore.Mvc.Testing
- **Performance Tests**: Text matching algorithm edge cases
- **Database Tests**: Entity Framework InMemory provider

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Isolated component testing
- **E2E Tests**: Cypress for user journeys
- **TypeScript**: Strict type checking

## 📝 API Documentation

### Practice Module API
- `GET /api/practice/questions` - Browse questions with filters
- `GET /api/practice/questions/{id}` - Get question details
- `POST /api/practice/questions/{id}/attempt` - Submit practice attempt
- `GET /api/practice/progress` - Get practice progress summary
- `GET /api/practice/bookmarks` - Get bookmarked questions

### Resources API
- `GET /api/resources` - Browse learning resources
- `GET /api/resources/{id}` - Get resource details
- `GET /api/resources/recommendations` - Personalized recommendations
- `POST /api/resources/{id}/access` - Log resource access

### Interview API
- `GET /api/practice` - Get available practice interviews
- `POST /api/practice/start` - Start practice session
- `POST /api/practice/{sessionId}/answer` - Submit answer
- `POST /api/practice/{sessionId}/submit` - Complete session

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and patterns
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **C#**: Follow .NET coding conventions
- **TypeScript**: Strict type checking enabled
- **CSS**: Tailwind CSS utility-first approach
- **Testing**: Maintain >80% code coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

TechPrep is developed by a dedicated team focused on creating the best technical interview preparation platform.

---

**TechPrep** - Empowering developers to succeed in technical interviews through intelligent practice and comprehensive learning resources.
