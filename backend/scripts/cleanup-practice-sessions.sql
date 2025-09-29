-- =====================================================
-- Cleanup Practice Sessions and Add Sample Data
-- Preserves user accounts and login data
-- =====================================================

-- 1. CLEAN EXISTING PRACTICE SESSION DATA
-- =====================================================
DELETE FROM PracticeSessionTopics;
DELETE FROM PracticeAnswers;
DELETE FROM PracticeSessionsNew;

-- Reset auto-increment if needed
DELETE FROM sqlite_sequence WHERE name IN ('PracticeSessionsNew', 'PracticeAnswers', 'PracticeSessionTopics');

-- 2. GET A SAMPLE USER ID FOR TESTING
-- =====================================================
-- Check if we have any users, if not create a test user
INSERT OR IGNORE INTO AspNetUsers (
    Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed,
    TwoFactorEnabled, LockoutEnabled, AccessFailedCount
) VALUES (
    'd4a93ee2-7b77-4341-8013-0ec6f6b1db38',
    'test@example.com',
    'TEST@EXAMPLE.COM',
    'test@example.com',
    'TEST@EXAMPLE.COM',
    1,
    'AQAAAAEAACcQAAAAEHashed_Password_Here',
    'security_stamp',
    'concurrency_stamp',
    NULL,
    0,
    0,
    1,
    0
);

-- 3. INSERT SAMPLE PRACTICE SESSIONS
-- =====================================================
INSERT INTO PracticeSessionsNew (
    Id, UserId, AssignmentId, Name, Status, StartedAt, FinishedAt, SubmittedAt,
    TotalItems, CorrectCount, IncorrectCount, TotalScore, CurrentQuestionIndex,
    CreatedAt, UpdatedAt
) VALUES
-- Completed JavaScript session
('session-1111-1111-1111-111111111111', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'JavaScript Fundamentals Practice', 4, datetime('now', '-2 days'), datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'),
 5, 4, 1, 80, 5, datetime('now', '-2 days'), datetime('now', '-2 days', '+20 minutes')),

-- In Progress React session
('session-2222-2222-2222-222222222222', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'React Components Deep Dive', 2, datetime('now', '-1 hour'), NULL, NULL,
 10, 3, 1, 40, 4, datetime('now', '-1 hour'), datetime('now', '-30 minutes')),

-- Multi-topic Full Stack session (completed)
('session-3333-3333-3333-333333333333', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'Full-Stack Development Challenge', 4, datetime('now', '-1 day'), datetime('now', '-1 day', '+45 minutes'), datetime('now', '-1 day', '+45 minutes'),
 8, 6, 2, 75, 8, datetime('now', '-1 day'), datetime('now', '-1 day', '+45 minutes')),

-- Recent Python session (completed)
('session-4444-4444-4444-444444444444', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'Python Algorithms Practice', 4, datetime('now', '-2 hours'), datetime('now', '-1 hour'), datetime('now', '-1 hour'),
 6, 5, 1, 83, 6, datetime('now', '-2 hours'), datetime('now', '-1 hour'));

-- 4. INSERT PRACTICE SESSION TOPICS (Multi-select examples)
-- =====================================================
INSERT INTO PracticeSessionTopics (PracticeSessionId, TopicId, Levels) VALUES
-- JavaScript session (single topic)
('session-1111-1111-1111-111111111111', '1', 'basic,intermediate'),

-- React session (single topic)
('session-2222-2222-2222-222222222222', '2', 'intermediate,advanced'),

-- Full-Stack session (multiple topics - demonstrates multi-select)
('session-3333-3333-3333-333333333333', '1', 'intermediate,advanced'),
('session-3333-3333-3333-333333333333', '2', 'intermediate,advanced'),
('session-3333-3333-3333-333333333333', '3', 'basic,intermediate'),

-- Python session (single topic)
('session-4444-4444-4444-444444444444', '5', 'basic,intermediate,advanced');

-- 5. INSERT SAMPLE PRACTICE ANSWERS
-- =====================================================
-- Get some question IDs to use for answers
INSERT INTO PracticeAnswers (
    Id, SessionId, QuestionId, GivenAnswer, IsCorrect, MatchPercentage,
    TimeSpentMs, AnsweredAt
) VALUES
-- JavaScript session answers (5 questions, 4 correct)
('answer-1111-1111-1111-111111111111', 'session-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 0), 'Correct option selected', 1, NULL, 45000, datetime('now', '-2 days', '+3 minutes')),
('answer-1111-1111-1111-111111111112', 'session-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 1), 'Correct option selected', 1, NULL, 52000, datetime('now', '-2 days', '+7 minutes')),
('answer-1111-1111-1111-111111111113', 'session-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 2), 'Wrong option selected', 0, NULL, 38000, datetime('now', '-2 days', '+10 minutes')),
('answer-1111-1111-1111-111111111114', 'session-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 3), 'Correct option selected', 1, NULL, 41000, datetime('now', '-2 days', '+15 minutes')),
('answer-1111-1111-1111-111111111115', 'session-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 4), 'Correct option selected', 1, NULL, 48000, datetime('now', '-2 days', '+20 minutes')),

-- React session answers (4 questions answered, in progress)
('answer-2222-2222-2222-222222222221', 'session-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 0), 'Correct option selected', 1, NULL, 62000, datetime('now', '-1 hour', '+10 minutes')),
('answer-2222-2222-2222-222222222222', 'session-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 1), 'Correct option selected', 1, NULL, 55000, datetime('now', '-1 hour', '+20 minutes')),
('answer-2222-2222-2222-222222222223', 'session-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 2), 'Wrong option selected', 0, NULL, 71000, datetime('now', '-1 hour', '+28 minutes')),
('answer-2222-2222-2222-222222222224', 'session-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 3), 'Correct option selected', 1, NULL, 58000, datetime('now', '-30 minutes')),

-- Python session answers (6 questions, 5 correct)
('answer-4444-4444-4444-444444444441', 'session-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 0), 'Correct option selected', 1, NULL, 89000, datetime('now', '-2 hours', '+10 minutes')),
('answer-4444-4444-4444-444444444442', 'session-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 1), 'Correct option selected', 1, NULL, 76000, datetime('now', '-2 hours', '+20 minutes')),
('answer-4444-4444-4444-444444444443', 'session-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 2), 'Wrong option selected', 0, NULL, 95000, datetime('now', '-2 hours', '+30 minutes')),
('answer-4444-4444-4444-444444444444', 'session-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 3), 'Correct option selected', 1, NULL, 82000, datetime('now', '-2 hours', '+40 minutes')),
('answer-4444-4444-4444-444444444445', 'session-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 4), 'Correct option selected', 1, NULL, 67000, datetime('now', '-2 hours', '+50 minutes')),
('answer-4444-4444-4444-444444444446', 'session-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 5), 'Correct option selected', 1, NULL, 73000, datetime('now', '-1 hour'));

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

.print "=== PRACTICE SESSION DATA SETUP COMPLETE ==="
.print ""

.print "📊 Sample Practice Sessions Created:"
SELECT
    Name as SessionName,
    CASE Status
        WHEN 1 THEN 'Not Started'
        WHEN 2 THEN 'In Progress'
        WHEN 3 THEN 'Paused'
        WHEN 4 THEN 'Completed'
        WHEN 5 THEN 'Expired'
        WHEN 6 THEN 'Abandoned'
        ELSE 'Unknown'
    END as Status,
    TotalItems,
    CorrectCount,
    IncorrectCount,
    TotalScore,
    datetime(StartedAt) as Started
FROM PracticeSessionsNew
ORDER BY StartedAt DESC;

.print ""
.print "🏷️ Session Topics (Multi-select examples):"
SELECT
    ps.Name as SessionName,
    pst.TopicId,
    t.Name as TopicName,
    pst.Levels
FROM PracticeSessionsNew ps
JOIN PracticeSessionTopics pst ON ps.Id = pst.PracticeSessionId
JOIN Topics t ON CAST(pst.TopicId AS INTEGER) = t.Id
ORDER BY ps.StartedAt DESC, pst.TopicId;

.print ""
.print "✅ Answer Summary:"
SELECT
    ps.Name as SessionName,
    COUNT(pa.Id) as AnswerCount,
    SUM(CASE WHEN pa.IsCorrect = 1 THEN 1 ELSE 0 END) as CorrectAnswers,
    ROUND(AVG(pa.TimeSpentMs)/1000.0, 1) as AvgTimeSeconds
FROM PracticeSessionsNew ps
LEFT JOIN PracticeAnswers pa ON ps.Id = pa.SessionId
GROUP BY ps.Id, ps.Name
ORDER BY ps.StartedAt DESC;

.print ""
.print "🎉 Sample data setup completed successfully!"
.print "✨ You can now test the updated practice session forms and flows."
.print ""
.print "📋 Test scenarios available:"
.print "1. View existing sessions (In Progress & Completed)"
.print "2. Test multi-select topic configuration"
.print "3. Test form validation (mandatory fields)"
.print "4. Review completed sessions with detailed answers"