/* Restored original modules (rewritten and corrected):
   Software engineering, Project management, Database management, Database administration. */
(function (M, L) {

M.push({
  id: 'software-engineering', title: 'Software engineering', cat: 'Engineering', code: '07b · ENGINEERING',
  desc: 'Build reliable software with small changes, code review, pairing, refactoring and automated pipelines.',
  outcome: 'Ship a feature as a series of small, reviewed, tested changes, and improve existing code safely.',
  jobSkills: ['Peer code reviews', 'CI/CD basics', 'Writing maintainable code'],
  sourceUrl: 'https://google.github.io/eng-practices/review/', sourceLabel: 'Google · Engineering practices',
  example: 'A small change to a course model is written with a test, opened as a 60-line pull request, reviewed within a day and merged behind a passing pipeline.',
  exercise: 'Take one feature from your portfolio project and deliver it as three small pull requests, each with a test and a clear description.',
  quiz: 'Why keep pull requests small?',
  quizChoices: ['They are reviewed faster and more carefully, and are easier to undo', 'They make the repository smaller', 'They avoid the need for tests'], answer: 0,
  lessons: [
    L('Small changes, often',
      'Break work into small, independent changes that can each be reviewed, tested and released.',
      'Adding search is split into: a repository query with tests, an API endpoint, then the UI. Each change works on its own.',
String.raw`One pull request = one idea
  1. BookRepository.findByTitle + tests          (~60 lines)
  2. GET /api/books?query= + MockMvc test        (~80 lines)
  3. Search box in the UI                        (~90 lines)
Signs a change is too big
  - more than ~400 lines, or several unrelated files
  - the description needs "and also..."`,
      'Plan a feature from your project as three or more small changes and write one line for each.',
      'What should you do when a pull request grows too large?',
      'Split it into smaller, independent pull requests that can be reviewed and merged one at a time.'),
    L('Code review: giving and receiving',
      'Review for correctness, clarity and risk, and respond to feedback professionally.',
      'A reviewer spots a missing null check and an unclear name. The author thanks them, fixes both and replies with what changed.',
String.raw`Reviewer checklist
- Does it do what the description says? Are there tests?
- Edge cases: empty, null, very large, concurrent?
- Names and structure: would a new teammate understand it?
- Security: input validated, access checked, no secrets?
Comment style
- Ask, don't command: "Could this be null when the list is empty?"
- Mark small points as "nit:" so they are not blockers`,
      'Review a classmate\'s pull request (or an open-source one) using the checklist. Write three comments.',
      'How should you respond to a review comment you disagree with?',
      'Explain your reasoning politely with evidence such as a test or documentation, and agree a decision; do not ignore the comment.'),
    L('Pair programming',
      'Work in pairs with driver and navigator roles to share knowledge and catch mistakes early.',
      'Two students pair on a new lesson feature. The driver types; the navigator thinks ahead, spots a missing test and keeps notes. They swap every 20 minutes.',
String.raw`Driver     types, focuses on the current line
Navigator  reviews, thinks about the next step and edge cases
Swap       every 15–25 minutes (a timer helps)
Tips
- agree the goal before starting
- say what you are thinking out loud
- take breaks; pairing is tiring`,
      'Pair on one challenge from the practice lab, swapping roles with a timer.',
      'Why swap roles regularly when pairing?',
      'Both people stay engaged and both understand the code, instead of one person watching passively.'),
    L('Refactoring safely',
      'Improve the structure of code without changing its behaviour, protected by tests.',
      'A 60-line method that validates, calculates and saves an order is split into three methods. The tests stay green after every small step.',
String.raw`// Before
double total(Order o) {
    double t = 0;
    for (Item i : o.items()) t += i.price() * i.qty();
    if (o.customer().isStudent()) t = t * 0.9;
    return t;
}

// After: extract method, clearer names
double total(Order o) {
    return applyDiscount(o.customer(), subtotal(o.items()));
}
double subtotal(List<Item> items) {
    return items.stream().mapToDouble(i -> i.price() * i.qty()).sum();
}
double applyDiscount(Customer c, double amount) {
    return c.isStudent() ? amount * 0.9 : amount;
}`,
      'Find a long method in your project, write tests for it, then extract two smaller methods.',
      'Why must tests exist before you refactor?',
      'They prove behaviour has not changed. Without them, a refactor can silently introduce bugs.'),
    L('Continuous integration and delivery',
      'Automatically build and test every change, and keep the main branch releasable.',
      'Every pull request runs the build and tests in GitHub Actions. A red pipeline blocks the merge.',
String.raw`# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test`,
      'Add a CI workflow to a project and make a pull request fail on purpose by breaking a test.',
      'What does "keep main releasable" mean in practice?',
      'Every change merged into main has passed the build and tests, so main could be deployed at any time.'),
    L('Technical debt and documentation',
      'Recognise technical debt, record it, and write documentation people will actually read.',
      'A shortcut taken before a deadline is recorded as a ticket with its cost and a plan, instead of being forgotten.',
String.raw`Recording debt (a ticket)
  What:   prices stored as double, rounding errors possible
  Cost:   wrong totals on large orders; harder to add currencies
  Plan:   migrate to long cents; ~1 day; before adding VAT rules

README essentials
  - what it is (one sentence) and a screenshot
  - how to run it and test it (copy-paste commands)
  - how it is structured, and known limitations`,
      'Write a README for one project that a classmate can follow without asking you anything.',
      'Is all technical debt bad?',
      'No. Taking on debt deliberately can be a good trade-off, as long as it is recorded and paid back before it becomes expensive.'),
  ],
});

M.push({
  id: 'project-management', title: 'Project management', cat: 'Career', code: '15b · TEAM',
  desc: 'Plan and run a small project: split tasks, estimate, manage risks, communicate and improve.',
  outcome: 'Run a small project from a task list to a finished, reviewed result with a clear history.',
  jobSkills: ['Task planning and estimation', 'Communication', 'Agile ways of working'],
  sourceUrl: 'https://www.atlassian.com/agile/project-management', sourceLabel: 'Atlassian · Agile project management',
  example: 'A three-person team splits a library app into twelve tasks, estimates them, tracks them on a board, and finishes on time by cutting one "nice to have" feature early.',
  exercise: 'Plan your portfolio project: list the tasks, estimate each, mark the risks, and track progress on a board for two weeks.',
  quiz: 'What is the first step in planning a small project?',
  quizChoices: ['Agree the goal, then list the tasks', 'Start coding the hardest part', 'Assign every task at once'], answer: 0,
  lessons: [
    L('Goals and task splitting',
      'Turn a goal into small, independent tasks, each with a clear "done".',
      'Goal: "members can borrow books". Tasks: loan table, borrow endpoint, return endpoint, overdue check, UI button, tests for each.',
String.raw`Good tasks are
  Small       under a day of work
  Independent can be done in any order where possible
  Testable    "done" can be checked
Template
  Task: Add POST /api/loans
  Done when: returns 201; rejects a 4th loan with 409; has tests`,
      'Split one feature of your project into at least five tasks with a "done when" line each.',
      'How can you tell a task is too large?',
      'If it will take more than about a day, or you cannot describe when it is done, split it into smaller tasks.'),
    L('Boards and visible progress',
      'Track work on a simple board so everyone can see what is happening.',
      'A board with To do, Doing and Done columns, and a limit of two tasks in Doing per person, stops work piling up half-finished.',
String.raw`To do        Doing (max 2 each)     Done
- overdue    - borrow endpoint      - loan table
- UI button  - return endpoint      - project setup
Rules
- pull the top task when you have capacity
- finish before starting something new
- a blocked task gets a note saying why`,
      'Set up a board for your project (GitHub Projects, Trello or paper) and use it for one week.',
      'Why limit how many tasks are "in progress" at once?',
      'Too many open tasks means context switching and nothing gets finished. Finishing work before starting new work keeps progress steady.'),
    L('Estimation',
      'Estimate effort with relative sizes and use your history to forecast.',
      'The team sizes tasks as 1, 2, 3, 5 or 8 points by comparing them. After two weeks they know they finish about 15 points per week.',
String.raw`Relative sizing (story points)
1  trivial, well understood
2  small
3  medium, some unknowns
5  large, several parts
8  too big? consider splitting
Velocity = average points finished per week (or sprint)
Forecast  = remaining points / velocity`,
      'Estimate your tasks in points, then compare with how long they really took after a week.',
      'Why use relative estimates instead of hours?',
      'People are better at comparing sizes than predicting exact time, and relative sizes stay useful even when speed changes.'),
    L('Risks and dependencies',
      'Spot what could go wrong early and decide what to do about it.',
      'The team notices the payment API sandbox is unreliable. They build a fake payment service first, so the risk cannot block the rest of the work.',
String.raw`Risk register
Risk                        Likelihood  Impact  Plan
Payment sandbox unreliable  High        High    build a fake first
Teammate exams in week 3    Medium      Medium  front-load their tasks
Hosting free tier limits    Low         Medium  test deploy in week 1
Review the register weekly. Do the riskiest work early.`,
      'Write a risk register with at least three risks for your project.',
      'Why do the riskiest work early in a project?',
      'If it fails or takes longer, there is still time to change the plan, instead of discovering the problem at the deadline.'),
    L('Communication and status updates',
      'Keep people informed with short, regular, honest updates.',
      'A weekly update says what was done, what is next, and what is blocked, in five lines.',
String.raw`Weekly update
Done:     borrow and return endpoints, with tests
Next:     overdue check and UI button
Blocked:  need the test database password from Aoife
Risk:     demo may slip one day if hosting is slow
Ask:      can someone review PR #14 by Thursday?`,
      'Send a five-line update about your project to a classmate or mentor each week for two weeks.',
      'Why report problems early instead of waiting until they are solved?',
      'Others can help or adjust plans while there is still time; surprises at the deadline are much harder to fix.'),
    L('History and retrospectives',
      'Keep a clear record of decisions and improve how the team works.',
      'After each sprint the team holds a 30-minute retrospective and records one change to try. Decisions go in a short log so newcomers know why things are the way they are.',
String.raw`Retrospective (30 minutes)
1. What went well?
2. What was difficult?
3. What will we try differently? (pick ONE action, with an owner)

Decision log entry
2026-03-04  Use PostgreSQL, not MongoDB
Why: relational data (loans, members); team knows SQL
Revisit if: we need flexible document storage`,
      'Run a short retrospective on your last week of study and write one action.',
      'Why pick only one action from a retrospective?',
      'One clear action is more likely to actually happen; a long list usually gets ignored.'),
  ],
});

M.push({
  id: 'db-management', title: 'Database management', cat: 'Data', code: '08b · DATA',
  desc: 'Manage a database over its life: access control, schema migrations, backups, data retention and privacy.',
  outcome: 'Change a schema safely with migrations, control who can access what, and prove backups can be restored.',
  jobSkills: ['Relational databases', 'Schema migrations', 'Data protection awareness'],
  sourceUrl: 'https://www.postgresql.org/docs/current/', sourceLabel: 'PostgreSQL documentation',
  example: 'A team adds a column with a Flyway migration that runs in every environment the same way, instead of someone typing ALTER TABLE on the live database.',
  exercise: 'Add Flyway (or Liquibase) to your API project and create three migrations: the first tables, a new column, and an index.',
  quiz: 'What is the worst thing a backup job could do?',
  quizChoices: ['Change or delete the data it is backing up', 'Compress the backup', 'Write a checksum'], answer: 0,
  lessons: [
    L('Roles and least privilege',
      'Give each user and application only the database access it needs.',
      'The web app can read and write rows but cannot drop tables. A reporting tool can only read. A backup job can only read.',
String.raw`-- Application: data access, no schema changes
CREATE ROLE app_user LOGIN PASSWORD :'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Reporting: read only
CREATE ROLE report_reader LOGIN PASSWORD :'report_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO report_reader;

-- Passwords are passed in by psql variables, never written in the file`,
      'List each program that uses your database and the smallest set of privileges it needs.',
      'What could go wrong if a backup job had permission to drop tables?',
      'A bug or attacker using that account could delete or alter data during a routine job. Read-only access removes the risk.'),
    L('Schema migrations',
      'Change the schema with versioned, repeatable migration files.',
      'Flyway applies V1, V2, V3 in order and records which have run, so every environment ends up with the same schema.',
String.raw`src/main/resources/db/migration/
  V1__create_books_and_members.sql
  V2__add_isbn_to_books.sql
  V3__index_loans_member_id.sql

-- V2__add_isbn_to_books.sql
ALTER TABLE books ADD COLUMN isbn VARCHAR(13);
CREATE UNIQUE INDEX ux_books_isbn ON books (isbn);`,
      'Write a migration that adds a NOT NULL column to a table that already has rows. What default do you need?',
      'Why never edit a migration that has already run in production?',
      'Its recorded checksum would no longer match, and other environments would differ. Add a new migration instead.'),
    L('Backup and restore',
      'Back up regularly and prove that restores work.',
      'A restore drill restores last night\'s backup to a staging database and checks row counts and sample records against production.',
String.raw`Restore checklist
1. Copy the latest backup to a staging host
2. Restore into a fresh, empty database
3. Compare row counts for key tables with the source
4. Query a few known records
5. Record how long the restore took and the backup's checksum
A backup you have never restored is only a hope.`,
      'Write a restore checklist for your project and time each step once.',
      'How do you prove a restore is complete?',
      'Compare row counts, checksums and sample records against the source, and confirm the application works against the restored copy.'),
    L('Data retention and privacy',
      'Keep personal data only as long as needed, and support people\'s GDPR rights.',
      'Inactive accounts are deleted after two years; a nightly job removes expired password-reset tokens; a user can export or delete their data.',
String.raw`-- Remove expired reset tokens nightly
DELETE FROM password_resets WHERE expires_at < now();

-- Find accounts inactive for two years (review before deleting)
SELECT id, email FROM members
WHERE last_login < now() - interval '2 years';

Checklist: what personal data, why, who can see it, how long kept,
how it is exported and deleted on request.`,
      'Write a retention rule for each table in your project that holds personal data.',
      'What does GDPR\'s "storage limitation" principle require?',
      'Personal data must not be kept longer than necessary for the purpose it was collected for.'),
    L('Monitoring and capacity',
      'Watch a database\'s health and act before it causes problems.',
      'A chart shows slow queries rising each week. The team finds a missing index before users notice.',
String.raw`-- Active connections by state
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- Queries running longer than 5 seconds
SELECT pid, now() - query_start AS runtime, left(query, 80)
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));`,
      'List three metrics you would chart for your database and the action each one triggers.',
      'What is a good first response to a sudden rise in slow queries?',
      'Find the slowest queries (pg_stat_statements or the slow-query log), read their plans with EXPLAIN, and fix the cause, often a missing index.'),
    L('Data quality checks',
      'Catch bad data with repeatable checks before it reaches reports or users.',
      'A nightly check finds loans whose return date is before the loan date and alerts the team.',
String.raw`SELECT 'returned before loaned' AS issue, count(*) FROM loans
WHERE returned_on < loaned_on
UNION ALL
SELECT 'member without email', count(*) FROM members
WHERE email IS NULL OR email = ''
UNION ALL
SELECT 'duplicate ISBN', count(*) FROM (
  SELECT isbn FROM books WHERE isbn IS NOT NULL
  GROUP BY isbn HAVING count(*) > 1) d;`,
      'Write three data quality checks for your project\'s tables.',
      'Why are constraints in the schema better than checks that run later?',
      'Constraints stop bad data being saved at all; later checks only find it after the damage is done.'),
  ],
});

M.push({
  id: 'database-admin', title: 'Database administration', cat: 'Data', code: '08c · OPERATIONS',
  desc: 'Operate PostgreSQL reliably: automated backups, logs, maintenance, connection pooling and high availability.',
  outcome: 'Automate backups, read the logs, maintain indexes, and explain how a database stays available when a server fails.',
  jobSkills: ['Database operations', 'Linux and scripting', 'Reliability awareness'],
  sourceUrl: 'https://www.postgresql.org/docs/current/admin.html', sourceLabel: 'PostgreSQL · Server administration',
  example: 'A nightly script backs up the database, writes a checksum, keeps seven days of backups, and alerts the team if any step fails.',
  exercise: 'In Docker, run PostgreSQL, write a backup script with a checksum, restore it to a second container, and check row counts match.',
  quiz: 'Why test a restore procedure regularly?',
  quizChoices: ['To prove the backups can recover usable data', 'To make backups smaller', 'To skip access controls'], answer: 0,
  lessons: [
    L('Automated backups',
      'Write a safe backup script and schedule it.',
      'pg_dump writes a compressed backup; a checksum proves the file is intact; old backups are pruned.',
String.raw`#!/usr/bin/env bash
set -euo pipefail
# Credentials come from ~/.pgpass (chmod 600), never from this file.
DB="courses"
DIR="/backups"
STAMP="$(date +%Y%m%d-%H%M)"
FILE="$DIR/$DB-$STAMP.dump"

pg_dump -U backup_reader -Fc "$DB" > "$FILE"
sha256sum "$FILE" > "$FILE.sha256"
find "$DIR" -name "$DB-*.dump*" -mtime +7 -delete
echo "Backup OK: $FILE"`,
      'Schedule the script with cron and make it send an alert when it fails.',
      'Why put database credentials in a .pgpass file instead of in the script?',
      'Scripts get copied, shared and committed. A .pgpass file with 600 permissions keeps the password out of the script, the process list and Git.'),
    L('Reading PostgreSQL logs',
      'Configure useful logging and find slow or failing queries.',
      'Logging every query slower than 500 ms shows exactly which queries need indexes.',
String.raw`# postgresql.conf
log_min_duration_statement = 500     # log queries slower than 500 ms
log_line_prefix = '%t [%p] user=%u db=%d '
log_connections = on
log_lock_waits = on

# Find the slowest logged queries
grep "duration:" postgresql.log | sort -t: -k5 -rn | head`,
      'Turn on slow-query logging in a Docker PostgreSQL, run a slow query and find it in the log.',
      'Why not log every single query in production?',
      'It creates huge logs, slows the server and may record sensitive data. A duration threshold captures the queries that matter.'),
    L('Vacuum and index maintenance',
      'Keep tables and indexes healthy as data changes.',
      'Heavy updates leave dead rows. Autovacuum cleans them; occasionally an index is rebuilt after a large bulk change.',
String.raw`-- Tables with many dead rows
SELECT relname, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 5;

-- Refresh planner statistics after a big import
ANALYZE books;

-- Rebuild a bloated index without blocking writes (PostgreSQL 12+)
REINDEX INDEX CONCURRENTLY idx_books_title;`,
      'Insert and delete 100,000 rows in a test table, then watch n_dead_tup before and after VACUUM.',
      'What does ANALYZE do?',
      'It updates the statistics the query planner uses to choose plans, such as whether to use an index.'),
    L('Connection pooling',
      'Avoid exhausting database connections by pooling them.',
      'Each PostgreSQL connection uses memory. An application pool (HikariCP in Spring Boot) or PgBouncer reuses a small number of connections.',
String.raw`# Spring Boot (HikariCP is the default pool)
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      connection-timeout: 5000

; pgbouncer.ini (in front of PostgreSQL)
[databases]
courses = host=127.0.0.1 port=5432 dbname=courses
[pgbouncer]
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 500
default_pool_size = 20`,
      'Find max_connections on your PostgreSQL and work out how many app instances it can support with a pool of 10.',
      'Why can a bigger pool make performance worse?',
      'Too many simultaneous connections compete for CPU, memory and locks. A modest pool with queued requests is usually faster overall.'),
    L('Replication and high availability',
      'Understand how a standby server keeps a database available when the primary fails.',
      'A streaming-replication standby receives changes continuously. If the primary fails, the standby is promoted and the app reconnects to it.',
String.raw`Primary  --WAL stream-->  Standby (read-only, ready to promote)

-- On the primary: is the standby keeping up?
SELECT client_addr, state, replay_lag FROM pg_stat_replication;

Key ideas
- replication is not a backup: a DELETE is replicated too
- managed services (RDS, Cloud SQL, Azure) handle failover for you
- test failover before you need it`,
      'Explain in three sentences why you still need backups when you have a replica.',
      'Why is a replica not a replacement for backups?',
      'Mistakes and deletions are copied to the replica immediately. Only a backup lets you go back to before the mistake.'),
    L('Capacity and health checks',
      'Expose database health to the application and alert before limits are reached.',
      'A health endpoint checks the database answers quickly; alerts fire at 80% disk and connection use, not at 100%.',
String.raw`// Spring Boot Actuator includes a database health check:
// GET /actuator/health -> {"status":"UP","components":{"db":{"status":"UP"}}}

-- Connection use as a percentage
SELECT round(100.0 * count(*) /
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')) AS pct
FROM pg_stat_activity;

Alert early: disk > 80%, connections > 80%, replication lag > 30 s`,
      'Add an alert threshold for each of the three metrics above to your project notes.',
      'Why alert at 80% rather than when the database is full?',
      'It gives the team time to add capacity or fix the cause before users see errors.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
