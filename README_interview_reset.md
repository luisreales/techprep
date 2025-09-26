# Interview Module Test Data Reset Script

This script (`reset_interview_data.sql`) is designed to reset all interview-related data in the TechPrep database and populate it with fresh test data for development and testing purposes.

## What the script does:

### 1. **Deletes existing data** (in correct order to respect foreign keys):
- Interview Certificates
- Interview Answers
- Interview Sessions
- Session Assignments (related to interviews)
- Interview Templates

### 2. **Creates new test data**:

#### Interview Templates (5 templates):
1. **Frontend React Interview** - React.js focused (Cost: 5 credits)
2. **Backend .NET Developer** - C#/.NET focused (Cost: 10 credits)
3. **Full-Stack JavaScript** - Complete JS ecosystem (Cost: 15 credits)
4. **Python Data Science** - Python/ML focused (Cost: 8 credits)
5. **DevOps & Cloud** - AWS/Docker/K8s focused (Cost: 12 credits)

#### Session Assignments:
- 3 assignments for the test user with different statuses and time windows

#### Interview Sessions (4 sessions):
- **INTERVIEW-SESSION-001**: Active session (React interview)
- **INTERVIEW-SESSION-002**: In Progress session (.NET interview, 5/12 questions answered)
- **INTERVIEW-SESSION-003**: Completed session (Full-Stack, 80% score, certificate issued)
- **INTERVIEW-SESSION-004**: Completed session (React retry, 70% score)

#### Interview Answers (13 answers):
- Mix of single choice, multiple choice, and written answers
- Includes realistic technical responses for written questions
- Shows progression through different sessions

#### Interview Certificate:
- 1 certificate issued for the high-scoring Full-Stack JavaScript session

## How to use:

```bash
# Navigate to the database directory
cd backend/src/TechPrep.API/Data

# Execute the script
sqlite3 techprep.db < /Users/luisreales/techprep/reset_interview_data.sql
```

## Expected Results:

After running the script, you should see:
- Interview Templates Count: 5
- Session Assignments Count: 14 (previous + 3 new)
- Interview Sessions Count: 4
- Interview Answers Count: 13
- Interview Certificates Count: 1

## Test User:
The script uses the existing user ID: `D4A93EE2-7B77-4341-8013-0EC6F6B1DB38`

## Use Cases:
- Testing interview workflow from start to finish
- Testing different interview statuses (Active, InProgress, Finalized)
- Testing certificate generation
- Testing answer matching and scoring
- Resetting development data after testing

## Important Notes:
- This script will **DELETE ALL EXISTING INTERVIEW DATA**
- Make sure to backup important data before running
- The script is designed for development/testing environments
- All timestamps are realistic and relative to the current date