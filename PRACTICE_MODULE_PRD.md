# Practice Module - Product Requirements Document

## 📋 Overview

The Practice Module is designed to provide a **stress-free learning environment** where developers can study technical concepts, practice coding questions, and improve their skills at their own pace with immediate feedback and educational support.

## 🎯 Product Vision

**"Create an intuitive, educational practice environment that helps developers learn and master technical concepts through interactive questions with immediate feedback, detailed explanations, and personalized learning paths."**

## 🎭 User Personas

### Primary: **Learning Developer (Sarah)**
- **Goal**: Improve technical skills for career growth
- **Pain Points**: Needs immediate feedback to understand mistakes
- **Behavior**: Studies during lunch breaks, weekends, prefers self-paced learning

### Secondary: **Interview Prep Student (Mike)**
- **Goal**: Practice specific topics before taking formal interviews
- **Pain Points**: Wants to study weak areas without time pressure
- **Behavior**: Studies systematically, needs progress tracking

## 🚀 User Stories & Acceptance Criteria

### Epic 1: Question Browsing & Selection

#### Story 1.1: Browse Question Bank
**As a developer, I want to browse all available questions so I can choose what to study.**

**Acceptance Criteria:**
- [ ] Display questions in card/list format with pagination
- [ ] Show question preview (first 100 characters)
- [ ] Display topic, difficulty level, and question type badges
- [ ] Include estimated time to complete
- [ ] Show if question has been attempted before
- [ ] Support 12+ questions per page with infinite scroll option

#### Story 1.2: Filter Questions
**As a developer, I want to filter questions by topic and difficulty so I can focus on specific areas.**

**Acceptance Criteria:**
- [ ] Multi-select topic filter (React, JavaScript, Python, etc.)
- [ ] Difficulty filter (Basic, Intermediate, Advanced)
- [ ] Question type filter (Single Choice, Multiple Choice, Written)
- [ ] Combination filters work together (AND logic)
- [ ] Clear all filters option
- [ ] Filter state persists during session
- [ ] Show count of questions matching current filters

#### Story 1.3: Search Questions
**As a developer, I want to search questions by keywords so I can find specific concepts.**

**Acceptance Criteria:**
- [ ] Real-time search with debouncing (300ms)
- [ ] Search in question text, topic names, and tags
- [ ] Highlight search terms in results
- [ ] Search history (last 5 searches)
- [ ] No results state with suggestions
- [ ] Clear search functionality

### Epic 2: Practice Session Management

#### Story 2.1: Start Individual Question Practice
**As a developer, I want to practice individual questions so I can focus on specific concepts.**

**Acceptance Criteria:**
- [ ] Click any question to start practicing
- [ ] Display question with clear formatting
- [ ] Show question metadata (topic, difficulty, type)
- [ ] Provide answer input interface appropriate to question type
- [ ] Include "Hint" button (optional, toggleable)
- [ ] Show progress indicator if part of a series

#### Story 2.2: Immediate Feedback System
**As a developer, I want immediate feedback after answering so I can learn from my mistakes.**

**Acceptance Criteria:**
- [ ] Show correct/incorrect status immediately after submission
- [ ] Display correct answer(s) with explanations
- [ ] Highlight why the answer is correct/incorrect
- [ ] Show additional learning resources (links, references)
- [ ] Provide "Try Again" option for incorrect answers
- [ ] Track attempt history for the question

#### Story 2.3: Topic-Based Practice Sessions
**As a developer, I want to practice all questions from a specific topic so I can master that area.**

**Acceptance Criteria:**
- [ ] Select topic to start focused practice session
- [ ] Show session progress (Question X of Y)
- [ ] Allow skipping questions without penalty
- [ ] Provide session summary at the end
- [ ] Option to review incorrect answers
- [ ] Save session progress for resuming later

### Epic 3: Learning Enhancement Features

#### Story 3.1: Detailed Explanations
**As a developer, I want detailed explanations for answers so I can understand the concepts.**

**Acceptance Criteria:**
- [ ] Rich text explanations with code examples
- [ ] Markdown support for formatting
- [ ] Syntax highlighting for code blocks
- [ ] Related concept links
- [ ] External resource links (documentation, tutorials)
- [ ] Explanation rating system (helpful/not helpful)

#### Story 3.2: Hint System
**As a developer, I want optional hints so I can get guidance without seeing the full answer.**

**Acceptance Criteria:**
- [ ] Progressive hint system (Hint 1, Hint 2, etc.)
- [ ] Hints available before answering
- [ ] Track hint usage in practice statistics
- [ ] Option to disable hints for challenge mode
- [ ] Hints tailored to question difficulty level

#### Story 3.3: Bookmarking & Favorites
**As a developer, I want to bookmark questions so I can easily return to important ones.**

**Acceptance Criteria:**
- [ ] Bookmark toggle on each question
- [ ] Dedicated "My Bookmarks" section
- [ ] Organize bookmarks by topic
- [ ] Add personal notes to bookmarked questions
- [ ] Share bookmarked questions (optional)
- [ ] Export bookmarks list

### Epic 4: Progress Tracking & Analytics

#### Story 4.1: Personal Progress Dashboard
**As a developer, I want to see my learning progress so I can track improvement.**

**Acceptance Criteria:**
- [ ] Overall completion percentage by topic
- [ ] Questions attempted vs. total available
- [ ] Accuracy rate over time (graph)
- [ ] Streak counter (consecutive days practiced)
- [ ] Time spent studying (daily/weekly/monthly)
- [ ] Recent activity feed

#### Story 4.2: Performance Analytics
**As a developer, I want detailed analytics so I can identify areas for improvement.**

**Acceptance Criteria:**
- [ ] Accuracy by topic breakdown
- [ ] Difficulty level performance comparison
- [ ] Time spent per question type analysis
- [ ] Improvement trends over time
- [ ] Weak areas identification
- [ ] Suggested focus areas based on performance

#### Story 4.3: Achievement System
**As a developer, I want achievements so I feel motivated to continue learning.**

**Acceptance Criteria:**
- [ ] Topic mastery badges (90%+ accuracy in topic)
- [ ] Streak achievements (7, 30, 100 days)
- [ ] Question milestone badges (50, 100, 500 questions)
- [ ] Speed achievements (fast correct answers)
- [ ] Exploration badges (tried all question types)
- [ ] Achievement showcase on profile

### Epic 5: Learning Resources Integration

#### Story 5.1: Browse Learning Resources
**As a developer, I want to access curated learning resources so I can deepen my understanding of topics.**

**Acceptance Criteria:**
- [ ] Dedicated `/resources` page for students (separate from admin `/admin/resources`)
- [ ] Display resources filtered by topic, difficulty, and type
- [ ] Resource cards show title, author, duration, rating, and description
- [ ] Support for multiple resource types (articles, videos, tutorials, documentation)
- [ ] Direct links to external resources with proper attribution
- [ ] Resource recommendations based on practice performance

#### Story 5.2: Question-Linked Resources
**As a developer, I want to see related learning resources for questions so I can learn more about the topic.**

**Acceptance Criteria:**
- [ ] Show "Learn More" section after answering questions
- [ ] Display 2-3 most relevant resources per question
- [ ] Resources prioritized by difficulty level and user performance
- [ ] Quick preview of resource content without leaving practice
- [ ] Track which resources user has accessed
- [ ] Option to bookmark resources for later reading

#### Story 5.3: Topic-Based Resource Discovery
**As a developer, I want to explore all resources for a specific topic so I can study comprehensively.**

**Acceptance Criteria:**
- [ ] Topic-specific resource pages (e.g., `/resources/react`)
- [ ] Resources organized by subtopics and difficulty progression
- [ ] Learning path suggestions (beginner → intermediate → advanced)
- [ ] Community ratings and reviews for resources
- [ ] Estimated time to complete learning paths
- [ ] Progress tracking through resource collections

#### Story 5.4: Personalized Resource Recommendations
**As a developer, I want personalized resource suggestions so I can focus on my weak areas.**

**Acceptance Criteria:**
- [ ] "Recommended for You" section based on practice analytics
- [ ] Resources suggested for topics with low accuracy scores
- [ ] Adaptive recommendations based on learning style preferences
- [ ] Recently accessed resources history
- [ ] Integration with practice progress to suggest next steps
- [ ] Option to hide or mark resources as "not helpful"

### Epic 6: User Experience & Accessibility

#### Story 6.1: Responsive Design
**As a developer, I want to practice on any device so I can learn anywhere.**

**Acceptance Criteria:**
- [ ] Fully responsive design (mobile, tablet, desktop)
- [ ] Touch-friendly interface for mobile
- [ ] Optimized layouts for different screen sizes
- [ ] Fast loading times on mobile networks
- [ ] Offline capability for previously viewed questions

#### Story 6.2: Accessibility Features
**As a developer with accessibility needs, I want an inclusive interface so I can practice effectively.**

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode option
- [ ] Font size adjustment
- [ ] Focus indicators on all interactive elements

## 🎨 User Interface Specifications

### Main Practice Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Practice Mode                                    [Profile]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Welcome Back, [User] ──────────────────────────────────┐ │
│ │ 🔥 3 day streak | 📊 85% avg accuracy | ⏱️ 2h this week │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Quick Start                                                 │
│ ┌─[Continue JavaScript]─┐ ┌─[Start React Practice]─┐      │
│ │ 15 questions left      │ │ 25 new questions        │      │
│ │ 🟢 Easy-Intermediate   │ │ 🟡 All Levels          │      │
│ └───────────────────────┘ └────────────────────────┘      │
│                                                             │
│ Browse Questions                    🔍 [Search...........] │
│ Filters: [Topics ▼] [Difficulty ▼] [Type ▼]  [Clear All] │
│                                                             │
│ ┌── Question Cards ──────────────────────────────────────┐ │
│ │ [Question Card 1] [Question Card 2] [Question Card 3] │ │
│ │ [Question Card 4] [Question Card 5] [Question Card 6] │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ [Load More Questions]                    [My Bookmarks >]  │
└─────────────────────────────────────────────────────────────┘
```

### Question Practice Interface
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Practice              Topic: React | Intermediate │
├─────────────────────────────────────────────────────────────┤
│ Question 1 of 15                              ⭐ Bookmark   │
│                                                             │
│ What is the purpose of useEffect in React?                 │
│                                                             │
│ ○ To manage component state                                 │
│ ○ To handle side effects in functional components          │
│ ○ To create reusable components                            │
│ ○ To optimize component rendering                          │
│                                                             │
│ [💡 Show Hint]                                              │
│                                                             │
│ [Submit Answer]              [Skip]          [Next Topic]  │
└─────────────────────────────────────────────────────────────┘
```

### Feedback Interface (After Answering)
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Correct! Well done.                                      │
├─────────────────────────────────────────────────────────────┤
│ 💡 Explanation                                              │
│ useEffect is used to handle side effects in functional     │
│ components, such as API calls, subscriptions, or manual    │
│ DOM manipulations. It replaces lifecycle methods like      │
│ componentDidMount and componentDidUpdate.                   │
│                                                             │
│ 📚 Learn More                                               │
│ • [React Hooks Documentation] ⭐ • [useEffect Best Practices] ⭐ │
│ • [React Official Tutorial]                                 │
│                                                             │
│ [Continue]  [Try Similar Question]  [View All React Resources] │
└─────────────────────────────────────────────────────────────┘
```

### Student Resources Page Interface
```
┌─────────────────────────────────────────────────────────────┐
│ Learning Resources                              [Profile]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Recommended for You ──────────────────────────────────┐ │
│ │ Based on your practice in React and JavaScript        │ │
│ │ [React Hooks Guide] [JS Promises] [Component Patterns] │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ Browse Resources            🔍 [Search resources........] │
│ Filters: [Topics ▼] [Type ▼] [Difficulty ▼]  [Clear All] │
│                                                             │
│ ┌── Learning Paths ──────────────────────────────────────┐ │
│ │ 🚀 React Fundamentals (4.5 hrs) ──────────── 65% ■■■□ │ │
│ │ 📚 JavaScript Advanced (6.2 hrs) ──────────── 0%  □□□□ │ │
│ │ 🏗️ System Design Basics (8.1 hrs) ─────────── 20% ■□□□ │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌── Resource Library ───────────────────────────────────┐ │
│ │ [Resource Card 1] [Resource Card 2] [Resource Card 3] │ │
│ │ [Resource Card 4] [Resource Card 5] [Resource Card 6] │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ [My Bookmarks]  [Recently Viewed]  [Load More Resources]  │
└─────────────────────────────────────────────────────────────┘
```

### Resource Detail View
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Resources                     React | Intermediate │
├─────────────────────────────────────────────────────────────┤
│ 📖 React Hooks Complete Guide                    ⭐ Bookmark │
│ by Dan Abramov • 45 min read • 4.8★ (234 ratings)          │
│                                                             │
│ 📊 Your Progress: 60% completed                            │
│ ⏱️ Time spent: 18 minutes                                   │
│                                                             │
│ 📝 Description                                              │
│ Comprehensive guide covering all React hooks with          │
│ practical examples and best practices...                   │
│                                                             │
│ 🎯 Learning Objectives                                      │
│ • Understanding useState and useEffect                     │
│ • Custom hooks creation and usage                          │
│ • Performance optimization techniques                       │
│                                                             │
│ [📖 Read Article]  [▶️ Start Learning Path]  [⚡ Quick Preview] │
│                                                             │
│ 💬 Community Reviews                                        │
│ ★★★★★ "Excellent explanation..." - Sarah K.                 │
│ ★★★★☆ "Good examples, needs more..." - Mike J.              │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technical Requirements

### Frontend Architecture
- **Framework**: React 18 + TypeScript
- **State Management**: Zustand for global state
- **Data Fetching**: React Query for caching and synchronization
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React for consistent iconography

### API Endpoints Required

#### Question Management
```
GET /api/practice/questions
  - Query params: topic, difficulty, type, search, page, limit
  - Response: Paginated list of questions

GET /api/practice/questions/:id
  - Response: Full question details with explanations

POST /api/practice/questions/:id/attempt
  - Body: { answer, timeSpent, hintsUsed }
  - Response: Immediate feedback with explanation
```

#### Progress Tracking
```
GET /api/practice/progress
  - Response: User's overall progress statistics

GET /api/practice/progress/:topicId
  - Response: Topic-specific progress details

POST /api/practice/bookmark/:questionId
  - Toggle bookmark status

GET /api/practice/bookmarks
  - Response: User's bookmarked questions
```

#### Analytics
```
GET /api/practice/analytics
  - Response: Detailed performance analytics

GET /api/practice/achievements
  - Response: User's earned achievements
```

#### Learning Resources (Student Interface)
```
GET /api/resources
  - Query params: topic, difficulty, type, search, page, limit
  - Response: Paginated list of learning resources for students

GET /api/resources/:id
  - Response: Full resource details with user interaction data

GET /api/resources/topic/:topicId
  - Query params: difficulty, type, includeProgress
  - Response: Resources specific to a topic with learning path

GET /api/resources/recommendations
  - Response: Personalized resource recommendations based on practice performance

POST /api/resources/:id/access
  - Body: { timeSpent, completed, rating }
  - Response: Track resource access and engagement

GET /api/resources/question/:questionId
  - Response: Related resources for a specific question

POST /api/resources/:id/bookmark
  - Toggle bookmark status for a resource

GET /api/resources/bookmarked
  - Response: User's bookmarked resources
```

### Database Schema Analysis & Extensions

#### Current Database Model
**Existing Tables (Relevant to Practice Module):**
- `Topics` - Question categories
- `Questions` - Question bank with practice/interview flags
- `QuestionOptions` - Multiple choice options
- `QuestionKeywords` - Keywords for search functionality
- `LearningResources` - Educational materials
- `QuestionResource` - Links questions to learning resources
- `Users` (AspNetUsers) - User management with Identity
- `PracticeSessionNew` - Existing practice sessions (basic)
- `PracticeAnswer` - Existing practice answers

#### New Tables Required for Practice Module

#### 1. PracticeAttempts (Individual Question Attempts)
```sql
CREATE TABLE PracticeAttempts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    QuestionId UNIQUEIDENTIFIER NOT NULL,
    AttemptNumber INT NOT NULL DEFAULT 1,

    -- Answer Data
    GivenText NVARCHAR(MAX) NULL,                    -- For written questions
    SelectedOptionIds NVARCHAR(1000) NULL,           -- JSON array for choice questions
    IsCorrect BIT NOT NULL,
    ScorePercentage DECIMAL(5,2) NULL,               -- For partial credit on written

    -- Learning Metrics
    TimeSpentMs INT NOT NULL,
    HintsUsed INT NOT NULL DEFAULT 0,
    HintTextsViewed NVARCHAR(MAX) NULL,              -- JSON array of hint IDs used

    -- Context
    SessionContext NVARCHAR(50) NULL,                -- 'individual', 'topic_practice', 'random'
    ParentSessionId UNIQUEIDENTIFIER NULL,           -- If part of a practice session

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IX_PracticeAttempts_UserId ON PracticeAttempts(UserId);
CREATE INDEX IX_PracticeAttempts_QuestionId ON PracticeAttempts(QuestionId);
CREATE INDEX IX_PracticeAttempts_UserQuestion ON PracticeAttempts(UserId, QuestionId);
CREATE INDEX IX_PracticeAttempts_CreatedAt ON PracticeAttempts(CreatedAt DESC);
```

#### 2. PracticeBookmarks (Saved Questions)
```sql
CREATE TABLE PracticeBookmarks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    QuestionId UNIQUEIDENTIFIER NOT NULL,

    -- User Notes
    PersonalNotes NVARCHAR(2000) NULL,
    Tags NVARCHAR(500) NULL,                         -- User-defined tags (JSON array)

    -- Metadata
    BookmarkedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastAccessedAt DATETIME2 NULL,
    AccessCount INT NOT NULL DEFAULT 0,

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE
);

-- Ensure one bookmark per user-question pair
CREATE UNIQUE INDEX IX_PracticeBookmarks_UserQuestion ON PracticeBookmarks(UserId, QuestionId);
CREATE INDEX IX_PracticeBookmarks_UserId ON PracticeBookmarks(UserId);
```

#### 3. PracticeAchievements (Gamification)
```sql
CREATE TABLE PracticeAchievements (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,

    -- Achievement Details
    AchievementType NVARCHAR(100) NOT NULL,          -- 'topic_mastery', 'streak', 'milestone', etc.
    AchievementKey NVARCHAR(200) NOT NULL,           -- Unique identifier like 'react_mastery_90'
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    IconUrl NVARCHAR(500) NULL,

    -- Achievement Data
    MetadataJson NVARCHAR(MAX) NULL,                 -- JSON: progress, requirements, etc.
    ProgressCurrent INT NULL,                        -- Current progress (e.g., 85 out of 100)
    ProgressRequired INT NULL,                       -- Required to complete

    -- Status
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME2 NULL,
    EarnedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

CREATE INDEX IX_PracticeAchievements_UserId ON PracticeAchievements(UserId);
CREATE INDEX IX_PracticeAchievements_Type ON PracticeAchievements(AchievementType);
CREATE UNIQUE INDEX IX_PracticeAchievements_UserKey ON PracticeAchievements(UserId, AchievementKey);
```

#### 4. PracticeProgressSnapshots (Analytics)
```sql
CREATE TABLE PracticeProgressSnapshots (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,

    -- Snapshot Data
    SnapshotDate DATE NOT NULL,                      -- Daily snapshots
    TopicId INT NULL,                                -- NULL for overall progress

    -- Metrics
    QuestionsAttempted INT NOT NULL DEFAULT 0,
    QuestionsCorrect INT NOT NULL DEFAULT 0,
    AccuracyPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    TotalTimeSpentSec INT NOT NULL DEFAULT 0,
    StreakDays INT NOT NULL DEFAULT 0,

    -- Difficulty Breakdown (JSON)
    BasicStats NVARCHAR(500) NULL,                   -- {"attempted": 10, "correct": 8, "accuracy": 80}
    IntermediateStats NVARCHAR(500) NULL,
    AdvancedStats NVARCHAR(500) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (TopicId) REFERENCES Topics(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_PracticeProgress_UserDateTopic ON PracticeProgressSnapshots(UserId, SnapshotDate, TopicId);
CREATE INDEX IX_PracticeProgress_UserId ON PracticeProgressSnapshots(UserId);
CREATE INDEX IX_PracticeProgress_Date ON PracticeProgressSnapshots(SnapshotDate DESC);
```

#### 5. PracticeUserPreferences (Settings)
```sql
CREATE TABLE PracticeUserPreferences (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,

    -- Display Preferences
    ShowHintsEnabled BIT NOT NULL DEFAULT 1,
    ShowExplanationsEnabled BIT NOT NULL DEFAULT 1,
    AutoAdvanceEnabled BIT NOT NULL DEFAULT 0,
    ThemePreference NVARCHAR(20) NOT NULL DEFAULT 'light',

    -- Learning Preferences
    DefaultDifficultyFilter NVARCHAR(50) NULL,       -- JSON array of preferred difficulties
    FavoriteTopics NVARCHAR(500) NULL,               -- JSON array of topic IDs
    DailyGoalQuestions INT NOT NULL DEFAULT 10,
    NotificationsEnabled BIT NOT NULL DEFAULT 1,

    -- Session Preferences
    PreferredSessionLength INT NOT NULL DEFAULT 30,  -- minutes
    BreakReminders BIT NOT NULL DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_PracticePreferences_UserId ON PracticeUserPreferences(UserId);
```

#### 6. PracticeHints (Enhanced Hint System)
```sql
CREATE TABLE PracticeHints (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    QuestionId UNIQUEIDENTIFIER NOT NULL,

    -- Hint Details
    HintLevel INT NOT NULL,                          -- 1, 2, 3 (progressive hints)
    HintText NVARCHAR(1000) NOT NULL,
    HintType NVARCHAR(50) NOT NULL,                  -- 'concept', 'approach', 'partial_answer'

    -- Metadata
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(450) NULL,                    -- Admin who created the hint

    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE
);

CREATE INDEX IX_PracticeHints_QuestionId ON PracticeHints(QuestionId);
CREATE INDEX IX_PracticeHints_Level ON PracticeHints(QuestionId, HintLevel);
```

#### 7. ResourceAccess (Track Resource Usage)
```sql
CREATE TABLE ResourceAccess (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    ResourceId UNIQUEIDENTIFIER NOT NULL,

    -- Access Tracking
    FirstAccessedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastAccessedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    TotalAccessCount INT NOT NULL DEFAULT 1,
    TotalTimeSpentSec INT NOT NULL DEFAULT 0,

    -- Engagement Metrics
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME2 NULL,
    UserRating DECIMAL(3,2) NULL,                    -- 1.00 to 5.00
    IsBookmarked BIT NOT NULL DEFAULT 0,
    BookmarkedAt DATETIME2 NULL,

    -- Context
    AccessSource NVARCHAR(100) NULL,                 -- 'practice_question', 'topic_browse', 'recommendation'
    RelatedQuestionId UNIQUEIDENTIFIER NULL,         -- If accessed from a specific question

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (ResourceId) REFERENCES LearningResources(Id) ON DELETE CASCADE,
    FOREIGN KEY (RelatedQuestionId) REFERENCES Questions(Id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IX_ResourceAccess_UserResource ON ResourceAccess(UserId, ResourceId);
CREATE INDEX IX_ResourceAccess_UserId ON ResourceAccess(UserId);
CREATE INDEX IX_ResourceAccess_ResourceId ON ResourceAccess(ResourceId);
CREATE INDEX IX_ResourceAccess_Bookmarked ON ResourceAccess(UserId) WHERE IsBookmarked = 1;
```

#### 8. ResourceCollections (Learning Paths)
```sql
CREATE TABLE ResourceCollections (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    TopicId INT NOT NULL,

    -- Collection Metadata
    DifficultyLevel NVARCHAR(50) NOT NULL,           -- 'beginner', 'intermediate', 'advanced'
    EstimatedHours DECIMAL(4,1) NULL,                -- Total estimated study time
    IsPublished BIT NOT NULL DEFAULT 0,
    IsSystemGenerated BIT NOT NULL DEFAULT 1,        -- vs. user-created
    DisplayOrder INT NOT NULL DEFAULT 0,

    -- Content
    ResourceIdsJson NVARCHAR(MAX) NOT NULL,          -- Ordered array of resource IDs
    PrerequisitesJson NVARCHAR(500) NULL,            -- Array of required collections/topics

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(450) NULL,

    FOREIGN KEY (TopicId) REFERENCES Topics(Id) ON DELETE CASCADE,
    FOREIGN KEY (CreatedBy) REFERENCES AspNetUsers(Id) ON DELETE SET NULL
);

CREATE INDEX IX_ResourceCollections_TopicId ON ResourceCollections(TopicId);
CREATE INDEX IX_ResourceCollections_Published ON ResourceCollections(IsPublished) WHERE IsPublished = 1;
```

#### 9. UserLearningPaths (Track Progress Through Collections)
```sql
CREATE TABLE UserLearningPaths (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    CollectionId UNIQUEIDENTIFIER NOT NULL,

    -- Progress Tracking
    StartedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastAccessedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CompletedResourceIds NVARCHAR(MAX) NOT NULL DEFAULT '[]',    -- JSON array
    CurrentResourceIndex INT NOT NULL DEFAULT 0,
    ProgressPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,

    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'in_progress',         -- 'in_progress', 'completed', 'paused'
    CompletedAt DATETIME2 NULL,
    TotalTimeSpentSec INT NOT NULL DEFAULT 0,

    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (CollectionId) REFERENCES ResourceCollections(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_UserLearningPaths_UserCollection ON UserLearningPaths(UserId, CollectionId);
CREATE INDEX IX_UserLearningPaths_UserId ON UserLearningPaths(UserId);
CREATE INDEX IX_UserLearningPaths_Status ON UserLearningPaths(Status);
```

#### Database Schema Enhancements to Existing Tables

#### Enhanced Questions Table (Add if not present)
```sql
-- Add fields to Questions table if not already present
ALTER TABLE Questions ADD
    ExplanationText NVARCHAR(MAX) NULL,              -- Detailed explanation for practice mode
    HintSummary NVARCHAR(500) NULL,                  -- Quick hint before detailed hints
    DifficultyExplanation NVARCHAR(500) NULL,        -- Why this question is rated at this level
    LearningObjectives NVARCHAR(1000) NULL,          -- What student should learn (JSON array)
    TagsJson NVARCHAR(500) NULL;                     -- Additional tags for filtering (JSON array)
```

#### Enhanced User Table (Practice-specific fields)
```sql
-- Add practice-related fields to Users table
ALTER TABLE AspNetUsers ADD
    PracticeStreakDays INT NOT NULL DEFAULT 0,
    PracticeTotalQuestions INT NOT NULL DEFAULT 0,
    PracticeCorrectAnswers INT NOT NULL DEFAULT 0,
    LastPracticeDate DATE NULL,
    PracticeRank NVARCHAR(50) NOT NULL DEFAULT 'Beginner';  -- Beginner, Intermediate, Advanced, Expert
```

## 🚦 Implementation Phases

### Phase 1: Core Practice (MVP) - Week 1-2
- [ ] Basic question browsing and filtering
- [ ] Individual question practice with immediate feedback
- [ ] Simple progress tracking
- [ ] Basic responsive design
- [ ] Student Resources page basic layout
- [ ] Resource browsing and filtering

### Phase 2: Enhanced Learning - Week 3-4
- [ ] Hint system implementation
- [ ] Detailed explanations with rich formatting
- [ ] Bookmarking functionality (questions and resources)
- [ ] Topic-based practice sessions
- [ ] Question-linked resources integration
- [ ] Resource access tracking

### Phase 3: Analytics & Gamification - Week 5-6
- [ ] Comprehensive progress dashboard
- [ ] Performance analytics
- [ ] Achievement system
- [ ] User preferences and settings
- [ ] Personalized resource recommendations
- [ ] Learning paths creation and tracking

### Phase 4: Resources Integration & Polish - Week 7-8
- [ ] Learning path progress tracking
- [ ] Resource collections management
- [ ] Advanced search functionality (questions + resources)
- [ ] Resource rating and review system
- [ ] Accessibility improvements
- [ ] Performance optimizations

### Phase 5: Advanced Features - Week 9-10
- [ ] Community features for resources
- [ ] Resource usage analytics
- [ ] Advanced recommendation engine
- [ ] Mobile app optimization
- [ ] User testing and refinements

## 📊 Success Metrics

### Primary KPIs
- **User Engagement**: Average session duration > 15 minutes
- **Learning Effectiveness**: Average accuracy improvement of 20% after 10 practice sessions
- **Retention**: 70% of users return within 7 days
- **Completion**: 60% of started questions are completed

### Secondary KPIs
- **Feature Adoption**: 40% of users use bookmarks within first week
- **Content Coverage**: Users practice from at least 3 different topics
- **Accessibility**: 100% keyboard navigation coverage
- **Performance**: Page load times < 2 seconds on mobile

## 🔒 Security & Privacy Requirements

- All user progress data encrypted at rest
- No sharing of individual performance data without explicit consent
- GDPR compliance for European users
- Option to delete all practice history
- Secure API endpoints with proper authentication
- Rate limiting on practice attempt submissions

## 🌍 Accessibility & Internationalization

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support with proper ARIA labels
- Keyboard navigation for all functionality
- High contrast mode support
- Scalable font sizes

### Future Internationalization
- Text externalization for multi-language support
- RTL language support preparation
- Cultural adaptation for different learning styles
- Time zone handling for progress tracking

## 📝 Acceptance Testing Scenarios

### Scenario 1: First-Time User Journey
1. User lands on `/practice` page
2. Sees welcome interface with quick start options
3. Can filter questions by React + Intermediate
4. Starts practicing a single choice question
5. Submits correct answer and sees immediate feedback
6. Bookmarks the question for later review
7. Views progress dashboard showing first session stats

### Scenario 2: Returning User Journey
1. User returns to practice page
2. Sees personalized welcome with streak information
3. Continues previous JavaScript practice session
4. Uses hint on difficult question
5. Reviews bookmarked questions from last session
6. Checks detailed analytics for improvement areas

### Scenario 3: Mobile Learning Session
1. User opens practice on mobile device
2. Interface adapts to mobile screen perfectly
3. Touch interactions work smoothly
4. Can practice questions during 15-minute break
5. Progress syncs when returning to desktop later

---

**Document Version**: 1.0
**Last Updated**: 2025-09-26
**Next Review**: Before development start
**Owner**: Product Team
**Stakeholders**: Engineering, Design, QA