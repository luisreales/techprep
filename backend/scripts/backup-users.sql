-- Backup user data before database recreation
.output users-backup.sql

-- Backup Users table
.print "-- Users table backup"
.print "DELETE FROM Users;"
SELECT 'INSERT INTO Users (Id, Email, PasswordHash, Role, MatchingThreshold, CreatedAt, UpdatedAt) VALUES ' ||
       '(''' || Id || ''', ''' || Email || ''', ''' || PasswordHash || ''', ''' || Role || ''', ' ||
       MatchingThreshold || ', ''' || CreatedAt || ''', ''' || UpdatedAt || ''');'
FROM Users;

-- Backup any AspNetUsers data if exists
.print ""
.print "-- AspNetUsers table backup (if exists)"
.print "DELETE FROM AspNetUsers WHERE 1=1;"
SELECT 'INSERT INTO AspNetUsers VALUES(' ||
       '''' || COALESCE(Id, '') || ''',' ||
       '''' || COALESCE(UserName, '') || ''',' ||
       '''' || COALESCE(NormalizedUserName, '') || ''',' ||
       '''' || COALESCE(Email, '') || ''',' ||
       '''' || COALESCE(NormalizedEmail, '') || ''',' ||
       COALESCE(EmailConfirmed, 0) || ',' ||
       '''' || COALESCE(PasswordHash, '') || ''',' ||
       '''' || COALESCE(SecurityStamp, '') || ''',' ||
       '''' || COALESCE(ConcurrencyStamp, '') || ''',' ||
       '''' || COALESCE(PhoneNumber, '') || ''',' ||
       COALESCE(PhoneNumberConfirmed, 0) || ',' ||
       COALESCE(TwoFactorEnabled, 0) || ',' ||
       'NULL,' || -- LockoutEnd
       COALESCE(LockoutEnabled, 0) || ',' ||
       COALESCE(AccessFailedCount, 0) ||
       ');'
FROM AspNetUsers
WHERE EXISTS (SELECT name FROM sqlite_master WHERE type='table' AND name='AspNetUsers');

.output stdout