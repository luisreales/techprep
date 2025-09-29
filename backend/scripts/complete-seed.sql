-- =====================================================
-- Complete Database Seeding Script
-- This script will create all sample data needed for testing
-- =====================================================

-- 1. Clean any existing practice session data
DELETE FROM PracticeSessionTopics;
DELETE FROM PracticeAnswers;
DELETE FROM PracticeSessionsNew;

-- 2. Insert sample Questions (required for practice sessions)
INSERT OR IGNORE INTO Questions (
    Id, TopicId, Text, Type, Level, OfficialAnswer, ExplanationText, UsableInPractice, CreatedAt, UpdatedAt
) VALUES
-- JavaScript Questions
('11111111-1111-1111-1111-111111111111', 1, 'What is the output of console.log(typeof null)?', 1, 1, 'object', 'In JavaScript, typeof null returns "object" due to a historical bug that has been kept for compatibility.', 1, datetime('now'), datetime('now')),
('11111111-1111-1111-1111-111111111112', 1, 'Which method is used to add an element to the end of an array?', 1, 1, 'push()', 'The push() method adds one or more elements to the end of an array and returns the new length.', 1, datetime('now'), datetime('now')),
('11111111-1111-1111-1111-111111111113', 1, 'What does "hoisting" mean in JavaScript?', 3, 2, 'Variable and function declarations are moved to the top of their scope during compilation.', 'Hoisting is JavaScript''s default behavior of moving declarations to the top of the current scope.', 1, datetime('now'), datetime('now')),
('11111111-1111-1111-1111-111111111114', 1, 'Explain the difference between == and === operators.', 3, 2, '== performs type coercion while === checks for strict equality without type conversion.', '== allows type conversion, while === requires both value and type to be identical.', 1, datetime('now'), datetime('now')),
('11111111-1111-1111-1111-111111111115', 1, 'What is a closure in JavaScript?', 3, 3, 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.', 'Closures allow functions to access variables from their lexical scope even when called outside that scope.', 1, datetime('now'), datetime('now')),

-- React Questions
('22222222-2222-2222-2222-222222222221', 2, 'What is the virtual DOM?', 3, 2, 'A JavaScript representation of the actual DOM kept in memory and synced with the real DOM by libraries like React.', 'Virtual DOM is a programming concept where a virtual representation of UI is kept in memory.', 1, datetime('now'), datetime('now')),
('22222222-2222-2222-2222-222222222222', 2, 'Which hook is used for side effects in functional components?', 1, 2, 'useEffect', 'useEffect hook lets you perform side effects in functional components.', 1, datetime('now'), datetime('now')),
('22222222-2222-2222-2222-222222222223', 2, 'What is the purpose of useState hook?', 3, 1, 'useState allows you to add state to functional components.', 'useState is a hook that lets you add React state to functional components.', 1, datetime('now'), datetime('now')),
('22222222-2222-2222-2222-222222222224', 2, 'Explain React component lifecycle methods.', 3, 3, 'Lifecycle methods are hooks that allow you to run code at particular times in the process.', 'Lifecycle methods let you hook into different phases of a component''s life.', 1, datetime('now'), datetime('now')),

-- Node.js Questions
('33333333-3333-3333-3333-333333333331', 3, 'What is Node.js?', 3, 1, 'Node.js is a JavaScript runtime built on Chrome''s V8 JavaScript engine for server-side development.', 'Node.js allows JavaScript to run on the server side using the V8 engine.', 1, datetime('now'), datetime('now')),
('33333333-3333-3333-3333-333333333332', 3, 'What is npm?', 3, 1, 'npm (Node Package Manager) is the default package manager for Node.js.', 'npm is used to install, share, and manage packages in Node.js projects.', 1, datetime('now'), datetime('now')),

-- Python Questions
('55555555-5555-5555-5555-555555555551', 5, 'What is the difference between list and tuple in Python?', 3, 2, 'Lists are mutable while tuples are immutable. Lists use square brackets, tuples use parentheses.', 'Lists can be modified after creation, tuples cannot be changed.', 1, datetime('now'), datetime('now')),
('55555555-5555-5555-5555-555555555552', 5, 'What is a decorator in Python?', 3, 3, 'A decorator is a function that modifies the behavior of another function without changing its code.', 'Decorators provide a way to modify or extend functions using the @decorator syntax.', 1, datetime('now'), datetime('now')),
('55555555-5555-5555-5555-555555555553', 5, 'Explain list comprehension in Python.', 3, 2, 'List comprehension provides a concise way to create lists using a single line of code.', 'List comprehensions offer a shorter syntax for creating lists based on existing lists.', 1, datetime('now'), datetime('now'));

-- 3. Insert Question Options for multiple choice questions
INSERT OR IGNORE INTO QuestionOptions (
    Id, QuestionId, Text, IsCorrect, OrderIndex, CreatedAt, UpdatedAt
) VALUES
-- Options for "What is the output of console.log(typeof null)?"
('opt-11111111-1111-1111-1111-111111111111-1', '11111111-1111-1111-1111-111111111111', 'string', 0, 1, datetime('now'), datetime('now')),
('opt-11111111-1111-1111-1111-111111111111-2', '11111111-1111-1111-1111-111111111111', 'object', 1, 2, datetime('now'), datetime('now')),
('opt-11111111-1111-1111-1111-111111111111-3', '11111111-1111-1111-1111-111111111111', 'null', 0, 3, datetime('now'), datetime('now')),
('opt-11111111-1111-1111-1111-111111111111-4', '11111111-1111-1111-1111-111111111111', 'undefined', 0, 4, datetime('now'), datetime('now')),

-- Options for "Which method is used to add an element to the end of an array?"
('opt-11111111-1111-1111-1111-111111111112-1', '11111111-1111-1111-1111-111111111112', 'push()', 1, 1, datetime('now'), datetime('now')),
('opt-11111111-1111-1111-1111-111111111112-2', '11111111-1111-1111-1111-111111111112', 'pop()', 0, 2, datetime('now'), datetime('now')),
('opt-11111111-1111-1111-1111-111111111112-3', '11111111-1111-1111-1111-111111111112', 'shift()', 0, 3, datetime('now'), datetime('now')),
('opt-11111111-1111-1111-1111-111111111112-4', '11111111-1111-1111-1111-111111111112', 'unshift()', 0, 4, datetime('now'), datetime('now')),

-- Options for "Which hook is used for side effects in functional components?"
('opt-22222222-2222-2222-2222-222222222222-1', '22222222-2222-2222-2222-222222222222', 'useState', 0, 1, datetime('now'), datetime('now')),
('opt-22222222-2222-2222-2222-222222222222-2', '22222222-2222-2222-2222-222222222222', 'useEffect', 1, 2, datetime('now'), datetime('now')),
('opt-22222222-2222-2222-2222-222222222222-3', '22222222-2222-2222-2222-222222222222', 'useContext', 0, 3, datetime('now'), datetime('now')),
('opt-22222222-2222-2222-2222-222222222222-4', '22222222-2222-2222-2222-222222222222', 'useReducer', 0, 4, datetime('now'), datetime('now'));

-- 4. Sample Practice Sessions for testing
INSERT INTO PracticeSessionsNew (
    Id, UserId, AssignmentId, Name, Status, StartedAt, FinishedAt, SubmittedAt,
    TotalItems, CorrectCount, IncorrectCount, TotalScore, CurrentQuestionIndex,
    CreatedAt, UpdatedAt
) VALUES
-- Completed session example
('session-1111-1111-1111-111111111111', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'JavaScript Fundamentals Practice', 4, '2025-09-27 10:00:00', '2025-09-27 10:15:00', '2025-09-27 10:15:00',
 3, 2, 1, 67, 3, '2025-09-27 10:00:00', '2025-09-27 10:15:00'),

-- In Progress session example
('session-2222-2222-2222-222222222222', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'React Components Deep Dive', 2, '2025-09-28 11:00:00', NULL, NULL,
 4, 1, 0, 25, 1, '2025-09-28 11:00:00', '2025-09-28 11:05:00'),

-- Multi-topic session example
('session-3333-3333-3333-333333333333', 'd4a93ee2-7b77-4341-8013-0ec6f6b1db38', NULL,
 'Full-Stack Development Challenge', 4, '2025-09-26 14:00:00', '2025-09-26 14:30:00', '2025-09-26 14:30:00',
 4, 3, 1, 75, 4, '2025-09-26 14:00:00', '2025-09-26 14:30:00');

-- 5. Sample Practice Session Topics (showing multi-topic support)
INSERT INTO PracticeSessionTopics (PracticeSessionId, TopicId, Levels) VALUES
-- JavaScript Fundamentals (single topic)
('session-1111-1111-1111-111111111111', '1', 'basic,intermediate'),

-- React Components (single topic)
('session-2222-2222-2222-222222222222', '2', 'intermediate'),

-- Full-Stack Development (multiple topics)
('session-3333-3333-3333-333333333333', '1', 'intermediate'),
('session-3333-3333-3333-333333333333', '2', 'intermediate'),
('session-3333-3333-3333-333333333333', '3', 'basic');

-- 6. Sample Practice Answers for completed sessions
INSERT INTO PracticeAnswers (
    Id, SessionId, QuestionId, GivenAnswer, IsCorrect, MatchPercentage,
    TimeSpentMs, AnsweredAt
) VALUES
-- Answers for JavaScript Fundamentals session
('answer-1111-1111-1111-111111111111', 'session-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111', 'opt-11111111-1111-1111-1111-111111111111-2', 1, NULL, 45000, '2025-09-27 10:03:00'),
('answer-1111-1111-1111-111111111112', 'session-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111112', 'opt-11111111-1111-1111-1111-111111111112-2', 0, NULL, 52000, '2025-09-27 10:06:00'),
('answer-1111-1111-1111-111111111113', 'session-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111113', 'Variable and function declarations are moved to the top', 1, 85, 120000, '2025-09-27 10:09:00'),

-- Answers for React session (in progress - only 1 answer)
('answer-2222-2222-2222-222222222221', 'session-2222-2222-2222-222222222222',
 '22222222-2222-2222-2222-222222222222', 'opt-22222222-2222-2222-2222-222222222222-2', 1, NULL, 62000, '2025-09-28 11:02:00'),

-- Answers for Full-Stack session (completed)
('answer-3333-3333-3333-333333333331', 'session-3333-3333-3333-333333333333',
 '11111111-1111-1111-1111-111111111111', 'opt-11111111-1111-1111-1111-111111111111-2', 1, NULL, 40000, '2025-09-26 14:05:00'),
('answer-3333-3333-3333-333333333332', 'session-3333-3333-3333-333333333333',
 '22222222-2222-2222-2222-222222222222', 'opt-22222222-2222-2222-2222-222222222222-2', 1, NULL, 55000, '2025-09-26 14:10:00'),
('answer-3333-3333-3333-333333333333', 'session-3333-3333-3333-333333333333',
 '33333333-3333-3333-3333-333333333331', 'Node.js is a JavaScript runtime for server-side development', 1, 90, 95000, '2025-09-26 14:15:00'),
('answer-3333-3333-3333-333333333334', 'session-3333-3333-3333-333333333333',
 '33333333-3333-3333-3333-333333333332', 'npm is the package manager', 0, 60, 85000, '2025-09-26 14:20:00');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify sample data was created
.print "=== SAMPLE DATA VERIFICATION ==="

.print "\n📊 Topics:"
SELECT id, name FROM Topics ORDER BY id;

.print "\n📋 Sample Questions:"
SELECT t.name as Topic, COUNT(q.Id) as QuestionCount
FROM Topics t
LEFT JOIN Questions q ON t.id = q.TopicId
GROUP BY t.id, t.name
ORDER BY t.id;

.print "\n🎯 Practice Sessions:"
SELECT
    Name as SessionName,
    Status,
    TotalItems,
    CorrectCount,
    IncorrectCount,
    TotalScore,
    datetime(StartedAt) as Started,
    CASE
        WHEN FinishedAt IS NOT NULL THEN datetime(FinishedAt)
        ELSE 'In Progress'
    END as Finished
FROM PracticeSessionsNew
ORDER BY StartedAt DESC;

.print "\n🏷️ Session Topics:"
SELECT
    ps.Name as SessionName,
    pst.TopicId,
    t.Name as TopicName,
    pst.Levels
FROM PracticeSessionsNew ps
LEFT JOIN PracticeSessionTopics pst ON ps.Id = pst.PracticeSessionId
LEFT JOIN Topics t ON CAST(pst.TopicId AS INTEGER) = t.Id
ORDER BY ps.StartedAt DESC, pst.TopicId;

.print "\n✅ Answer Summary:"
SELECT
    ps.Name as SessionName,
    COUNT(pa.Id) as AnswerCount,
    SUM(CASE WHEN pa.IsCorrect = 1 THEN 1 ELSE 0 END) as CorrectAnswers,
    ROUND(AVG(pa.TimeSpentMs)/1000.0, 1) as AvgTimeSeconds
FROM PracticeSessionsNew ps
LEFT JOIN PracticeAnswers pa ON ps.Id = pa.SessionId
GROUP BY ps.Id, ps.Name
ORDER BY ps.StartedAt DESC;

.print "\n🎉 Sample data creation completed!"
.print "You can now test the practice session flows with realistic data."