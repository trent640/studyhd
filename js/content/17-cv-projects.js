/* CV projects: optional portfolio projects, beyond the certification projects. Each is tagged with the modules it
   practises, a level, and why employers value it. Written as user stories, like a real ticket. */
(function (P) {
  // The areas used by the filter on the projects page, in display order.
  window.SD_PROJECT_AREAS = ['Java + AI', 'Java & algorithms', 'Back end & cloud', 'Front end & web', 'Testing', 'Databases', 'Data & Python', 'Mobile & languages', 'Security', 'Teamwork'];
  const add = (p) => P.push(Object.assign({ track: 'cv' }, p));

  /* ---------- Java + AI ---------- */
  add({
    area: 'Java + AI',
    id: 'ai-study-buddy', title: 'AI Study Buddy (Java + Spring AI)', level: 'Intermediate',
    stack: 'Java 21 · Spring Boot · Spring AI · React', hours: '15–25 hours', modules: ['ai-engineering', 'backend-spring', 'frontend-react'],
    summary: 'A web app where you chat with an AI tutor that explains computer science topics at your level and quizzes you, built with Spring Boot and Spring AI.',
    why: 'Employers in Ireland increasingly ask for Java developers who can add AI features safely. This shows you can call a model from a real Spring service, not only from a notebook.',
    stories: [
      'POST /api/chat accepts a question and returns an answer from a model through Spring AI\'s ChatClient.',
      'The system prompt is stored in a template file (not hard-coded) and tells the model to explain simply and ask one check question.',
      'Conversation memory keeps the last few messages per user, so follow-up questions work.',
      'Input is validated (length limit, empty questions rejected) and each user is rate limited.',
      'The API key is read from an environment variable and never committed; the README explains how to set it.',
      'A React chat page shows messages, a loading state and friendly errors when the model is slow or unavailable.',
      'Unit tests mock the ChatClient, so the test suite runs without a network or API key.',
    ],
    stretch: ['Stream the answer token by token (Server-Sent Events).', 'Let the user switch between a hosted model and a local one with Ollama.', 'Add a "quiz me" mode that returns structured JSON questions.'],
    cv: 'Built an AI tutoring web app with Spring Boot, Spring AI and React, with conversation memory, rate limiting and model calls mocked in JUnit tests.',
    checks: ['task-validation'],
  });
  add({
    area: 'Java + AI',
    id: 'rag-docs-assistant', title: 'Ask-the-Docs Assistant with RAG', level: 'Advanced',
    stack: 'Java · Spring Boot · Spring AI · PostgreSQL + pgvector', hours: '20–30 hours', modules: ['ai-engineering', 'databases', 'backend-spring'],
    summary: 'Upload documents (lecture notes, a product manual) and ask questions. Answers are generated only from the uploaded text, with the sources quoted.',
    why: 'Retrieval-augmented generation (RAG) is the most common AI feature companies build. It shows you understand embeddings, vector search and how to stop a model making things up.',
    stories: [
      'Upload a PDF or Markdown file; it is split into overlapping chunks and stored with embeddings in a vector store.',
      'A question retrieves the top matching chunks by similarity and passes only those to the model.',
      'Every answer lists the document and section it came from.',
      'If nothing relevant is found, the app says "I could not find that in your documents" instead of guessing.',
      'Uploads are limited by size and type, and each user only searches their own documents.',
      'An evaluation file of 15 questions with expected sources is run as a test and reports how many were answered from the right source.',
    ],
    stretch: ['Compare two chunk sizes and record which scores better on your evaluation set.', 'Add hybrid search (keyword + vector).', 'Run it all with Docker Compose.'],
    cv: 'Built a retrieval-augmented generation (RAG) assistant in Spring Boot with pgvector, citing sources and measured with a 15-question evaluation suite.',
    checks: ['chunk-text', 'cosine-similarity'],
  });
  add({
    area: 'Java + AI',
    id: 'ai-cv-reviewer', title: 'AI CV Feedback Tool', level: 'Intermediate',
    stack: 'Java · Spring Boot · Spring AI · React · Tailwind CSS', hours: '12–20 hours', modules: ['ai-engineering', 'frontend-react', 'backend-spring'],
    summary: 'Paste a CV and a job description; the app returns structured feedback: matching skills, missing skills and suggested bullet improvements.',
    why: 'Shows structured output (turning model text into Java objects), prompt design and care with personal data, all things interviewers ask about.',
    stories: [
      'The backend asks the model for JSON and maps it to a Java record (matchedSkills, missingSkills, suggestions).',
      'Invalid or incomplete model output is detected and retried once, then a clear error is shown.',
      'The React page shows the results as three calm, clearly labelled sections.',
      'CV text is never stored or logged; the privacy note on the page says so.',
      'Emails and phone numbers are removed from the text before it is sent to the model.',
      'Tests cover the JSON mapping, the retry, and the personal-data removal.',
    ],
    stretch: ['Highlight each suggestion next to the original line.', 'Export the feedback as a PDF.'],
    cv: 'Built a CV feedback tool using Spring AI structured output mapped to Java records, with personal-data redaction and retry handling for invalid model output.',
  });
  add({
    area: 'Java + AI',
    id: 'ai-ticket-triage', title: 'Support Ticket Triage with AI and Fallback Rules', level: 'Advanced',
    stack: 'Java · Spring Boot · Spring AI · MySQL', hours: '15–25 hours', modules: ['ai-engineering', 'testing', 'mysql'],
    summary: 'A service that labels incoming support tickets (billing, bug, account, other) and urgency using an AI model, with rules as a fallback and accuracy measured.',
    why: 'Companies want AI that is measured and reliable. This shows evaluation, fallbacks when the model fails, and a human in the loop.',
    stories: [
      'POST /tickets saves a ticket and assigns a category and urgency.',
      'The model is asked to choose only from the allowed categories; any other answer is rejected.',
      'If the model times out or errors, keyword rules choose the category, and the ticket is marked "rule-based".',
      'Staff can correct a label; corrections are stored.',
      'A labelled set of 50 example tickets measures accuracy, and the score is printed by a test.',
      'Each model call\'s time and outcome is logged (without the ticket text).',
    ],
    stretch: ['Show accuracy per category in a small dashboard.', 'Use corrected tickets as examples in the prompt (few-shot).'],
    cv: 'Built an AI ticket-triage service in Spring Boot with rule-based fallback, human corrections and an evaluation suite reporting 50-ticket accuracy.',
  });

  /* ---------- Java, OOP, data structures and algorithms ---------- */
  add({
    area: 'Java & algorithms',
    id: 'library-system-oop', title: 'Library Management System', level: 'Beginner',
    stack: 'Java · JUnit 5', hours: '8–12 hours', modules: ['oop', 'java-fundamentals', 'testing'],
    summary: 'A console app for a library: members borrow and return books, with fines for late returns, designed with clean object-oriented code.',
    why: 'A classic interview discussion project: it shows encapsulation, inheritance, interfaces and exceptions in a domain anyone understands.',
    stories: [
      'Classes for Book, Member, Loan and Library, with private fields and validation in constructors.',
      'Two kinds of member (Student, Staff) with different loan limits, using inheritance or an interface.',
      'Borrowing an unavailable book or going over the limit throws a custom exception with a clear message.',
      'Returning late calculates a fine using the java.time API.',
      'Books can be searched by title or author, using streams.',
      'At least 10 JUnit tests, including the error cases.',
    ],
    stretch: ['Save and load the library to a JSON file.', 'Add a reservation queue for popular books.'],
    cv: 'Designed an object-oriented library management system in Java using inheritance, interfaces and custom exceptions, covered by 10+ JUnit tests.',
    checks: ['bank-account', 'course-class'],
  });
  add({
    area: 'Java & algorithms',
    id: 'pathfinding-visualiser', title: 'Pathfinding Visualiser', level: 'Intermediate',
    stack: 'JavaScript or TypeScript · React', hours: '12–18 hours', modules: ['algorithms', 'data-structures', 'frontend-react'],
    summary: 'A grid where you draw walls, pick a start and end, and watch breadth-first search, Dijkstra and A* find a path step by step.',
    why: 'Very visual on a CV and in interviews, and it proves you understand graphs, queues and priority queues, not just how to memorise them.',
    stories: [
      'Click or drag to draw walls; start and end points can be moved.',
      'BFS, Dijkstra (with weighted cells) and A* are implemented by you, not a library.',
      'The search animates visited cells, then the final path; a speed slider and a "reduce motion" option skip the animation.',
      'The page shows how many cells each algorithm visited and the path length.',
      'Unit tests check each algorithm on small grids, including "no path".',
      'It works with the keyboard as well as the mouse.',
    ],
    stretch: ['Add a maze generator.', 'Write a short README comparing the algorithms\' time complexity.'],
    cv: 'Built a React pathfinding visualiser implementing BFS, Dijkstra and A* from scratch, with unit tests and keyboard-accessible controls.',
    checks: ['islands', 'min-heap'],
  });
  add({
    area: 'Java & algorithms',
    id: 'mini-git', title: 'Build Your Own Mini Git', level: 'Advanced',
    stack: 'Java', hours: '20–30 hours', modules: ['git', 'data-structures', 'java-fundamentals'],
    summary: 'A small version-control tool with init, add, commit, log and checkout, storing files by their SHA-1 hash like Git does.',
    why: 'Stands out because few students build one. It shows hashing, trees, file I/O and a deep understanding of a tool every team uses.',
    stories: [
      '`minigit init` creates a hidden folder for objects and refs.',
      '`add` stores file contents as blobs named by their hash; identical files are stored once.',
      '`commit -m` stores a tree of the staged files, the parent commit, author and time.',
      '`log` prints the history from the newest commit.',
      '`checkout <commit>` restores files from that commit, refusing if there are unsaved changes.',
      'Integration tests run the commands in a temporary folder.',
    ],
    stretch: ['Add branches.', 'Add a simple `diff` between two commits.'],
    cv: 'Built a mini version-control system in Java with content-addressed storage (SHA-1), commits, history and checkout, tested with integration tests.',
  });

  /* ---------- Back end, REST and cloud ---------- */
  add({
    area: 'Back end & cloud',
    id: 'url-shortener', title: 'URL Shortener with Analytics', level: 'Intermediate',
    stack: 'Java · Spring Boot · MySQL · Redis · Docker', hours: '12–18 hours', modules: ['rest-apis', 'backend-spring', 'mysql'],
    summary: 'Create short links, redirect visitors, and count clicks, with caching so popular links are fast.',
    why: 'A favourite system-design interview question. Building it gives you real answers about IDs, caching, rate limits and databases.',
    stories: [
      'POST /links returns a short code for a valid http(s) URL; other URLs are rejected.',
      'GET /{code} redirects with HTTP 302 and records the click.',
      'Popular links are cached in Redis, and the cache is updated when a link is deleted.',
      'GET /links/{code}/stats returns total clicks and clicks per day.',
      'Link creation is rate limited per user.',
      'Integration tests use Testcontainers (or an in-memory database) and the app runs with Docker Compose.',
    ],
    stretch: ['Let links expire after a chosen date.', 'Show the stats as a chart in a small front end.'],
    cv: 'Built a URL shortener REST API in Spring Boot with MySQL, Redis caching, rate limiting and click analytics, deployed with Docker Compose.',
  });
  add({
    area: 'Back end & cloud',
    id: 'event-booking-api', title: 'Event Ticket Booking API with Security', level: 'Advanced',
    stack: 'Java · Spring Boot · Spring Security · MySQL', hours: '18–25 hours', modules: ['backend-spring', 'security', 'db-management'],
    summary: 'Users log in, browse events and book seats. Two people can never book the same seat, and only organisers can create events.',
    why: 'Shows authentication, role-based authorisation and database transactions, three topics that come up in almost every Java backend interview.',
    stories: [
      'Users register and log in; passwords are hashed with BCrypt.',
      'Endpoints are protected by role: organisers create events, customers book.',
      'Booking a seat happens in a transaction, and a unique constraint stops double booking, even with two requests at once.',
      'A test fires concurrent booking requests for the same seat and checks only one succeeds.',
      'Users can only see and cancel their own bookings (tested).',
      'Errors return a consistent JSON format with the right HTTP status codes.',
      'API documentation is generated with OpenAPI (Swagger UI).',
    ],
    stretch: ['Hold a seat for 5 minutes before payment.', 'Email a confirmation (use a fake mail server in development).'],
    cv: 'Built a secure event-booking API with Spring Boot and Spring Security, using transactions and constraints to prevent double booking under concurrent load.',
    checks: ['task-validation', 'strong-password'],
  });
  add({
    area: 'Back end & cloud',
    id: 'microservices-shop', title: 'Microservices Online Shop', level: 'Advanced',
    stack: 'Java · Spring Boot · Spring Cloud Gateway · Docker Compose', hours: '25–35 hours', modules: ['cloud-frameworks', 'web-patterns', 'devops-cloud'],
    summary: 'A small shop split into a product service, an order service and an API gateway, each with its own database, running together with Docker Compose.',
    why: 'Many Irish employers (finance, telecoms, SaaS) run Spring Boot microservices. This shows you understand service boundaries, gateways and resilience.',
    stories: [
      'The product service and the order service are separate Spring Boot apps with separate databases.',
      'An API gateway routes /products and /orders to the right service.',
      'Placing an order calls the product service to check stock; a timeout and a circuit breaker (Resilience4j) handle failures.',
      'Each service exposes health checks with Spring Boot Actuator.',
      'Configuration comes from environment variables, not code.',
      'All services start with one `docker compose up`, and the README has a diagram.',
    ],
    stretch: ['Send "order placed" events through a message queue (RabbitMQ or Kafka).', 'Add distributed tracing.'],
    cv: 'Built a Spring Boot microservices shop with an API gateway, per-service databases, Resilience4j circuit breakers and Docker Compose deployment.',
  });
  add({
    area: 'Back end & cloud',
    id: 'k8s-deploy', title: 'Deploy a Spring Boot App to Kubernetes', level: 'Advanced',
    stack: 'Docker · Kubernetes · GitHub Actions', hours: '12–20 hours', modules: ['devops-cloud', 'cloud-frameworks'],
    summary: 'Take one of your Spring Boot projects and run it on a local Kubernetes cluster with health probes, configuration and automatic builds.',
    why: 'Cloud and container skills appear in most Irish internship posts. This gives you something concrete to talk about beyond "I know Docker".',
    stories: [
      'A multi-stage Dockerfile builds a small image that runs as a non-root user.',
      'Kubernetes manifests (Deployment, Service, ConfigMap, Secret) run two replicas.',
      'Liveness and readiness probes use the Actuator health endpoints.',
      'A GitHub Actions workflow runs the tests and builds the image on every push.',
      'A rolling update changes the version with no downtime, and the README shows how.',
      'Secrets are not committed; the README explains how they are created.',
    ],
    stretch: ['Package it with Helm.', 'Deploy to a free cloud tier and add the link to your CV.'],
    cv: 'Containerised a Spring Boot service and deployed it to Kubernetes with health probes, rolling updates and a GitHub Actions CI pipeline.',
  });

  /* ---------- Front end and web ---------- */
  add({
    area: 'Front end & web',
    id: 'portfolio-site', title: 'Accessible Developer Portfolio Website', level: 'Beginner',
    stack: 'HTML · CSS · Tailwind CSS', hours: '6–10 hours', modules: ['web-development', 'frontend-react'],
    summary: 'Your own portfolio site listing your projects, skills and CV, built to be fast and accessible.',
    why: 'Recruiters click the link on your CV first. A clean, accessible site shows care and gives a home for all your other projects.',
    stories: [
      'Semantic HTML: header, nav, main, sections and footer, with one h1 and ordered headings.',
      'A responsive layout that works from 320px phones to wide screens, styled with Tailwind CSS.',
      'Each project card links to its repository and a live demo where there is one.',
      'Colour contrast meets WCAG AA and everything works with the keyboard, with visible focus.',
      'Respects "reduce motion" and dark mode settings.',
      'Lighthouse scores 90+ for performance and accessibility, with a screenshot in the README.',
    ],
    stretch: ['Deploy it with GitHub Pages or Netlify on your own domain.', 'Add a contact form that works without JavaScript.'],
    cv: 'Built an accessible, responsive portfolio site with semantic HTML and Tailwind CSS, scoring 90+ on Lighthouse accessibility and performance.',
    checks: ['accessible-nav', 'flex-cards'],
  });
  add({
    area: 'Front end & web',
    id: 'budget-tracker', title: 'Personal Budget Tracker', level: 'Intermediate',
    stack: 'React · TypeScript · Tailwind CSS', hours: '12–18 hours', modules: ['frontend-react', 'typescript'],
    summary: 'Add income and spending, group it by category and month, and see where your money goes in simple charts.',
    why: 'Shows React state, forms, TypeScript types and data visualisation in an app interviewers immediately understand.',
    stories: [
      'Add, edit and delete transactions with a validated form (amount, date, category, note).',
      'All data is typed with TypeScript interfaces, with no `any`.',
      'Totals per month and per category are calculated and shown in a chart.',
      'Data is saved in localStorage and survives a reload.',
      'Filters for month and category; the URL remembers the filter.',
      'Component tests with React Testing Library cover adding a transaction and the totals.',
    ],
    stretch: ['Import a CSV bank statement.', 'Set a budget per category and warn calmly when close to it.'],
    cv: 'Built a React and TypeScript budget tracker with typed state, charts, filters and component tests using React Testing Library.',
    checks: ['progress-reducer', 'accessible-form'],
  });
  add({
    area: 'Front end & web',
    id: 'realtime-chat', title: 'Real-Time Study Group Chat', level: 'Advanced',
    stack: 'Java · Spring Boot WebSocket (STOMP) · React', hours: '15–25 hours', modules: ['web-patterns', 'frontend-react', 'backend-spring'],
    summary: 'Study group rooms where messages appear instantly for everyone, with who-is-online and message history.',
    why: 'Real-time features are a step up from REST and show you understand the publish-subscribe pattern and connection handling.',
    stories: [
      'Users join a room and messages are delivered instantly over WebSockets.',
      'The last 50 messages of a room are loaded from the database when you join.',
      'A list shows who is online in the room and updates when people leave.',
      'Message text is escaped on display, so HTML or scripts in messages cannot run (tested).',
      'Messages are limited in length and rate per user.',
      'The client reconnects automatically after a dropped connection.',
    ],
    stretch: ['Add "is typing…" indicators.', 'Let moderators delete messages.'],
    cv: 'Built a real-time chat app with Spring Boot WebSockets (STOMP) and React, with message history, presence, reconnection and XSS-safe rendering.',
    checks: ['escape-html'],
  });
  add({
    area: 'Front end & web',
    id: 'accessibility-audit', title: 'Accessibility Audit and Fix', level: 'Beginner',
    stack: 'HTML · CSS · axe DevTools · screen reader', hours: '6–10 hours', modules: ['web-development', 'testing'],
    summary: 'Audit a real website or open-source project for accessibility, write up the findings, and fix the most important ones.',
    why: 'Accessibility is a legal requirement in the EU (European Accessibility Act) and few graduates can show real experience with it.',
    stories: [
      'Run automated checks (axe or Lighthouse) and record every issue found.',
      'Test manually with the keyboard only, and with a screen reader (NVDA or VoiceOver).',
      'Write a report grouping issues by WCAG 2.2 criterion and severity, with screenshots.',
      'Fix at least five issues (for example labels, contrast, focus order, alt text, headings).',
      'Show before-and-after results for each fix.',
      'If it is an open-source project, open a pull request with your fixes.',
    ],
    stretch: ['Add an automated accessibility test to the project\'s CI.', 'Write a short blog post about what you learned.'],
    cv: 'Audited a web application against WCAG 2.2 using axe and screen readers, and fixed issues including labels, focus order and contrast.',
    checks: ['accessible-form'],
  });

  /* ---------- Testing ---------- */
  add({
    area: 'Testing',
    id: 'legacy-test-suite', title: 'Add a Test Suite to Untested Code', level: 'Intermediate',
    stack: 'Java · JUnit 5 · Mockito · JaCoCo · Playwright', hours: '10–15 hours', modules: ['testing', 'software-engineering'],
    summary: 'Take an existing project with few tests (your own older project or an open-source one) and make it safe to change.',
    why: 'Most real jobs involve working on existing code. Showing you can add tests safely is a skill teams value highly.',
    stories: [
      'Measure the starting test coverage with JaCoCo and record it.',
      'Write characterisation tests that capture current behaviour before changing anything.',
      'Use Mockito to replace a slow or external dependency (database, HTTP call).',
      'Refactor one messy method with the tests passing before and after.',
      'Add at least one end-to-end test with Playwright or REST Assured.',
      'Run the tests in GitHub Actions and show the coverage change in the README.',
    ],
    stretch: ['Try mutation testing with PIT and improve weak tests.', 'Add a test for a bug you found, then fix it.'],
    cv: 'Raised test coverage of an existing Java project from X% to Y% with JUnit 5, Mockito and Playwright, enabling a safe refactor, with tests run in CI.',
  });

  /* ---------- Databases ---------- */
  add({
    area: 'Databases',
    id: 'db-performance-lab', title: 'MySQL Performance and Admin Lab', level: 'Intermediate',
    stack: 'MySQL 8 · Docker', hours: '8–12 hours', modules: ['database-admin', 'db-management', 'mysql'],
    summary: 'Load a large sample dataset into MySQL, find slow queries, speed them up with indexes, and set up users, backups and a restore test.',
    why: 'Shows you can do more than write SELECT statements: you can measure, tune and look after a database, which backend teams need.',
    stories: [
      'Load at least 100,000 rows of sample data with a script.',
      'Find three slow queries and record their EXPLAIN plans and timings.',
      'Add indexes and show the new plans and timings, explaining each change.',
      'Create separate MySQL users for the app (limited rights) and for admin work.',
      'Write a backup script (mysqldump) and prove a restore works into a fresh container.',
      'Document everything in a README with the before-and-after numbers.',
    ],
    stretch: ['Set up a read replica.', 'Show a deadlock, explain it and fix it.'],
    cv: 'Tuned MySQL queries on a 100k-row dataset using EXPLAIN and indexing (cutting query time by X%), and set up least-privilege users and tested backups.',
    checks: ['sql-busy-members', 'sql-module-completion'],
  });

  /* ---------- Data analysis and Python ---------- */
  add({
    area: 'Data & Python',
    id: 'dublin-bikes-analysis', title: 'Dublin Bikes Usage Analysis', level: 'Beginner',
    stack: 'Python · pandas · matplotlib · Jupyter', hours: '8–12 hours', modules: ['data-analysis', 'python'],
    summary: 'Analyse public Dublin Bikes station data (from data.gov.ie / Smart Dublin) to find when and where bikes run out.',
    why: 'A local, real dataset makes a memorable interview story, and it shows cleaning, analysis and clear communication of results.',
    stories: [
      'Download the open data and record the source and licence in the README.',
      'Clean the data: fix types, handle missing values and remove duplicates, explaining each step.',
      'Answer at least three questions, such as the busiest hours and the stations most often empty.',
      'Make at least three clear, labelled charts.',
      'Write a one-page summary of the findings for a non-technical reader.',
      'The notebook runs from top to bottom without errors, with pinned package versions.',
    ],
    stretch: ['Compare weekdays with weekends, or with weather data from Met Éireann.', 'Turn it into a small interactive dashboard with Streamlit.'],
    cv: 'Analysed Dublin Bikes open data with Python and pandas, identifying peak demand and frequently empty stations, and presented the findings in charts.',
  });
  add({
    area: 'Data & Python',
    id: 'rent-price-predictor', title: 'Rent Price Predictor (Machine Learning)', level: 'Intermediate',
    stack: 'Python · pandas · scikit-learn', hours: '12–18 hours', modules: ['data-analysis', 'ai-engineering', 'python'],
    summary: 'Train a model to predict monthly rent from location, size and property type using public Irish rental data, and explain how good it is.',
    why: 'Shows the full machine-learning workflow honestly: a fair train/test split, a simple baseline, and metrics you can explain.',
    stories: [
      'Use a public dataset (for example RTB or CSO rent data) and describe it.',
      'Split the data into training and test sets before any tuning.',
      'Compare a simple baseline (average rent per area) with at least two models.',
      'Report mean absolute error in euro for each model on the test set.',
      'Explain which features matter most, and the model\'s limits and possible bias.',
      'Save the model and add a small function or API that makes one prediction.',
    ],
    stretch: ['Serve the model from a FastAPI endpoint and call it from a Spring Boot app.', 'Use cross-validation.'],
    cv: 'Trained and evaluated scikit-learn models predicting Irish rents, beating a baseline by X% mean absolute error, with a documented train/test methodology.',
  });
  add({
    area: 'Data & Python',
    id: 'python-automation', title: 'Automate a Boring Task with Python', level: 'Beginner',
    stack: 'Python · pytest · argparse', hours: '5–8 hours', modules: ['python', 'testing'],
    summary: 'A command-line tool that automates something you really do, such as renaming files, organising downloads or turning a spreadsheet into a report.',
    why: 'Short, practical and easy to explain. It shows you write tools that save time, with tests and a proper command-line interface.',
    stories: [
      'The tool solves one real, clearly described problem.',
      'A command-line interface with --help, built with argparse.',
      'A --dry-run option shows what would change without changing anything.',
      'Errors (missing folder, bad file) give a friendly message, not a stack trace.',
      'At least six pytest tests using temporary folders.',
      'Installable with pip, with a README showing an example run.',
    ],
    stretch: ['Add logging with a --verbose flag.', 'Schedule it to run daily.'],
    cv: 'Wrote a Python command-line tool that automates <task>, with a dry-run mode, friendly errors and pytest tests, saving about N minutes a week.',
  });
  add({
    area: 'Mobile & languages',
    id: 'kotlin-habit-app', title: 'Android Habit Tracker in Kotlin', level: 'Intermediate',
    stack: 'Kotlin · Jetpack Compose · Room', hours: '15–25 hours', modules: ['more-languages', 'oop'],
    summary: 'A calm Android app to track daily habits, with streaks, reminders and local storage.',
    why: 'Kotlin runs on the JVM, so your Java knowledge transfers. Mobile experience helps for the many Irish companies with Android apps.',
    stories: [
      'Create, edit and delete habits.',
      'Tick a habit as done for today, and see the current streak.',
      'Data is stored on the device with Room.',
      'A daily reminder notification can be turned on or off per habit.',
      'The interface supports large text and dark mode, and works with TalkBack.',
      'Unit tests cover the streak calculation, including missed days.',
    ],
    stretch: ['Add a weekly summary screen.', 'Export habits as a CSV file.'],
    cv: 'Built an Android habit tracker in Kotlin with Jetpack Compose and Room, with reminders, streak logic covered by unit tests, and accessible UI.',
  });

  /* ---------- Security and bug bounty ---------- */
  add({
    area: 'Security',
    id: 'secure-auth-service', title: 'Secure Login Service with Two-Factor Authentication', level: 'Advanced',
    stack: 'Java · Spring Boot · Spring Security', hours: '15–25 hours', modules: ['security', 'security-principles', 'backend-spring'],
    summary: 'A login service built to the OWASP guidelines: strong password storage, two-factor codes, account lockout and secure sessions.',
    why: 'Security knowledge sets developers apart. Building authentication correctly, and explaining the choices, is impressive in any interview.',
    stories: [
      'Passwords are hashed with BCrypt or Argon2, and checked against a list of common passwords.',
      'Two-factor authentication with time-based one-time codes (TOTP), set up with a QR code.',
      'Repeated failed logins are slowed down or locked, without revealing whether the account exists.',
      'Session cookies are HttpOnly, Secure and SameSite, and sessions end on password change.',
      'Security events (logins, failures, 2FA changes) are logged without passwords or codes.',
      'A checklist in the README maps each feature to the OWASP ASVS requirement it meets.',
    ],
    stretch: ['Add passkey (WebAuthn) login.', 'Add "sign out all devices".'],
    cv: 'Built a Spring Security authentication service with TOTP two-factor login, account lockout and secure sessions, mapped to OWASP ASVS requirements.',
    checks: ['strong-password', 'decode-jwt'],
  });
  add({
    area: 'Security',
    id: 'devsecops-pipeline', title: 'DevSecOps: Add Security Checks to a CI Pipeline', level: 'Intermediate',
    stack: 'GitHub Actions · OWASP Dependency-Check or Dependabot · Semgrep · OWASP ZAP', hours: '8–12 hours', modules: ['security', 'devops-cloud', 'security-tooling'],
    summary: 'Take one of your web projects and add automatic security checks to its pipeline, then fix what they find.',
    why: '"Shift-left" security is a phrase in many job posts. This proves you can set it up and act on the results.',
    stories: [
      'Dependency scanning runs on every push and fails the build on high-severity issues.',
      'Static analysis (Semgrep or CodeQL) runs with a small rule set suited to the language.',
      'A secret scanner checks that no keys are committed.',
      'A baseline OWASP ZAP scan runs against a test deployment of your own app.',
      'Fix or document every finding, with the reason for any accepted risk.',
      'Write a one-page threat model (STRIDE) for the app in the repository.',
    ],
    stretch: ['Generate a software bill of materials (SBOM).', 'Sign your container images.'],
    cv: 'Added dependency, static-analysis, secret and DAST scanning to a GitHub Actions pipeline and fixed the findings, documented with a STRIDE threat model.',
  });
  add({
    area: 'Security',
    id: 'ctf-writeups', title: 'Publish 10 CTF and Lab Write-ups', level: 'Intermediate',
    stack: 'TryHackMe · Hack The Box (retired machines) · PortSwigger labs', hours: '20–40 hours', modules: ['bug-bounty-practice', 'security-tooling', 'web-vulns-injection'],
    summary: 'Solve ten legal practice challenges and publish clear write-ups that explain the vulnerability, how you found it and how to fix it.',
    why: 'Security hiring managers and bug bounty programs look for proof of skill. Clear write-ups also show you can communicate, which is half of bug bounty work.',
    stories: [
      'Only use platforms and machines where publishing is allowed (retired machines, or labs that permit write-ups).',
      'Cover at least four different vulnerability types (for example SQL injection, access control, XSS, SSRF).',
      'Each write-up has: summary, steps to reproduce, root cause, impact and the fix for developers.',
      'Screenshots or commands are included, with any flags or secrets removed where the platform asks.',
      'Write-ups are published on a blog or GitHub with a contents page.',
      'Each one ends with what you would check next in a real program.',
    ],
    stretch: ['Record a short video walkthrough of one.', 'Turn one into a talk for a local OWASP chapter meetup.'],
    cv: 'Published 10 security write-ups covering SQL injection, access control, XSS and SSRF, each with reproduction steps, impact and developer fixes.',
  });
  add({
    area: 'Security',
    id: 'recon-toolkit', title: 'Scope-Aware Recon Helper', level: 'Advanced',
    stack: 'Python · public data sources', hours: '12–20 hours', modules: ['recon', 'python', 'bug-bounty-practice'],
    summary: 'A Python tool that organises passive reconnaissance for a bug bounty program, and refuses to touch anything outside the program\'s scope.',
    why: 'Shows you can automate the boring parts of recon responsibly: the scope check is the feature program owners care about most.',
    stories: [
      'Read the program\'s scope (in-scope and out-of-scope domains) from a file.',
      'Gather subdomains only from passive public sources (for example certificate transparency logs).',
      'Every result is checked against the scope, and out-of-scope results are dropped and logged.',
      'Requests are rate limited and identify the tool, following the program\'s rules.',
      'Results are saved as CSV or JSON and compared with the previous run to show what is new.',
      'Tests cover the scope matching, including wildcards and exclusions.',
    ],
    stretch: ['Notify you when a new in-scope subdomain appears.', 'Tag results with their technology from public headers.'],
    cv: 'Wrote a Python passive-reconnaissance tool for bug bounty programs with strict scope enforcement, rate limiting and change detection, covered by tests.',
  });

  /* ---------- Software engineering, project management and teamwork ---------- */
  add({
    area: 'Teamwork',
    id: 'scrum-project', title: 'Run a Three-Sprint Scrum Project', level: 'Intermediate',
    stack: 'Jira or GitHub Projects · Git · any stack', hours: '20–30 hours (with a team)', modules: ['project-management', 'software-engineering', 'teamwork-career'],
    summary: 'With two to four classmates, plan and build a small app in three one-week sprints, keeping the documents a real team would keep.',
    why: 'Interviews always ask "tell me about working in a team". This gives you real stories, plus artefacts to show.',
    stories: [
      'A short requirements document with user stories and acceptance criteria.',
      'A UML class or sequence diagram and one architecture decision record (ADR).',
      'A backlog with estimates; each sprint has a goal and a planning note.',
      'Work is done on branches with pull requests and code reviews.',
      'A burndown chart or board screenshot for each sprint.',
      'A retrospective after each sprint, with one change the team tried next time.',
    ],
    stretch: ['Run a demo for someone outside the team and record their feedback.', 'Track a risk register.'],
    cv: 'Delivered a team project over three Scrum sprints, with user stories, ADRs, code reviews, burndown tracking and sprint retrospectives.',
  });
  add({
    area: 'Teamwork',
    id: 'open-source-prs', title: 'Get Three Pull Requests Merged in Open Source', level: 'Intermediate',
    stack: 'Git · GitHub · any language', hours: '10–20 hours', modules: ['git', 'teamwork-career'],
    summary: 'Find beginner-friendly issues in real open-source projects and get your changes reviewed and merged.',
    why: 'Merged pull requests are public proof you can read other people\'s code, follow a team\'s rules and take review feedback.',
    stories: [
      'Choose projects with "good first issue" labels and read their CONTRIBUTING guide.',
      'Comment on the issue before starting, so work is not duplicated.',
      'Follow the project\'s code style, tests and commit message rules.',
      'Respond politely to review comments and update your pull request.',
      'At least three pull requests merged (documentation fixes count for one).',
      'Keep a short log of what each change was and what you learned.',
    ],
    stretch: ['Help review someone else\'s pull request.', 'Join the project\'s community chat and help answer a question.'],
    cv: 'Contributed 3 merged pull requests to open-source projects (<names>), working with maintainers through code review.',
  });
})(window.SD_PROJECTS);
