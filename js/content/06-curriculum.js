/* Certifications (freeCodeCamp-style): each groups modules into a path and ends with required projects. */
window.SD_CERTS = [
  {
    id: 'foundations', title: 'Programming Foundations',
    desc: 'Write correct code in Java and Python and design it with objects.',
    modules: ['java-fundamentals', 'python', 'oop', 'more-languages'],
    projects: ['gradebook-cli'],
  },
  {
    id: 'dsa', title: 'Data Structures and Algorithms',
    desc: 'The core of every internship coding assessment in Ireland.',
    modules: ['data-structures', 'algorithms', 'coding-assessments'],
    projects: ['dsa-library'],
  },
  {
    id: 'backend', title: 'Back-End Development with Java',
    desc: 'REST APIs with Spring Boot, SQL databases, testing and security.',
    modules: ['databases', 'rest-apis', 'testing', 'security'],
    projects: ['task-api'],
  },
  {
    id: 'frontend', title: 'Front-End Development',
    desc: 'Accessible pages, JavaScript, React and TypeScript.',
    modules: ['web-development', 'typescript'],
    projects: ['task-ui'],
  },
  {
    id: 'engineering', title: 'Software Engineering Practice',
    desc: 'Git, Linux, Docker, CI/CD, the cloud, Agile teamwork and interviews.',
    modules: ['git', 'devops-cloud', 'teamwork-career'],
    projects: ['deploy-pipeline', 'team-project'],
  },
  {
    id: 'data-ai', title: 'Data and AI',
    desc: 'Analyse real data with Python and SQL, and build a responsible AI assistant.',
    modules: ['data-analysis', 'ai-engineering'],
    projects: ['data-report', 'study-assistant'],
  },
];

/* Suggested order for the full roadmap (fundamentals first, interview prep alongside). */
window.SD_PATH = [
  'java-fundamentals', 'oop', 'data-structures', 'algorithms', 'git', 'coding-assessments',
  'testing', 'databases', 'rest-apis', 'web-development', 'python', 'typescript',
  'devops-cloud', 'security', 'teamwork-career', 'data-analysis', 'ai-engineering', 'more-languages',
];

/* Certification projects: user stories to satisfy, like freeCodeCamp's required projects. */
window.SD_PROJECTS = [
  {
    id: 'gradebook-cli', cert: 'foundations', title: 'Build a Gradebook CLI', stack: 'Java · Python', hours: '6–10 hours',
    summary: 'A command-line app that loads student results, validates them, and prints a report.',
    stories: [
      'Load results from a CSV file (name, module, score).',
      'Reject invalid rows (missing fields, score outside 0–100) and report the line number.',
      'Print each student\'s average and grade band, sorted by average.',
      'Model the data with at least three classes (for example Student, Result, Report).',
      'Include at least 8 unit tests (JUnit or pytest), including invalid input.',
      'Write a README explaining how to run it and the tests.',
    ],
    stretch: ['Write the same tool in both Java and Python.', 'Export the report as JSON.'],
    cv: 'Built a Java command-line gradebook that parses and validates CSV data, with 8+ JUnit tests covering invalid input.',
  },
  {
    id: 'dsa-library', cert: 'dsa', title: 'Build a Data Structures Library', stack: 'Java · JUnit 5', hours: '10–15 hours',
    summary: 'Implement core data structures from scratch with full tests and complexity notes.',
    stories: [
      'Implement a dynamic array, a singly linked list, a stack and a queue.',
      'Implement a hash map with separate chaining and resizing.',
      'Implement a binary search tree with insert, contains and in-order traversal.',
      'Implement a min-heap with offer, poll and peek.',
      'Every public method has JUnit tests, including empty-structure cases.',
      'The README has a table of each operation\'s Big-O time complexity.',
    ],
    stretch: ['Add a benchmark comparing your hash map with java.util.HashMap.', 'Add graph BFS and DFS.'],
    cv: 'Implemented a Java data structures library (hash map, BST, heap, linked list) with full JUnit coverage and documented Big-O costs.',
  },
  {
    id: 'task-api', cert: 'backend', title: 'Build a Task Tracker REST API', stack: 'Java · Spring Boot · PostgreSQL', hours: '15–25 hours',
    summary: 'The flagship back-end project: a secure, tested CRUD API that matches what Irish internship posts list.',
    stories: [
      'Endpoints to create, list, read, update and delete tasks, with correct status codes.',
      'Request validation returns 400 with field errors; missing tasks return 404.',
      'Data is stored in PostgreSQL through Spring Data JPA.',
      'Users register and log in; passwords are hashed with BCrypt.',
      'Users can only read and change their own tasks (tested).',
      'Unit tests for the service layer and MockMvc tests for the controller.',
      'OpenAPI documentation is available at /swagger-ui.html.',
    ],
    stretch: ['Add paging and filtering by status.', 'Add Flyway migrations.'],
    cv: 'Built a Spring Boot REST API with PostgreSQL, BCrypt authentication, per-user access control and MockMvc tests.',
  },
  {
    id: 'task-ui', cert: 'frontend', title: 'Build a Task Tracker Front End', stack: 'React · TypeScript', hours: '12–20 hours',
    summary: 'A responsive, accessible React client for your Task Tracker API.',
    stories: [
      'List tasks from the API with visible loading, empty and error states.',
      'Create and edit tasks with a validated form that shows errors next to fields.',
      'Mark tasks done and filter by status.',
      'All data types are written in TypeScript; no "any".',
      'The app works with the keyboard only and passes a Lighthouse accessibility audit.',
      'The layout works at 375px and 1280px wide.',
      'At least 5 component tests (Jest or Vitest with Testing Library).',
    ],
    stretch: ['Add optimistic updates.', 'Add a dark mode that respects the system setting.'],
    cv: 'Built an accessible React + TypeScript front end for a REST API with typed models, form validation and component tests.',
  },
  {
    id: 'deploy-pipeline', cert: 'engineering', title: 'Ship It: Docker, CI and Cloud', stack: 'Docker · GitHub Actions · Cloud', hours: '6–10 hours',
    summary: 'Package your API, test it on every pull request and deploy it.',
    stories: [
      'A multi-stage Dockerfile builds and runs the API as a non-root user.',
      'docker compose up starts the API and PostgreSQL together.',
      'GitHub Actions runs the tests on every pull request.',
      'Merging to main builds the image (and deploys, if you choose a free cloud tier).',
      'A /actuator/health endpoint reports database status.',
      'The README has a CI badge and a "Run locally" section with one command.',
    ],
    stretch: ['Add Dependabot and secret scanning.', 'Deploy to Cloud Run or Azure Container Apps.'],
    cv: 'Containerised a Spring Boot service with Docker Compose and set up a GitHub Actions pipeline that tests every pull request.',
  },
  {
    id: 'team-project', cert: 'engineering', title: 'Work as a Team', stack: 'Git · GitHub · Scrum', hours: '2 sprints',
    summary: 'Build a small feature with others the way an internship team does.',
    stories: [
      'Work with at least one other person (or contribute to an open-source project).',
      'Plan with written tickets that have acceptance criteria.',
      'Every change goes through a pull request with a description and a review.',
      'Resolve at least one merge conflict properly.',
      'Hold a short retrospective and write down one agreed improvement.',
      'Write three STAR stories from the experience.',
    ],
    stretch: ['Get a pull request merged into an open-source project.'],
    cv: 'Collaborated in a two-sprint team project using pull requests, code review and Scrum ceremonies.',
  },
  {
    id: 'data-report', cert: 'data-ai', title: 'Analyse Irish Open Data', stack: 'Python · pandas · SQL', hours: '6–10 hours',
    summary: 'Answer a real question with a public dataset from data.gov.ie or the CSO.',
    stories: [
      'State one clear question at the top of the notebook.',
      'Load, inspect and clean the data, and log every cleaning step.',
      'Use at least one groupby or pivot table, and one SQL query.',
      'Include at least one correctly labelled chart.',
      'Write a five-line summary with findings and limits.',
    ],
    stretch: ['Publish the notebook on GitHub with rendered charts.'],
    cv: 'Analysed Irish public data with pandas and SQL and presented findings with labelled charts and stated limitations.',
  },
  {
    id: 'study-assistant', cert: 'data-ai', title: 'Build a Course Study Assistant', stack: 'Java · Spring AI', hours: '12–20 hours',
    summary: 'A retrieval-backed assistant that answers from course notes and cites them.',
    stories: [
      'POST /api/ask validates the question and course ID.',
      'Course notes are chunked with metadata and stored in a vector store.',
      'Answers cite only sources that retrieval returned.',
      'When no relevant notes exist, the assistant says so instead of guessing.',
      'Model timeouts return a clear "unavailable" response.',
      'Tests run without calling a real model.',
    ],
    stretch: ['Add a simple chat UI.', 'Log latency and outcome without logging prompts.'],
    cv: 'Built a Spring AI retrieval-augmented assistant that cites sources, handles model failures and is tested without a live model.',
  },
];
