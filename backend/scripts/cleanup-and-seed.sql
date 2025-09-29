-- =====================================================
-- TechPrep Database Cleanup and Sample Data Script
-- =====================================================

-- 1. DELETE ALL PRACTICE SESSION RELATED DATA
-- =====================================================

-- Delete practice session topics (foreign key dependencies first)
DELETE FROM PracticeSessionTopics;

-- Delete practice answers
DELETE FROM PracticeAnswers;

-- Delete practice sessions
DELETE FROM PracticeSessionsNew;

-- Reset auto-increment counters (if any)
DELETE FROM sqlite_sequence WHERE name IN ('PracticeSessionsNew', 'PracticeAnswers', 'PracticeSessionTopics');

-- 2. INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Sample Practice Sessions for testing
INSERT INTO PracticeSessionsNew (
    Id, UserId, AssignmentId, Name, Status, StartedAt, FinishedAt, SubmittedAt,
    TotalItems, CorrectCount, IncorrectCount, TotalScore, CurrentQuestionIndex,
    CreatedAt, UpdatedAt
) VALUES
-- Completed session example
('11111111-1111-1111-1111-111111111111', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'JavaScript Fundamentals Practice', 4, '2025-09-27 10:00:00', '2025-09-27 10:15:00', '2025-09-27 10:15:00',
 5, 4, 1, 80, 5, '2025-09-27 10:00:00', '2025-09-27 10:15:00'),

-- In Progress session example
('22222222-2222-2222-2222-222222222222', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'React Components Deep Dive', 2, '2025-09-27 11:00:00', NULL, NULL,
 10, 3, 1, 60, 4, '2025-09-27 11:00:00', '2025-09-27 11:10:00'),

-- Multi-topic session example
('33333333-3333-3333-3333-333333333333', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'Full-Stack Development Challenge', 4, '2025-09-26 14:00:00', '2025-09-26 14:30:00', '2025-09-26 14:30:00',
 8, 6, 2, 75, 8, '2025-09-26 14:00:00', '2025-09-26 14:30:00'),

-- Recent completed session
('44444444-4444-4444-4444-444444444444', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'Python Algorithms Practice', 4, '2025-09-28 09:00:00', '2025-09-28 09:25:00', '2025-09-28 09:25:00',
 6, 5, 1, 83, 6, '2025-09-28 09:00:00', '2025-09-28 09:25:00');

-- Sample Practice Session Topics (showing multi-topic support)
INSERT INTO PracticeSessionTopics (PracticeSessionId, TopicId, Levels) VALUES
-- JavaScript Fundamentals (single topic)
('11111111-1111-1111-1111-111111111111', '1', 'basic,intermediate'),

-- React Components (single topic)
('22222222-2222-2222-2222-222222222222', '2', 'intermediate,advanced'),

-- Full-Stack Development (multiple topics)
('33333333-3333-3333-3333-333333333333', '1', 'intermediate,advanced'),
('33333333-3333-3333-3333-333333333333', '2', 'intermediate,advanced'),
('33333333-3333-3333-3333-333333333333', '3', 'intermediate'),

-- Python Algorithms (single topic)
('44444444-4444-4444-4444-444444444444', '5', 'basic,intermediate,advanced');

-- Sample Practice Answers for completed sessions
INSERT INTO PracticeAnswers (
    Id, SessionId, QuestionId, GivenAnswer, IsCorrect, MatchPercentage,
    TimeSpentMs, AnsweredAt
) VALUES
-- Answers for JavaScript Fundamentals session
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 0), 'Option A', 1, NULL, 45000, '2025-09-27 10:03:00'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 1), 'Option B', 1, NULL, 52000, '2025-09-27 10:06:00'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 2), 'Option A', 0, NULL, 38000, '2025-09-27 10:09:00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 3), 'Option C', 1, NULL, 41000, '2025-09-27 10:12:00'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111',
 (SELECT Id FROM Questions WHERE TopicId = 1 LIMIT 1 OFFSET 4), 'Option B', 1, NULL, 48000, '2025-09-27 10:15:00'),

-- Answers for React Components session (in progress)
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 0), 'Option A', 1, NULL, 62000, '2025-09-27 11:02:00'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 1), 'Option C', 1, NULL, 55000, '2025-09-27 11:05:00'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 2), 'Option A', 0, NULL, 71000, '2025-09-27 11:08:00'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '22222222-2222-2222-2222-222222222222',
 (SELECT Id FROM Questions WHERE TopicId = 2 LIMIT 1 OFFSET 3), 'Option B', 1, NULL, 58000, '2025-09-27 11:10:00'),

-- Answers for Python Algorithms session
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '44444444-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 0), 'Option C', 1, NULL, 89000, '2025-09-28 09:05:00'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '44444444-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 1), 'Option A', 1, NULL, 76000, '2025-09-28 09:10:00'),
('llllllll-llll-llll-llll-llllllllllll', '44444444-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 2), 'Option B', 0, NULL, 95000, '2025-09-28 09:15:00'),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', '44444444-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 3), 'Option A', 1, NULL, 82000, '2025-09-28 09:20:00'),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', '44444444-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 4), 'Option C', 1, NULL, 67000, '2025-09-28 09:23:00'),
('oooooooo-oooo-oooo-oooo-oooooooooooo', '44444444-4444-4444-4444-444444444444',
 (SELECT Id FROM Questions WHERE TopicId = 5 LIMIT 1 OFFSET 5), 'Option B', 1, NULL, 73000, '2025-09-28 09:25:00');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check created sessions
SELECT
    Name as SessionName,
    Status,
    TotalItems,
    CorrectCount,
    IncorrectCount,
    TotalScore,
    datetime(StartedAt) as Started,
    datetime(FinishedAt) as Finished
FROM PracticeSessionsNew
ORDER BY StartedAt DESC;

-- Check session topics
SELECT
    ps.Name as SessionName,
    pst.TopicId,
    t.Name as TopicName,
    pst.Levels
FROM PracticeSessionsNew ps
LEFT JOIN PracticeSessionTopics pst ON ps.Id = pst.PracticeSessionId
LEFT JOIN Topics t ON CAST(pst.TopicId AS INTEGER) = t.Id
ORDER BY ps.StartedAt DESC, pst.TopicId;

-- Check answer counts by session
SELECT
    ps.Name as SessionName,
    COUNT(pa.Id) as AnswerCount,
    SUM(CASE WHEN pa.IsCorrect = 1 THEN 1 ELSE 0 END) as CorrectAnswers
FROM PracticeSessionsNew ps
LEFT JOIN PracticeAnswers pa ON ps.Id = pa.SessionId
GROUP BY ps.Id, ps.Name
ORDER BY ps.StartedAt DESC;