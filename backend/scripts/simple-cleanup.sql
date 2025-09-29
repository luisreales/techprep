-- Simple cleanup and sample data for practice sessions
-- Clear existing practice data
DELETE FROM PracticeSessionTopics;
DELETE FROM PracticeAnswers;
DELETE FROM PracticeSessionsNew;

-- Insert sample practice sessions with correct schema
INSERT INTO PracticeSessionsNew (
    Id, UserId, AssignmentId, Status, StartedAt, SubmittedAt, PausedAt,
    TotalScore, TotalTimeSec, CurrentQuestionIndex, Name,
    TotalItems, CorrectCount, IncorrectCount, FinishedAt
) VALUES
-- Completed JavaScript session
('session-1111-1111-1111-111111111111', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 4, datetime('now', '-1 day'), datetime('now', '-1 day', '+20 minutes'), NULL,
 80, 1200, 5, 'JavaScript Fundamentals Practice', 5, 4, 1, datetime('now', '-1 day', '+20 minutes')),

-- In Progress React session
('session-2222-2222-2222-222222222222', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 2, datetime('now', '-2 hours'), NULL, NULL,
 60, 1800, 3, 'React Components Deep Dive', 10, 2, 1, NULL),

-- Multi-topic Full Stack session (completed)
('session-3333-3333-3333-333333333333', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 4, datetime('now', '-3 hours'), datetime('now', '-2 hours'), NULL,
 75, 2700, 6, 'Full-Stack Development Challenge', 6, 5, 1, datetime('now', '-2 hours'));

-- Insert session topics (demonstrating multi-select)
INSERT INTO PracticeSessionTopics (PracticeSessionId, TopicId, Levels) VALUES
-- JavaScript session (single topic)
('session-1111-1111-1111-111111111111', '1', 'basic,intermediate'),

-- React session (single topic)
('session-2222-2222-2222-222222222222', '2', 'intermediate,advanced'),

-- Full-Stack session (multiple topics - shows multi-select feature)
('session-3333-3333-3333-333333333333', '1', 'intermediate,advanced'),
('session-3333-3333-3333-333333333333', '2', 'intermediate'),
('session-3333-3333-3333-333333333333', '3', 'basic,intermediate');

-- Verification query
SELECT
    ps.Name as SessionName,
    CASE ps.Status
        WHEN 1 THEN 'Not Started'
        WHEN 2 THEN 'In Progress'
        WHEN 4 THEN 'Completed'
        ELSE 'Other'
    END as Status,
    ps.TotalItems,
    ps.CorrectCount,
    ps.IncorrectCount,
    COUNT(pst.TopicId) as TopicCount
FROM PracticeSessionsNew ps
LEFT JOIN PracticeSessionTopics pst ON ps.Id = pst.PracticeSessionId
GROUP BY ps.Id, ps.Name, ps.Status, ps.TotalItems, ps.CorrectCount, ps.IncorrectCount
ORDER BY ps.StartedAt DESC;