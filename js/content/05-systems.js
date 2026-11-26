/* DevOps, security, data analysis, AI, teamwork and career. */
(function (M, L) {

M.push({
  id: 'devops-cloud', title: 'Linux, Docker and cloud', cat: 'Engineering', code: '11 · DEVOPS',
  desc: 'Work confidently on the command line, script with Bash, containerise apps with Docker, and know the core cloud services.',
  outcome: 'Run your API and database with Docker Compose, deploy it through a CI pipeline, and explain the cloud services involved.',
  jobSkills: ['CI/CD basics', 'Linux command line', 'Cloud platforms (AWS, Azure, GCP) as a plus', 'Docker'],
  sourceUrl: 'https://docs.docker.com/get-started/', sourceLabel: 'Docker · Get started',
  example: 'A new teammate runs docker compose up and has the API and PostgreSQL running in two minutes, with no local installs except Docker.',
  exercise: 'Add a Dockerfile and docker-compose.yml to your API project, and a GitHub Actions workflow that runs tests and builds the image.',
  quiz: 'What is the difference between a Docker image and a container?',
  quizChoices: ['An image is a template; a container is a running instance of it', 'They are the same thing', 'A container is a stored file; an image is a running process'], answer: 0,
  lessons: [
    L('The Linux command line',
      'Navigate, inspect and search files from the terminal.',
      'Finding every TODO in a project and counting them takes one command.',
String.raw`pwd                       # where am I?
ls -la                    # list, including hidden files
cd src/main/java
mkdir -p notes/week1
cp a.txt b.txt; mv b.txt notes/
grep -rn "TODO" src/      # search recursively with line numbers
find . -name "*.java" | wc -l
less app.log              # page through a big file (q to quit)
tail -f app.log           # follow a log live`,
      'Use only the terminal for one study session: create a project folder, files and a Git repo.',
      'What does the pipe | do?',
      'It sends the output of one command as the input of the next, so small tools combine into bigger ones.'),
    L('Permissions, processes and environment',
      'Read file permissions, manage processes and use environment variables.',
      'A server will not start because port 8080 is taken; you find and stop the old process.',
String.raw`ls -l deploy.sh           # -rwxr-x---  owner/group/others
chmod +x deploy.sh        # make it executable
ps aux | grep java        # find running Java processes
lsof -i :8080             # who is using port 8080?
kill 12345                # ask a process to stop

export DATABASE_URL=jdbc:postgresql://localhost/books
echo "$DATABASE_URL"`,
      'Start your API, find its process ID from the terminal and stop it gracefully.',
      'Why keep configuration in environment variables?',
      'The same build can run in development, test and production with different settings, and secrets stay out of the code.'),
    L('Bash scripting',
      'Automate repetitive tasks with small, safe Bash scripts.',
      'A script backs up a database and keeps only the last seven backups.',
String.raw`#!/usr/bin/env bash
set -euo pipefail          # stop on errors and unset variables

DB_NAME="${'$'}{1:?usage: backup.sh <db-name>}"
DIR="/backups"
STAMP="$(date +%Y%m%d-%H%M)"

pg_dump "$DB_NAME" | gzip > "$DIR/$DB_NAME-$STAMP.sql.gz"
ls -1t "$DIR"/"$DB_NAME"-*.sql.gz | tail -n +8 | xargs -r rm --
echo "Backup written: $DIR/$DB_NAME-$STAMP.sql.gz"`,
      'Write a script that runs your tests and prints PASS or FAIL in colour.',
      'What does set -euo pipefail protect against?',
      'It stops the script when a command fails (-e), when an unset variable is used (-u), or when any command in a pipeline fails (pipefail), instead of carrying on silently.'),
    L('Docker images and containers',
      'Package an application and its runtime into an image and run it anywhere.',
      'A multi-stage Dockerfile builds the jar with Maven, then copies only the jar into a small runtime image.',
String.raw`FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
USER 1000
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
      'Build and run the image: docker build -t books-api . then docker run -p 8080:8080 books-api.',
      'Why copy pom.xml and download dependencies before copying src?',
      'Docker caches each layer. Dependencies change rarely, so code edits only rebuild the later layers, making builds much faster.'),
    L('Docker Compose for local development',
      'Run an app with its database and other services from one file.',
      'Compose starts PostgreSQL and the API on a shared network, with the API waiting for the database to be healthy.',
String.raw`services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: books
      POSTGRES_USER: books
      POSTGRES_PASSWORD: devpassword   # local development only
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "books"]
      interval: 5s
  api:
    build: .
    ports: ["8080:8080"]
    environment:
      DATABASE_URL: jdbc:postgresql://db:5432/books
      DATABASE_USER: books
      DATABASE_PASSWORD: devpassword
    depends_on:
      db:
        condition: service_healthy`,
      'Add a volume so the database data survives docker compose down.',
      'Why does the API use the host name "db" instead of localhost?',
      'Inside the Compose network each service is reachable by its service name. localhost would point at the API container itself.'),
    L('CI/CD pipelines',
      'Automate build, test and deploy so every change is checked the same way.',
      'On each pull request the pipeline tests the code; on merge to main it also builds and pushes a Docker image.',
String.raw`name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: maven }
      - run: mvn -B verify
      - name: Build image
        if: github.ref == 'refs/heads/main'
        run: docker build -t books-api:${'$'}{{ github.sha }} .`,
      'Add a status badge for the workflow to your README.',
      'What is the difference between continuous integration and continuous delivery?',
      'Integration: every change is merged often and automatically built and tested. Delivery: every passing build is packaged and ready to release, often with an automated deploy step.'),
    L('Cloud fundamentals',
      'Know the core services of AWS, Azure and Google Cloud and how a typical web app maps onto them.',
      'Dublin hosts major AWS, Microsoft and Google data centres and engineering teams; most internships touch cloud services in some way.',
String.raw`Need                 AWS          Azure              Google Cloud
Run containers       ECS/Fargate  Container Apps     Cloud Run
Virtual machines     EC2          Virtual Machines   Compute Engine
Managed Postgres     RDS          Azure Database     Cloud SQL
File/object storage  S3           Blob Storage       Cloud Storage
Serverless function  Lambda       Functions          Cloud Functions
Logs and metrics     CloudWatch   Monitor            Cloud Logging`,
      'Deploy your Docker image to a free tier (for example Google Cloud Run or Azure Container Apps) and add the URL to your README.',
      'What does "managed service" mean for a database?',
      'The provider handles servers, patching, backups and failover; you manage the schema, data and access.'),
    L('Logging and monitoring',
      'Make running software observable with structured logs, metrics and health checks.',
      'Spring Boot Actuator exposes /actuator/health so a load balancer can stop sending traffic to a broken instance.',
String.raw`# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics

// Log with context, never with secrets or passwords
private static final Logger log = LoggerFactory.getLogger(LoanService.class);
log.info("Loan created loanId={} memberId={}", loan.id(), member.id());
log.warn("Payment declined orderId={} reason={}", orderId, reason);`,
      'Add Actuator to your API and check /actuator/health while the database is stopped.',
      'Why should logs never contain passwords or full card numbers?',
      'Logs are copied to many systems and read by many people. Sensitive data in logs is a data breach waiting to happen and can break GDPR.'),
  ],
});

M.push({
  id: 'security', title: 'Web security', cat: 'Security', code: '12 · SECURITY',
  desc: 'Prevent the most common web vulnerabilities: injection, XSS, broken access control, weak authentication and leaked secrets.',
  outcome: 'Review a web app against the OWASP Top 10 and fix injection, XSS, CSRF and access-control flaws.',
  jobSkills: ['Secure coding awareness', 'Authentication and authorisation', 'GDPR-aware data handling'],
  sourceUrl: 'https://owasp.org/www-project-top-ten/', sourceLabel: 'OWASP Top 10',
  example: 'A search box concatenated into SQL let anyone dump the users table. Switching to a parameterised query closed the hole without changing behaviour for real users.',
  exercise: 'Audit one of your projects with the OWASP Top 10 list. Fix at least two issues and describe them in your README.',
  quiz: 'What is the main defence against SQL injection?',
  quizChoices: ['Parameterised queries (prepared statements)', 'Removing quote characters from input', 'Hiding error messages'], answer: 0,
  lessons: [
    L('The OWASP Top 10',
      'Know the ten most critical web application risks and an example of each.',
      'Broken access control is number one: a user changes /orders/41 to /orders/42 and sees someone else\'s order.',
String.raw`OWASP Top 10 (2021)
A01 Broken Access Control       check ownership on every request
A02 Cryptographic Failures      HTTPS, hash passwords, encrypt at rest
A03 Injection                   parameterised queries, output encoding
A04 Insecure Design             threat-model before building
A05 Security Misconfiguration   no default passwords, no debug in prod
A06 Vulnerable Components       update dependencies, scan in CI
A07 Auth Failures               rate limits, MFA, strong sessions
A08 Integrity Failures          verify updates and pipelines
A09 Logging Failures            log security events, alert on them
A10 SSRF                        validate URLs the server fetches`,
      'Pick three items and find a real-world breach caused by each.',
      'Which OWASP category covers a user reading another user\'s data by changing an ID?',
      'A01 Broken Access Control. The server must check that the logged-in user owns the resource, not just that they are logged in.'),
    L('Injection and parameterised queries',
      'Keep data separate from code in SQL and shell commands.',
      'Concatenation lets input change the query. A placeholder keeps it as data.',
String.raw`// VULNERABLE: input "x' OR '1'='1" returns every row
String sql = "SELECT * FROM users WHERE email = '" + email + "'";

// SAFE: the driver sends the value separately
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);

// Spring Data JPA derived queries and @Query with :params are also safe
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);`,
      'Find every SQL string in your project built with + and convert it to parameters.',
      'Why is stripping quotes from input not enough?',
      'Attackers can use encodings, other syntax or numeric contexts that need no quotes, and stripping breaks legitimate names like O\'Brien. Parameters fix the root cause.'),
    L('Cross-site scripting (XSS)',
      'Encode output for the context it appears in, and use safe APIs.',
      'A comment containing a script tag runs in every visitor\'s browser if it is inserted as HTML.',
String.raw`// VULNERABLE
commentEl.innerHTML = comment.text;

// SAFE: treated as text, never parsed as HTML
commentEl.textContent = comment.text;

// React escapes {values} by default. Avoid this unless sanitised:
<div dangerouslySetInnerHTML={{ __html: userHtml }} />

// Defence in depth: a Content-Security-Policy header
Content-Security-Policy: default-src 'self'; script-src 'self'`,
      'Post a comment containing <b>hi</b> in your app. Does it show bold text or the literal tags? Fix it if bold.',
      'Should you escape data when storing it or when displaying it?',
      'When displaying it. Store the original data and encode for the output context (HTML, attribute, URL, JavaScript) at the point of use.'),
    L('Authentication and password storage',
      'Store passwords with a slow, salted hash and manage sessions safely.',
      'Spring Security\'s BCryptPasswordEncoder salts and hashes passwords; plain SHA-256 is far too fast to resist guessing.',
String.raw`@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// register
user.setPasswordHash(encoder.encode(rawPassword));

// login
if (!encoder.matches(rawPassword, user.getPasswordHash())) {
    throw new BadCredentialsException("Invalid username or password");
}`,
      'Add rate limiting or a lockout after five failed logins to your project.',
      'Why say "invalid username or password" instead of "wrong password"?',
      'A specific message tells attackers which usernames exist, which makes guessing attacks easier.'),
    L('Authorisation and access control',
      'Check permissions on the server for every request, by role and by ownership.',
      'Hiding the delete button in the UI does nothing if the API accepts the request from anyone.',
String.raw`@DeleteMapping("/api/tasks/{id}")
void delete(@PathVariable long id, @AuthenticationPrincipal UserDetails me) {
    Task task = tasks.findById(id).orElseThrow(TaskNotFoundException::new);
    if (!task.getOwner().equals(me.getUsername())) {
        throw new AccessDeniedException("Not your task");   // 403
    }
    tasks.delete(task);
}`,
      'Write a test proving user A cannot delete user B\'s task.',
      'What is the difference between authentication and authorisation?',
      'Authentication proves who you are (login). Authorisation decides what you are allowed to do (permissions).'),
    L('CSRF, cookies and CORS',
      'Protect cookie-based sessions from cross-site requests and configure CORS deliberately.',
      'A malicious page can make your browser submit a form to your bank. SameSite cookies and CSRF tokens stop it.',
String.raw`Set-Cookie: SESSION=abc123; HttpOnly; Secure; SameSite=Lax; Path=/

// Spring Security enables CSRF protection by default for session apps.
// For a separate front end, allow only your own origin:
@Bean
CorsConfigurationSource cors() {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.ie"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}`,
      'Check the cookies your app sets in the browser\'s DevTools. Are HttpOnly, Secure and SameSite set?',
      'What does HttpOnly do?',
      'It stops JavaScript from reading the cookie, so an XSS bug cannot steal the session token directly.'),
    L('Secrets and dependencies',
      'Keep secrets out of code and keep third-party libraries patched.',
      'Dependabot opens a pull request when a library you use has a known vulnerability.',
String.raw`# Secrets: environment or a secret manager, never Git
export STRIPE_KEY=...          # set in the deploy environment
.env                           # listed in .gitignore

# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: maven
    directory: /
    schedule: { interval: weekly }

# Check dependencies locally
mvn org.owasp:dependency-check-maven:check
npm audit`,
      'Enable Dependabot and secret scanning on your GitHub repositories.',
      'A secret was pushed to a public repository. What is the first thing to do?',
      'Revoke and rotate the secret immediately. Removing it from history comes second, because it may already have been copied.'),
    L('Privacy and GDPR basics',
      'Handle personal data lawfully: collect less, protect it and respect user rights.',
      'Irish and EU employers expect developers to understand GDPR; the Data Protection Commission in Dublin regulates many large tech firms.',
String.raw`Developer checklist
- Collect only the personal data the feature needs
- Know where personal data is stored and who can read it
- Encrypt in transit (HTTPS) and at rest where possible
- Support export and deletion of a user's data
- Do not log personal data unnecessarily
- Set retention periods and delete old data`,
      'List every piece of personal data your project stores and why it needs it.',
      'What does data minimisation mean?',
      'Collect and keep only the personal data that is necessary for a stated purpose.'),
  ],
});

M.push({
  id: 'data-analysis', title: 'Data analysis with Python', cat: 'Data', code: '13 · DATA',
  desc: 'Load, clean, analyse and visualise data with pandas and SQL, and present the result clearly.',
  outcome: 'Answer a question from a real public dataset with a clean notebook and a short written summary.',
  jobSkills: ['Data manipulation and analysis', 'Python', 'SQL'],
  sourceUrl: 'https://pandas.pydata.org/docs/getting_started/index.html', sourceLabel: 'pandas · Getting started',
  example: 'Using CSO data on data.gov.ie, a student charts rent changes by county and writes three findings in plain English.',
  exercise: 'Pick a dataset from data.gov.ie, ask one question, and answer it in a Jupyter notebook with at least one chart.',
  quiz: 'What does df.groupby("county")["rent"].mean() return?',
  quizChoices: ['The average rent for each county', 'The rent column sorted by county', 'The number of rows per county'], answer: 0,
  lessons: [
    L('Loading and inspecting data',
      'Read CSV files into a DataFrame and get a first picture of the data.',
      'Before analysing, check the shape, column types and missing values.',
String.raw`import pandas as pd

df = pd.read_csv("results.csv")
print(df.shape)          # (rows, columns)
print(df.dtypes)         # column types
print(df.head())         # first 5 rows
print(df.isna().sum())   # missing values per column
print(df.describe())     # count, mean, std, min, quartiles, max`,
      'Load a dataset from data.gov.ie and write three observations about it.',
      'Why check dtypes before analysing?',
      'Numbers stored as text (for example "1,200") will not sum or average correctly until converted.'),
    L('Cleaning data',
      'Handle missing values, duplicates and inconsistent formats, and record each decision.',
      'County names appear as "Dublin", "dublin " and "Co. Dublin"; they must be standardised before grouping.',
String.raw`df = df.drop_duplicates()
df["county"] = (df["county"].str.strip()
                            .str.replace("Co. ", "", regex=False)
                            .str.title())
df["rent"] = pd.to_numeric(df["rent"].astype(str).str.replace(",", ""), errors="coerce")
df = df.dropna(subset=["rent"])           # document why rows were dropped`,
      'Write a short cleaning log: each step, how many rows it changed, and why.',
      'Is it always right to fill missing values with the mean?',
      'No. It can hide real gaps and distort the distribution. Sometimes dropping rows, using the median, or keeping a "missing" category is more honest.'),
    L('Grouping and aggregating',
      'Summarise data by category with groupby and pivot tables.',
      'Average rent per county per year as a table.',
String.raw`summary = (df.groupby(["county", "year"])["rent"]
              .agg(["mean", "median", "count"])
              .reset_index())

pivot = df.pivot_table(index="county", columns="year", values="rent", aggfunc="median")
top5 = summary[summary.year == 2024].nlargest(5, "median")`,
      'Find the three counties with the largest rent increase between two years.',
      'Why report the median alongside the mean?',
      'The mean is pulled by extreme values; the median shows the typical case. A big gap between them signals skewed data.'),
    L('SQL and pandas together',
      'Run SQL against a database from Python and continue the analysis in pandas.',
      'Load query results straight into a DataFrame.',
String.raw`import sqlite3
import pandas as pd

conn = sqlite3.connect("library.db")
loans = pd.read_sql_query("""
    SELECT m.name, COUNT(*) AS loans
    FROM loans l JOIN members m ON m.id = l.member_id
    GROUP BY m.name
""", conn)
print(loans.sort_values("loans", ascending=False).head(10))`,
      'Write the same aggregation once in SQL and once in pandas, and check the results match.',
      'When should you aggregate in SQL instead of pandas?',
      'When the data is large: let the database filter and aggregate so only the small result travels to Python.'),
    L('Visualising results',
      'Choose a chart that answers the question, and label it fully.',
      'A line chart for change over time; a bar chart for comparing categories.',
String.raw`import matplotlib.pyplot as plt

ax = pivot.loc[["Dublin", "Cork", "Galway"]].T.plot(marker="o")
ax.set_title("Median monthly rent, 2019–2024")
ax.set_xlabel("Year")
ax.set_ylabel("Rent (€)")
ax.legend(title="County")
plt.tight_layout()
plt.savefig("rent.png", dpi=150)`,
      'Make one chart for your dataset and ask a friend what it shows without explaining it.',
      'What makes a chart misleading?',
      'A truncated y-axis that exaggerates differences, missing labels or units, too many colours, or a chart type that hides the comparison.'),
    L('Communicating findings',
      'Write a short, honest summary that a non-technical reader can act on.',
      'Lead with the answer, back it with numbers, and state limits.',
String.raw`Finding: Median rent in Galway rose 38% from 2019 to 2024,
faster than Dublin (24%) and Cork (31%).

Evidence: RTB rent index, 4,120 new tenancies in 2024.
Limits: covers new tenancies only; 3% of rows dropped for missing rent.
Next step: compare with average earnings by county.`,
      'Write a five-line summary like this for your notebook and put it at the top.',
      'Why state the limits of your analysis?',
      'It shows honesty and helps readers decide how much to trust the result, which builds credibility.'),
  ],
});

M.push({
  id: 'ai-engineering', title: 'Spring Boot + Spring AI', cat: 'Java', code: '14 · JAVA + AI',
  desc: 'Build a Spring Boot study assistant that retrieves course notes and calls a model through Spring AI, with tests and guardrails.',
  outcome: 'Build a retrieval-backed assistant that cites its sources, handles failures and never presents a guess as a fact.',
  jobSkills: ['AI-assisted development and model APIs', 'Java and Spring Boot'],
  sourceUrl: 'https://docs.spring.io/spring-ai/reference/', sourceLabel: 'Spring AI reference',
  example: 'The Course Companion answers a question from the selected module\'s notes and lists the lesson sections it used. If retrieval finds nothing relevant, it says so.',
  exercise: 'Build the flow in milestones: a validated endpoint, a ChatClient draft, document retrieval, source-aware output, then tests for no matches and model timeouts.',
  quiz: 'What does retrieval add to a course assistant?',
  quizChoices: ['Relevant course passages and source references for the model to use', 'A guarantee that every answer is correct', 'A way to skip authorisation checks'], answer: 0,
  lessons: [
    L('Map the service before adding AI',
      'Separate the HTTP boundary, orchestration, retrieval and model call.',
      'A question enters a controller, passes to a StudyAssistantService, retrieves notes, then reaches the model. The service returns an answer with the notes it used.',
String.raw`QuestionController
  -> StudyAssistantService
       -> CourseRetriever     (vector search, filtered by course)
       -> ChatClient          (model call)
  <- Answer + source references`,
      'Draw the request path. Mark where input is validated, where course access is checked and where model failures are handled.',
      'Why should the controller not build the prompt itself?',
      'Keeping orchestration in a service keeps the endpoint thin and lets the AI flow be tested without an HTTP request.'),
    L('Call a model through ChatClient',
      'Keep provider-specific details behind Spring AI\'s ChatClient.',
      'The service receives a ChatClient.Builder from Spring and builds a client with default instructions.',
String.raw`@Service
class StudyAssistantService {
    private final ChatClient chat;

    StudyAssistantService(ChatClient.Builder builder) {
        this.chat = builder
            .defaultSystem("You are a study tutor. Answer only from the provided course excerpts.")
            .build();
    }

    String draft(String question) {
        return chat.prompt().user(question).call().content();
    }
}`,
      'Configure a model provider in application.yml with the API key read from an environment variable.',
      'What becomes easier when callers depend on your service rather than a provider SDK?',
      'You can test and change the model integration without changing the web API or the rest of the application.'),
    L('Prompts as a contract',
      'Separate trusted instructions, the user\'s question and retrieved context.',
      'User text goes in the user message and is never treated as system instructions.',
String.raw`System:  Answer from the excerpts below. If they do not contain the
         answer, reply "Not covered in this course". Cite excerpt IDs.
User:    {question}
Context: [E1] ... [E2] ... [E3] ...`,
      'Write a system instruction with a rule for missing evidence and one for off-topic questions.',
      'Should learner-supplied text be treated as trusted instructions?',
      'No. Keep it in the user part of the request; it may contain attempts to override your rules (prompt injection).'),
    L('Retrieval with a vector store',
      'Split notes into chunks with metadata, embed them and search by similarity.',
      'Store course and section metadata with every chunk so results can be filtered and cited.',
String.raw`List<Document> chunks = List.of(
    new Document("An index speeds up lookups...", Map.of("course", "databases", "section", "Indexes")));
vectorStore.add(chunks);

List<Document> hits = vectorStore.similaritySearch(
    SearchRequest.builder()
        .query(question)
        .topK(4)
        .filterExpression("course == 'databases'")
        .build());`,
      'Load three lessons into a SimpleVectorStore and inspect which chunks come back for two questions.',
      'Does retrieval guarantee the answer is correct?',
      'No. It supplies relevant context; you still need source display, output checks and a clear response when evidence is missing.'),
    L('Validate output and handle failure',
      'Treat model output as an untrusted draft and fail safely.',
      'If the model times out or returns no valid sources, the user sees a clear message instead of a broken answer.',
String.raw`try {
    String answer = draft(question, hits);
    List<String> cited = extractIds(answer);
    if (!hitIds(hits).containsAll(cited)) {
        return Answer.notFound();            // model cited something we did not give it
    }
    return new Answer(answer, sourcesFor(cited));
} catch (RestClientException | TimeoutException e) {
    log.warn("Model call failed type={}", e.getClass().getSimpleName());
    return Answer.unavailable();
}`,
      'Define the response for "answer", "not in course notes" and "assistant unavailable", and what the UI shows for each.',
      'Why must source references come from retrieval results?',
      'The application can verify them, so it never presents model-invented links as evidence.'),
    L('Test without a live model',
      'Test orchestration with a stubbed model and retriever so tests are fast and repeatable.',
      'A test supplies a fixed retrieval result and a canned model reply, then checks the answer and sources.',
String.raw`Test cases
- relevant notes      -> answer includes those sources
- no matches          -> "Not covered in this course"
- model timeout       -> "assistant unavailable", no stack trace
- invented source ID  -> rejected`,
      'Write the "no matches" test with a mocked retriever returning an empty list.',
      'Why keep tests that never call a real model?',
      'They are deterministic, free and fast, and they check your application\'s behaviour rather than the model\'s.'),
    L('Use AI coding tools responsibly',
      'Use AI assistants to learn faster while staying able to explain every line you submit.',
      'Employers welcome AI-assisted development but expect you to review, test and understand the code; coding assessments are usually done without assistants.',
String.raw`Good uses
- explain an error message or unfamiliar API
- generate test cases you then check
- review your code for edge cases
Rules
- never paste secrets or private code into public tools
- run and test everything generated
- be able to explain it in an interview`,
      'Solve a challenge yourself, then ask an AI tool to review it. List what it found and what it got wrong.',
      'Why practise without an assistant before assessments?',
      'Online assessments and live interviews test your own problem solving; relying on a tool during study leaves gaps that show up under time pressure.'),
  ],
});

M.push({
  id: 'teamwork-career', title: 'Teamwork, Agile and interviews', cat: 'Career', code: '15 · CAREER',
  desc: 'Work in Scrum teams, communicate clearly in writing, and answer behavioural interview questions with STAR.',
  outcome: 'Run a small project with a backlog and sprints, and give clear STAR answers about it in interviews.',
  jobSkills: ['Agile environment and Scrum (Apple, Accenture)', 'Communication (top gap named by Irish employers in gradireland surveys)', 'Behavioural interviews'],
  sourceUrl: 'https://scrumguides.org/scrum-guide.html', sourceLabel: 'The Scrum Guide',
  example: 'Three classmates plan a two-week sprint, hold short stand-ups, demo a working feature, and agree one improvement at the retrospective.',
  exercise: 'Write three STAR stories from your projects, studies or part-time work: one about teamwork, one about a mistake, one about learning something quickly.',
  quiz: 'In STAR, what should take up most of your answer?',
  quizChoices: ['Action: what you specifically did', 'Situation: the background', 'Task: what the team was asked to do'], answer: 0,
  lessons: [
    L('Scrum in practice',
      'Know the Scrum roles, events and artefacts you will meet on an internship team.',
      'A two-week sprint starts with planning, has a daily 15-minute stand-up, and ends with a review and a retrospective.',
String.raw`Roles      Product Owner, Scrum Master, Developers
Events     Sprint Planning -> Daily Scrum -> Sprint Review -> Retrospective
Artefacts  Product Backlog, Sprint Backlog, Increment

Stand-up (2 minutes each)
Yesterday: finished the search endpoint tests
Today:     start the React search box
Blockers:  need the API key for staging`,
      'Run your next personal project in one-week sprints with a written plan and retro.',
      'What is the purpose of the retrospective?',
      'To inspect how the team worked and agree specific improvements for the next sprint.'),
    L('User stories, tickets and estimates',
      'Write tickets that someone else can pick up, with acceptance criteria.',
      'A good ticket says who wants what and why, and how to know it is done.',
String.raw`Title: Search books by title

As a library member
I want to search books by title
So that I can find a book without scrolling

Acceptance criteria
- Given books "Dune" and "Emma", searching "du" shows only "Dune"
- Search is case-insensitive
- An empty search shows all books
Estimate: 3 points`,
      'Write five tickets for your portfolio project and estimate them in story points.',
      'What makes acceptance criteria useful?',
      'They are specific and testable, so developer, tester and product owner agree on what "done" means before work starts.'),
    L('Written communication at work',
      'Write messages, PR descriptions and questions that are clear and easy to act on.',
      'gradireland surveys of Irish employers repeatedly name communication as the biggest gap in graduates. Clear writing is a quick way to stand out.',
String.raw`Asking for help (after 30–60 minutes stuck)
"Hi Aoife, I'm stuck on the 401 from the staging API.
What I tried: refreshed the token, checked the header name.
Error: 401 'invalid audience' (log link).
Question: should staging use a different audience value?"`,
      'Rewrite your last three messages to a lecturer or teammate using: context, what you tried, a specific question.',
      'Why include what you already tried?',
      'It saves the helper time, avoids repeated suggestions, and shows you worked on the problem yourself.'),
    L('Behavioural answers with STAR',
      'Answer "tell me about a time..." questions with Situation, Task, Action and Result.',
      'A Belfast placement candidate was told their answers were not as concise as others\'; the advice was to use STAR and time yourself.',
String.raw`Question: Tell me about a time you disagreed with a teammate.

S  In a 3-person college project, we disagreed on React vs plain JS.
T  We had two weeks and I was responsible for the front end.
A  I built a 1-hour prototype of each, listed the trade-offs,
   and suggested we decide with the group by a set time.
R  We chose React, finished a day early, and kept the comparison
   in our README. I learned to settle debates with evidence.

Aim for about 2 minutes. Spend most of it on A.`,
      'Record yourself answering three common questions with STAR and time each answer.',
      'Should you say "we" or "I" in the Action part?',
      'Mostly "I". Interviewers need to know what you personally did, while still crediting the team.'),
    L('CV, GitHub and LinkedIn',
      'Present projects so a recruiter sees relevant skills within 30 seconds.',
      'Irish internship applications usually go through an online form with a one-page CV; GitHub links are checked for README quality.',
String.raw`CV project bullet (what + how + result)
"Built a Spring Boot REST API for a library app with PostgreSQL,
 JUnit/MockMvc tests (85% coverage) and a GitHub Actions pipeline;
 deployed with Docker to Cloud Run."

README checklist
- one-line description and screenshot
- how to run it (one command)
- tech stack and why
- tests and how to run them
- what you would improve next`,
      'Rewrite one CV bullet and one README with these checklists. Ask a careers adviser at your college to review the CV.',
      'Why include numbers in a CV bullet?',
      'Numbers (test coverage, users, speed-up) make claims concrete and memorable.'),
    L('The Irish internship application timeline',
      'Plan applications around when large employers recruit.',
      'Big tech and finance firms in Dublin often open summer internships in late summer and autumn of the year before; many close early once filled.',
String.raw`Typical timeline (check each employer)
Aug–Oct   big tech and finance open summer applications
Oct–Dec   online assessments and first interviews
Jan–Mar   more roles open, smaller firms and work placements
Apr–Jun   late openings; internships start May–July

Sources: gradireland.com, company careers pages, college careers
service, LinkedIn, Indeed, IrishJobs.ie`,
      'Make a spreadsheet of 15 employers with opening dates, links and status.',
      'Why apply early rather than near the deadline?',
      'Many employers review applications on a rolling basis and close roles once filled, so early applicants see more open places.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
