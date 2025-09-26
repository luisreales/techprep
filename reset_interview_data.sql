-- Reset Interview Module Test Data Script
-- This script deletes all interview-related data and creates new test data

-- ================================================
-- DELETE EXISTING INTERVIEW DATA
-- ================================================

-- Delete in order to respect foreign key constraints
DELETE FROM InterviewCertificates;
DELETE FROM InterviewAnswersNew;
DELETE FROM InterviewSessionsNew;
DELETE FROM SessionAssignments WHERE TemplateId IN (SELECT Id FROM InterviewTemplates);
DELETE FROM InterviewTemplates;

-- ================================================
-- INSERT NEW TEST DATA
-- ================================================

-- Insert Interview Templates
INSERT INTO InterviewTemplates (
    Id, Name, Description, Kind, VisibilityDefault, SelectionCriteriaJson,
    TotalTimeSec, PerQuestionTimeSec, NavigationMode, AllowPause, MaxBacktracks,
    FeedbackMode, ShowHints, ShowSources, ShowGlossary, MaxAttempts, CooldownHours,
    RequireFullscreen, BlockCopyPaste, TrackFocusLoss, ProctoringEnabled,
    CertificationEnabled, InterviewCost, CreatedAt, UpdatedAt
) VALUES
(1, 'Frontend React Interview', 'Comprehensive React.js interview focusing on component lifecycle, hooks, and state management', 2, 3, '{"topics": [1, 2], "difficulty": ["intermediate", "advanced"], "questionCount": 10}', 3600, 240, 2, 0, 2, 2, 0, 0, 0, 3, 24, 0, 0, 1, 0, 1, 5, datetime('now'), datetime('now')),
(2, 'Backend .NET Developer', 'Server-side development interview covering C#, APIs, Entity Framework, and database concepts', 2, 3, '{"topics": [3, 4], "difficulty": ["intermediate", "advanced"], "questionCount": 12}', 4200, 300, 2, 0, 1, 2, 0, 0, 0, 2, 48, 1, 1, 1, 0, 1, 10, datetime('now'), datetime('now')),
(3, 'Full-Stack JavaScript', 'Complete JavaScript ecosystem interview including Node.js, React, and database integration', 2, 3, '{"topics": [1, 2, 5], "difficulty": ["basic", "intermediate", "advanced"], "questionCount": 15}', 5400, 360, 2, 0, 3, 2, 0, 0, 0, 1, 72, 0, 0, 1, 1, 1, 15, datetime('now'), datetime('now')),
(4, 'Python Data Science', 'Data science and machine learning interview using Python, pandas, and scikit-learn', 2, 3, '{"topics": [6, 7], "difficulty": ["intermediate", "advanced"], "questionCount": 8}', 2880, 360, 2, 0, 0, 2, 0, 0, 0, 2, 24, 0, 0, 1, 0, 1, 8, datetime('now'), datetime('now')),
(5, 'DevOps & Cloud', 'Infrastructure and deployment interview covering AWS, Docker, Kubernetes, and CI/CD', 2, 3, '{"topics": [8, 9], "difficulty": ["intermediate", "advanced"], "questionCount": 10}', 3600, 300, 2, 0, 2, 2, 0, 0, 0, 2, 48, 0, 1, 1, 1, 1, 12, datetime('now'), datetime('now'));

-- Session Templates are not needed for interview templates in this schema

-- Insert Session Assignments (simulating assigned interviews to users)
-- Note: Using existing user IDs from the database
INSERT INTO SessionAssignments (
    Id, TemplateId, Visibility, GroupId, UserId, WindowStart, WindowEnd,
    MaxAttempts, CooldownHoursBetweenAttempts, CertificationEnabled, CreatedAt, UpdatedAt
) VALUES
(1001, 1, 1, NULL, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38', datetime('now', '-2 days'), datetime('now', '+7 days'), 3, 24, 1, datetime('now', '-2 days'), datetime('now')),
(1002, 2, 1, NULL, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38', datetime('now', '-1 day'), datetime('now', '+6 days'), 2, 48, 1, datetime('now', '-1 day'), datetime('now')),
(1003, 3, 1, NULL, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38', datetime('now', '-3 days'), datetime('now', '+4 days'), 1, 72, 1, datetime('now', '-3 days'), datetime('now'));

-- Insert Interview Sessions
INSERT INTO InterviewSessionsNew (
    Id, AssignmentId, AttemptNumber, CertificateIssued, ConsumedCreditLedgerId,
    CorrectCount, CurrentQuestionIndex, FinalizedAt, IncorrectCount, ParentSessionId,
    SessionAssignmentId, StartedAt, Status, SubmittedAt, TotalItems, TotalScore,
    TotalTimeSec, UserId
) VALUES
-- Active session for React interview
('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 1001, 1, 0, NULL, 0, 0, NULL, 0, NULL, 1001, '2025-09-26 16:30:00.000000', 'Active', NULL, 10, 0, 0, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38'),

-- In progress session for .NET interview
('B2C3D4E5-F6A7-8901-BCDE-F12345678901', 1002, 1, 0, NULL, 5, 8, NULL, 3, NULL, 1002, '2025-09-26 15:30:00.000000', 'InProgress', NULL, 12, 50, 2400, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38'),

-- Completed session for Full-Stack interview
('C3D4E5F6-A7B8-9012-CDEF-123456789012', 1003, 1, 1, NULL, 12, 15, '2025-09-26 13:30:00.000000', 3, NULL, 1003, '2025-09-26 11:30:00.000000', 'Finalized', '2025-09-26 13:30:00.000000', 15, 80, 4800, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38'),

-- Additional test sessions
('D4E5F6A7-B8C9-0123-DEFA-234567890123', 1001, 2, 0, NULL, 7, 10, '2025-09-25 17:30:00.000000', 3, NULL, 1001, '2025-09-25 15:30:00.000000', 'Finalized', '2025-09-25 17:30:00.000000', 10, 70, 3200, 'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38');

-- Insert Interview Answers (for completed and in-progress sessions)
INSERT INTO InterviewAnswersNew (
    Id, ChosenOptionIdsJson, CreatedAt, GivenText, InterviewSessionId,
    IsCorrect, MatchPercent, AttemptNumber, QuestionId, TimeMs, Type
) VALUES
-- Answers for session 002 (in progress)
('E1F2A3B4-C5D6-7890-ABCD-EF1234567890', '["OPTION-001"]', '2025-09-26 15:40:00.000000', NULL, 'B2C3D4E5-F6A7-8901-BCDE-F12345678901', 1, NULL, 1, '031807B6-C0C7-41AC-929D-21F9CAD69684', 45000, 'single'),
('E2F3A4B5-C6D7-8901-BCDE-F12345678901', '["OPTION-005", "OPTION-007"]', '2025-09-26 15:45:00.000000', NULL, 'B2C3D4E5-F6A7-8901-BCDE-F12345678901', 1, NULL, 1, 'C9486856-450D-4BDA-AE01-4B1EE7B81ED3', 60000, 'multi'),
('E3F4A5B6-C7D8-9012-CDEF-123456789012', NULL, '2025-09-26 15:50:00.000000', 'Entity Framework Core is an ORM that provides a high-level abstraction over database operations, allowing developers to work with databases using .NET objects.', 'B2C3D4E5-F6A7-8901-BCDE-F12345678901', 1, 85, 1, '23A615B6-7947-4480-A40A-FD0DF143F61C', 120000, 'written'),
('E4F5A6B7-C8D9-0123-DEFA-234567890123', '["OPTION-012"]', '2025-09-26 15:55:00.000000', NULL, 'B2C3D4E5-F6A7-8901-BCDE-F12345678901', 0, NULL, 1, '8925E63C-4A13-4BA3-84FE-5D64E21AC937', 30000, 'single'),
('E5F6A7B8-C9DA-1234-EFAB-345678901234', NULL, '2025-09-26 16:00:00.000000', 'Dependency injection helps manage object dependencies and promotes loose coupling between components.', 'B2C3D4E5-F6A7-8901-BCDE-F12345678901', 1, 78, 1, '5C16E9DF-065B-448C-96BD-07C43B78B830', 90000, 'written'),

-- Answers for session 003 (completed)
('F1A2B3C4-D5E6-7890-ABCD-EF1234567890', '["OPTION-020"]', '2025-09-26 11:40:00.000000', NULL, 'C3D4E5F6-A7B8-9012-CDEF-123456789012', 1, NULL, 1, '031807B6-C0C7-41AC-929D-21F9CAD69684', 35000, 'single'),
('F2A3B4C5-D6E7-8901-BCDE-F12345678901', '["OPTION-025", "OPTION-027"]', '2025-09-26 11:45:00.000000', NULL, 'C3D4E5F6-A7B8-9012-CDEF-123456789012', 1, NULL, 1, 'C9486856-450D-4BDA-AE01-4B1EE7B81ED3', 55000, 'multi'),
('F3A4B5C6-D7E8-9012-CDEF-123456789012', NULL, '2025-09-26 11:50:00.000000', 'React hooks allow functional components to use state and lifecycle methods. useState manages local state, useEffect handles side effects.', 'C3D4E5F6-A7B8-9012-CDEF-123456789012', 1, 92, 1, '23A615B6-7947-4480-A40A-FD0DF143F61C', 150000, 'written'),
('F4A5B6C7-D8E9-0123-DEFA-234567890123', '["OPTION-032"]', '2025-09-26 11:55:00.000000', NULL, 'C3D4E5F6-A7B8-9012-CDEF-123456789012', 1, NULL, 1, '8925E63C-4A13-4BA3-84FE-5D64E21AC937', 40000, 'single'),
('F5A6B7C8-D9EA-1234-EFAB-345678901234', NULL, '2025-09-26 12:00:00.000000', 'RESTful APIs follow REST principles using HTTP methods (GET, POST, PUT, DELETE) and status codes for stateless communication.', 'C3D4E5F6-A7B8-9012-CDEF-123456789012', 1, 88, 1, '5C16E9DF-065B-448C-96BD-07C43B78B830', 110000, 'written'),

-- Answers for session 004 (completed)
('A1B2C3D4-E5F6-1234-ABCD-567890123456', '["OPTION-040"]', '2025-09-25 15:40:00.000000', NULL, 'D4E5F6A7-B8C9-0123-DEFA-234567890123', 1, NULL, 2, '031807B6-C0C7-41AC-929D-21F9CAD69684', 25000, 'single'),
('B2C3D4E5-F6A7-2345-BCDE-678901234567', '["OPTION-045"]', '2025-09-25 15:45:00.000000', NULL, 'D4E5F6A7-B8C9-0123-DEFA-234567890123', 0, NULL, 2, 'C9486856-450D-4BDA-AE01-4B1EE7B81ED3', 40000, 'multi'),
('C3D4E5F6-A7B8-3456-CDEF-789012345678', NULL, '2025-09-25 15:50:00.000000', 'JavaScript closures allow inner functions to access outer function variables even after the outer function returns.', 'D4E5F6A7-B8C9-0123-DEFA-234567890123', 1, 75, 2, '23A615B6-7947-4480-A40A-FD0DF143F61C', 80000, 'written');

-- Insert Interview Certificate (for the completed session with high score)
INSERT INTO InterviewCertificates (
    Id, CertificateId, CompletedAt, DurationMinutes, HasIntegrityViolations,
    IntegrityNotes, IntegrityViolationsCount, InterviewSessionId, IsValid,
    IssuedAt, IssuedByUserId, MaxScore, PdfFileName, PdfFilePath, PdfFileSize,
    QrCodeData, RevocationReason, RevokedAt, ScorePercentage, SessionId,
    SessionId1, SkillsAssessedJson, TemplateId, TemplateName, TopicsJson,
    TotalScore, UserId, UserName, VerificationHash, VerificationUrl
) VALUES (
    1,
    'CERT-FULLSTACK-JS-20250926133000',
    '2025-09-26 13:30:00.000000',
    80,
    0,
    NULL,
    0,
    'C3D4E5F6-A7B8-9012-CDEF-123456789012',
    1,
    '2025-09-26 13:30:00.000000',
    'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38',
    100,
    'certificate_fullstack_js_20250926133000.pdf',
    '/certificates/fullstack_js/2025/09/certificate_fullstack_js_20250926133000.pdf',
    245760,
    'https://techprep.com/verify/CERT-FULLSTACK-JS-20250926133000',
    NULL,
    NULL,
    80.0,
    'C3D4E5F6-A7B8-9012-CDEF-123456789012',
    'C3D4E5F6-A7B8-9012-CDEF-123456789012',
    '["JavaScript", "React.js", "Node.js", "REST APIs", "Database Design"]',
    3,
    'Full-Stack JavaScript',
    '["Frontend Development", "Backend Development", "Database Management"]',
    80,
    'D4A93EE2-7B77-4341-8013-0EC6F6B1DB38',
    'Test User',
    'SHA256HASH20250926133000',
    'https://techprep.com/verify/CERT-FULLSTACK-JS-20250926133000'
);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify the data was inserted correctly
SELECT 'Interview Templates Count: ' || COUNT(*) FROM InterviewTemplates;
SELECT 'Session Assignments Count: ' || COUNT(*) FROM SessionAssignments;
SELECT 'Interview Sessions Count: ' || COUNT(*) FROM InterviewSessionsNew;
SELECT 'Interview Answers Count: ' || COUNT(*) FROM InterviewAnswersNew;
SELECT 'Interview Certificates Count: ' || COUNT(*) FROM InterviewCertificates;

-- Show sample data
SELECT 'SAMPLE INTERVIEW SESSIONS:' as info;
SELECT Id, Status, StartedAt, TotalScore, TotalItems FROM InterviewSessionsNew;

SELECT 'SAMPLE INTERVIEW TEMPLATES:' as info;
SELECT Id, Name, InterviewCost, CreatedAt FROM InterviewTemplates;