/* Modules from the original brief: MySQL, Web patterns, Cloud frameworks (Spring Boot),
   Frontend (React + Tailwind CSS), Backend (Java, Spring, Spring Boot). */
(function (M, L) {

M.push({
  id: 'mysql', title: 'Database development with MySQL', cat: 'Data', code: '08a · MYSQL',
  desc: 'Build and use MySQL databases: InnoDB tables, MySQL data types, queries, indexes, views and procedures, transactions, users and backups, and connecting from Spring Boot.',
  outcome: 'Design, query, secure and back up a MySQL database, and connect a Spring Boot app to it.',
  jobSkills: ['MySQL', 'SQL in online assessments', 'Database development'],
  sourceUrl: 'https://dev.mysql.com/doc/refman/8.4/en/', sourceLabel: 'MySQL 8.4 reference manual',
  example: 'A course platform stores learners, modules and progress in MySQL. A Spring Boot API reads it through Spring Data JPA, and a nightly mysqldump backs it up.',
  exercise: 'Run MySQL 8 in Docker, create a course-platform schema (learners, modules, lessons, progress), load sample data, and write five reporting queries.',
  quiz: 'Which MySQL storage engine supports transactions and foreign keys and is the default?',
  quizChoices: ['InnoDB', 'MyISAM', 'MEMORY'], answer: 0,
  lessons: [
    L('Run MySQL and connect',
      'Start a MySQL server locally and connect with the command-line client or MySQL Workbench.',
      'Docker gives every learner the same MySQL version in one command, without installing it on the computer.',
String.raw`# Start MySQL 8 (local only; choose your own password)
docker run --name course-mysql -d -p 127.0.0.1:3306:3306 \
  -e MYSQL_ROOT_PASSWORD=change-me -e MYSQL_DATABASE=courses mysql:8.4

# Connect with the client inside the container
docker exec -it course-mysql mysql -u root -p courses

mysql> SELECT VERSION();
mysql> SHOW DATABASES;`,
      'Start MySQL in Docker, connect, and create a database called study_desk.',
      'Why bind MySQL to 127.0.0.1 instead of all interfaces?',
      'So only your own computer can reach the database. An exposed database port is a common security problem.'),
    L('Tables and MySQL data types',
      'Create InnoDB tables with suitable MySQL types, keys and constraints.',
      'utf8mb4 stores every character, including emoji and Irish fadas. AUTO_INCREMENT creates IDs; FOREIGN KEY keeps links valid.',
String.raw`CREATE TABLE learners (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE progress (
  learner_id INT UNSIGNED NOT NULL,
  lesson_id  INT UNSIGNED NOT NULL,
  status     ENUM('learning', 'done', 'skipped') NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (learner_id, lesson_id),
  FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
) ENGINE=InnoDB;`,
      'Add modules and lessons tables with foreign keys, and choose a type for an estimated-minutes column.',
      'Why use DECIMAL rather than FLOAT for money in MySQL?',
      'DECIMAL stores exact values; FLOAT is approximate and produces rounding errors in totals.'),
    L('Querying: joins and aggregates in MySQL',
      'Write the reporting queries that assessments and real apps need.',
      'Find each learner\'s number of completed lessons, including learners who have completed none.',
String.raw`SELECT l.name, COUNT(p.lesson_id) AS done_lessons
FROM learners l
LEFT JOIN progress p
  ON p.learner_id = l.id AND p.status = 'done'
GROUP BY l.id, l.name
ORDER BY done_lessons DESC
LIMIT 10;

-- Learners active in the last 7 days
SELECT DISTINCT learner_id FROM progress
WHERE updated_at >= NOW() - INTERVAL 7 DAY;`,
      'Write a query for the completion percentage per module.',
      'Why is the status filter in the ON clause rather than WHERE?',
      'In ON it only limits which progress rows match, so learners with no completed lessons still appear with a count of 0. In WHERE they would be removed.'),
    L('Indexes and EXPLAIN in MySQL',
      'Add indexes for common queries and check them with EXPLAIN.',
      'A dashboard filters progress by learner and status. A composite index makes it fast.',
String.raw`CREATE INDEX idx_progress_learner_status ON progress (learner_id, status);

EXPLAIN SELECT * FROM progress WHERE learner_id = 42 AND status = 'done';
-- key: idx_progress_learner_status   type: ref   rows: small number
-- "type: ALL" means a full table scan

EXPLAIN ANALYZE SELECT ...;   -- MySQL 8: actual timings`,
      'Run EXPLAIN on a query before and after adding an index and compare the "type" and "rows" columns.',
      'Does the column order in a composite index matter?',
      'Yes. An index on (learner_id, status) helps queries filtering on learner_id, or learner_id and status, but not queries filtering on status alone.'),
    L('Views, stored procedures and triggers',
      'Package common queries and rules inside the database, and know when not to.',
      'A view gives reports a simple, stable table to read; a procedure records a lesson as done in one call.',
String.raw`CREATE VIEW module_completion AS
SELECT m.id AS module_id, m.title,
       ROUND(100 * AVG(p.status = 'done'), 1) AS pct_done
FROM modules m
JOIN lessons ls ON ls.module_id = m.id
LEFT JOIN progress p ON p.lesson_id = ls.id
GROUP BY m.id, m.title;

DELIMITER //
CREATE PROCEDURE mark_done(IN p_learner INT, IN p_lesson INT)
BEGIN
  INSERT INTO progress (learner_id, lesson_id, status)
  VALUES (p_learner, p_lesson, 'done')
  ON DUPLICATE KEY UPDATE status = 'done';
END //
DELIMITER ;`,
      'Create the view and query it. Then call mark_done and check the progress table.',
      'Why do many teams keep business rules in the application rather than in stored procedures?',
      'Application code is easier to test, review and version, and is not tied to one database. Procedures are useful for some data-heavy tasks but harder to maintain.'),
    L('Transactions and isolation in InnoDB',
      'Group changes so they succeed or fail together, and understand isolation levels.',
      'Enrolling a learner inserts an enrolment and decreases the available seats. Either both happen or neither does.',
String.raw`START TRANSACTION;
SELECT seats_left FROM courses WHERE id = 3 FOR UPDATE;   -- lock the row
UPDATE courses SET seats_left = seats_left - 1 WHERE id = 3 AND seats_left > 0;
INSERT INTO enrolments (learner_id, course_id) VALUES (42, 3);
COMMIT;   -- or ROLLBACK;

-- InnoDB default isolation level
SELECT @@transaction_isolation;   -- REPEATABLE-READ`,
      'Open two MySQL sessions and try to take the last seat in both at once. Observe the lock.',
      'What does SELECT ... FOR UPDATE do?',
      'It locks the selected rows until the transaction ends, so another transaction cannot change them in the meantime.'),
    L('Users, privileges and backups',
      'Create least-privilege users and back up and restore with mysqldump.',
      'The app connects as a user that can read and write data but cannot drop tables; backups are tested by restoring them.',
String.raw`CREATE USER 'study_app'@'%' IDENTIFIED BY 'use-a-secret-from-config';
GRANT SELECT, INSERT, UPDATE, DELETE ON courses.* TO 'study_app'@'%';
SHOW GRANTS FOR 'study_app'@'%';

# Backup (consistent snapshot for InnoDB) and restore
mysqldump --single-transaction --routines -u root -p courses > courses.sql
mysql -u root -p courses_restore < courses.sql`,
      'Create an app user with only data privileges, then back up your database and restore it into a new one.',
      'Why use --single-transaction with mysqldump on InnoDB?',
      'It takes a consistent snapshot without locking tables, so the app keeps working during the backup.'),
    L('Connecting Spring Boot to MySQL',
      'Configure a Spring Boot app to use MySQL through Spring Data JPA.',
      'The JDBC URL, user and password come from environment variables, so no secret is stored in the code.',
String.raw`<!-- pom.xml -->
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>

# application.yml
spring:
  datasource:
    url: ${'$'}{DB_URL:jdbc:mysql://localhost:3306/courses}
    username: ${'$'}{DB_USER:study_app}
    password: ${'$'}{DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate`,
      'Connect your Spring Boot API to the Docker MySQL and list learners from a repository.',
      'Why use ddl-auto: validate instead of update?',
      'validate checks the schema matches the entities without changing it. Schema changes should come from reviewed migrations (Flyway or Liquibase).'),
  ],
});

M.push({
  id: 'web-patterns', title: 'Web patterns', cat: 'Web', code: '09a · WEB',
  desc: 'Reusable designs for web applications: client-server, MVC, REST resources, rendering choices, pagination, caching, authentication and UI state patterns.',
  outcome: 'Choose and explain the right pattern for common web problems and recognise them in real code.',
  jobSkills: ['Web application architecture', 'REST APIs', 'Modern web frameworks'],
  sourceUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview', sourceLabel: 'MDN · Client-server overview',
  example: 'A React client sends a typed request to a Spring Boot endpoint, which validates it, saves it through a repository and returns a resource representation.',
  exercise: 'Draw the request path of one feature in your project through each layer, and name the pattern used at each step.',
  quiz: 'What is the API boundary responsible for?',
  quizChoices: ['A defined contract between client and server', 'Rendering every browser element', 'Replacing database constraints'], answer: 0,
  lessons: [
    L('Client-server and layered architecture',
      'Separate the browser, the API and the database, and split the server into layers.',
      'The browser never talks to MySQL directly. It calls the API, and the API enforces the rules.',
String.raw`Browser (React)  --HTTP/JSON-->  Controller   web: parse, validate, status codes
                                   Service      business rules, transactions
                                   Repository   data access (JPA)
                                   Database     MySQL
Each layer only talks to the one below it.`,
      'Sketch the layers of your Task Tracker API and list one responsibility of each.',
      'Why must validation happen on the server even if the browser validates too?',
      'Anyone can send requests directly to the API, bypassing the browser. The server is the only place rules can be enforced.'),
    L('Model-View-Controller',
      'Recognise MVC and its modern variants on the server and in the browser.',
      'In Spring MVC, the controller handles the request, the model holds data, and the view (a template or JSON) presents it. React components play the "view" role in the browser.',
String.raw`@Controller
class CourseController {
    @GetMapping("/courses")
    String list(Model model) {               // Controller
        model.addAttribute("courses", service.findAll());   // Model
        return "courses";                     // View: templates/courses.html
    }
}`,
      'Find the model, view and controller in a Spring Boot or React project you have.',
      'What problem does separating model, view and controller solve?',
      'Each part can change independently: you can redesign the view without touching business rules, and test logic without a browser.'),
    L('Resource-oriented REST design',
      'Design URLs around resources and use HTTP methods consistently.',
      'Lessons belong to modules, so they are nested; actions become state changes on a resource.',
String.raw`GET    /api/modules                    list modules
GET    /api/modules/oop/lessons        lessons in a module
POST   /api/progress                   record progress (201 Created)
PATCH  /api/progress/42                change status
Avoid verbs in URLs:  POST /api/markLessonDone  ->  PATCH /api/progress/42`,
      'Redesign three verb-style URLs from an old project into resource-style URLs.',
      'Why are nouns preferred over verbs in REST URLs?',
      'The HTTP method already says what happens. Nouns keep the API predictable: the same resource supports GET, PUT, PATCH and DELETE.'),
    L('Rendering: SPA, MPA and server-side rendering',
      'Compare single-page apps, multi-page apps and server rendering.',
      'This study app is a multi-page app with client-side rendering on each page. A React SPA loads once and swaps views; Next.js can render React on the server for fast first loads.',
String.raw`Pattern      First load   Navigation   SEO     Example
MPA          fast         full reload  easy    classic Spring MVC + Thymeleaf
SPA          slower       instant      harder  React + Vite + REST API
SSR / SSG    fast         instant*     easy    Next.js, Remix
* after hydration`,
      'Decide which pattern suits: a blog, an admin dashboard and an online shop, and justify each.',
      'What is hydration?',
      'The browser attaches JavaScript behaviour to HTML that the server already rendered, making it interactive.'),
    L('Pagination, filtering and sorting',
      'Return large lists in pages and let clients filter and sort through query parameters.',
      'Spring Data returns a Page with the items and the total count; the client shows "Page 2 of 9".',
String.raw`GET /api/lessons?module=oop&status=done&sort=title,asc&page=1&size=20

@GetMapping("/api/lessons")
Page<LessonDto> list(@RequestParam(required = false) String module, Pageable pageable) {
    return service.find(module, pageable);
}
// Response: { "content": [...], "totalElements": 173, "number": 1, "size": 20 }`,
      'Add paging to a list endpoint and a "Next page" button in the UI.',
      'Why not return all rows and let the client page through them?',
      'With many rows it wastes memory, bandwidth and time on both sides. Paging keeps each response small and fast.'),
    L('Caching',
      'Use HTTP caching and validators to avoid sending the same data twice.',
      'Module content rarely changes, so the server sends an ETag. The browser asks "has it changed?" and gets 304 Not Modified when it has not.',
String.raw`HTTP/1.1 200 OK
Cache-Control: public, max-age=3600
ETag: "modules-v12"

GET /api/modules
If-None-Match: "modules-v12"
-> 304 Not Modified (no body)

Never cache personal data publicly: Cache-Control: private, no-store`,
      'Add Cache-Control headers to one endpoint that serves static content, and check them in DevTools.',
      'Why should responses containing personal data use no-store or private?',
      'Shared caches such as proxies or CDNs could otherwise store them and serve one user\'s data to another.'),
    L('Authentication patterns: sessions and tokens',
      'Compare cookie sessions with token-based authentication.',
      'This app uses an HttpOnly session cookie. Many SPAs and mobile apps use short-lived access tokens (often JWTs) with refresh tokens.',
String.raw`Session cookie                     Token (e.g. JWT)
server stores session state        state inside the signed token
browser sends cookie automatically client sends Authorization header
HttpOnly: JS cannot read it        must be stored safely by the client
needs CSRF protection (SameSite)   needs expiry + revocation strategy`,
      'Write down which pattern your project uses and one risk it must defend against.',
      'Why do cookie-based sessions need CSRF protection?',
      'Browsers send cookies automatically, even on requests started by another site. SameSite cookies or CSRF tokens stop those forged requests.'),
    L('UI state patterns: loading, empty, error',
      'Design every data view for all its states, and keep state in one place.',
      'A predictable screen always shows one of four states, which also helps users who find surprises stressful.',
String.raw`function Lessons() {
  const { data, error, isLoading } = useLessons();
  if (isLoading) return <p>Loading lessons…</p>;
  if (error) return <p role="alert">Could not load lessons. <button>Try again</button></p>;
  if (data.length === 0) return <p>No lessons yet. Start with the first module.</p>;
  return <LessonList lessons={data} />;
}`,
      'Add a clear empty state and error state to one list in your project.',
      'Why design an explicit empty state?',
      'Without one, an empty list looks like a broken page. A clear message and next action tells the user what to do.'),
  ],
});

M.push({
  id: 'cloud-frameworks', title: 'Cloud frameworks with Spring Boot', cat: 'Java', code: '10a · CLOUD',
  desc: 'Use Spring Boot as a cloud framework: auto-configuration, external configuration, health and metrics, containers, deployment, Spring Cloud and resilience.',
  outcome: 'Package a Spring Boot service for the cloud, configure it per environment, monitor it and make it resilient to failures.',
  jobSkills: ['Spring Boot', 'Cloud platforms (AWS, Azure, GCP)', 'Docker and CI/CD'],
  sourceUrl: 'https://docs.spring.io/spring-boot/reference/', sourceLabel: 'Spring Boot reference',
  example: 'The same Spring Boot jar runs on a laptop with a local MySQL and in the cloud with a managed database, only the environment variables change.',
  exercise: 'Containerise your Spring Boot API, configure it entirely through environment variables, expose health checks, and deploy it to a free cloud tier.',
  quiz: 'Where should a cloud app\'s database password come from?',
  quizChoices: ['The environment or a secret manager', 'A constant in the Java code', 'The README'], answer: 0,
  lessons: [
    L('Starters and auto-configuration',
      'Understand how Spring Boot starters and auto-configuration set up an app for you.',
      'Adding spring-boot-starter-web brings an embedded Tomcat, Spring MVC and JSON support, configured automatically.',
String.raw`<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

@SpringBootApplication   // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class StudyDeskApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyDeskApplication.class, args);
    }
}
# See what was auto-configured:  java -jar app.jar --debug`,
      'Create a project at start.spring.io with Web and Actuator, run it, and read the auto-configuration report.',
      'What does auto-configuration do when you add a MySQL driver and spring-boot-starter-data-jpa?',
      'It creates a DataSource, a connection pool and JPA beans using your configured URL, so you do not write that setup yourself.'),
    L('External configuration and profiles',
      'Configure the same build differently for each environment, following the twelve-factor approach.',
      'Profiles hold differences between dev and prod; environment variables override everything and hold secrets.',
String.raw`# application.yml (defaults)
app:
  welcome-message: Welcome to Study Desk
---
spring.config.activate.on-profile: prod
logging.level.root: WARN

# Typed configuration
@ConfigurationProperties(prefix = "app")
record AppProperties(String welcomeMessage) {}

# Run:  SPRING_PROFILES_ACTIVE=prod APP_WELCOME_MESSAGE="Hi" java -jar app.jar`,
      'Add a dev and a prod profile and a typed @ConfigurationProperties class.',
      'Why should configuration live outside the code?',
      'One tested build can be deployed anywhere, and secrets never end up in the repository.'),
    L('Health, metrics and observability',
      'Expose health and metrics with Actuator so platforms and people can see how the app is doing.',
      'A cloud platform restarts the app when /actuator/health/liveness fails and stops sending traffic while readiness is down.',
String.raw`management:
  endpoints.web.exposure.include: health,info,metrics,prometheus
  endpoint.health.probes.enabled: true

GET /actuator/health/liveness    -> {"status":"UP"}
GET /actuator/health/readiness   -> {"status":"UP"}
GET /actuator/metrics/http.server.requests`,
      'Enable probes and check the readiness endpoint while your database is stopped.',
      'What is the difference between liveness and readiness?',
      'Liveness says the app should be restarted if it fails; readiness says whether it can take traffic right now (for example, while starting up).'),
    L('Containers and images',
      'Build a container image for a Spring Boot app, with or without a Dockerfile.',
      'Spring Boot can build an image with Cloud Native Buildpacks; a Dockerfile gives more control.',
String.raw`# Buildpacks: no Dockerfile needed
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=study-desk-api

docker run -p 8080:8080 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/courses \
  -e DB_USER=study_app -e DB_PASSWORD=... \
  study-desk-api`,
      'Build an image with buildpacks and run it against your Docker MySQL.',
      'Why should a container run as a non-root user?',
      'If the app is compromised, the attacker has fewer privileges inside the container and on the host.'),
    L('Deploying to the cloud',
      'Deploy a Spring Boot app to a managed platform and connect it to a managed MySQL.',
      'Azure App Service, AWS Elastic Beanstalk or App Runner, and Google Cloud Run all run Spring Boot jars or images; managed MySQL services handle backups.',
String.raw`Typical deployment
1. CI builds and tests on every push
2. CI builds the image and pushes it to a registry
3. Platform pulls the image and starts it with env vars and secrets
4. Health checks decide when traffic is sent
5. Logs and metrics go to the platform's monitoring

Managed MySQL: Amazon RDS, Azure Database for MySQL, Cloud SQL`,
      'Deploy your API to one free tier and write the steps in your README.',
      'What does a managed database service do for you?',
      'It handles servers, patching, backups and failover, so you manage only the schema, data and access.'),
    L('Spring Cloud basics',
      'Know what Spring Cloud adds for systems made of several services.',
      'When one app becomes several services, they need central configuration, a way to find each other and a single entry point.',
String.raw`Spring Cloud project      Purpose
Spring Cloud Config       central configuration for many services
Spring Cloud Gateway      one entry point: routing, rate limits, auth
Service discovery         services find each other (Eureka, Kubernetes)
OpenFeign                 declarative HTTP clients
Spring Cloud Stream       messaging with Kafka or RabbitMQ`,
      'Draw a design with a gateway, a courses service and a progress service. Where does configuration live?',
      'Should a beginner project start with microservices?',
      'Usually not. A well-structured single application is simpler to build and run; split it only when there is a real reason.'),
    L('Resilience: timeouts, retries and circuit breakers',
      'Keep a service working when something it depends on is slow or down.',
      'The AI tutor service calls a model API. A timeout and circuit breaker stop slow calls from tying up the whole app.',
String.raw`@Bean
RestClient modelClient(RestClient.Builder builder) {
    var factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(2000);
    factory.setReadTimeout(10000);
    return builder.requestFactory(factory).baseUrl("https://models.example").build();
}

// Resilience4j (spring-cloud-starter-circuitbreaker-resilience4j)
@CircuitBreaker(name = "model", fallbackMethod = "unavailable")
String ask(String q) { return client.ask(q); }
String unavailable(String q, Throwable t) { return "The tutor is unavailable. Try again soon."; }`,
      'Add a timeout and a fallback to one outbound call in your project.',
      'Why can retries make an outage worse?',
      'Many clients retrying at once multiplies the load on a service that is already struggling. Use limited retries with backoff and a circuit breaker.'),
  ],
});

M.push({
  id: 'frontend-react', title: 'Frontend development: React and Tailwind CSS', cat: 'Web', code: '09b · FRONTEND',
  desc: 'Build modern interfaces with React and style them with Tailwind CSS: components, hooks, forms, routing, accessibility, dark mode and testing.',
  outcome: 'Build an accessible, responsive React + Tailwind front end that talks to a Spring Boot API, with component tests.',
  jobSkills: ['React', 'HTML, CSS and Tailwind CSS', 'Modern web frameworks'],
  sourceUrl: 'https://react.dev/learn', sourceLabel: 'React · Learn',
  example: 'A lesson card component is written once in React, styled with Tailwind classes, reused across the app and tested with Testing Library.',
  exercise: 'Build the front end of your Task Tracker with React, Vite and Tailwind CSS: a list, a form, a detail page, dark mode, and five component tests.',
  quiz: 'In Tailwind CSS, what does the class "md:flex" do?',
  quizChoices: ['Applies display: flex from the medium breakpoint upwards', 'Makes the element flex only on mobile', 'Adds a medium margin'], answer: 0,
  lessons: [
    L('Set up React with Vite and Tailwind CSS',
      'Create a React project and add Tailwind CSS.',
      'Vite starts a React project in seconds; Tailwind v4 is added with one plugin and one import.',
String.raw`npm create vite@latest study-ui -- --template react-ts
cd study-ui
npm install tailwindcss @tailwindcss/vite

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });

/* src/index.css */
@import "tailwindcss";`,
      'Create the project, add a heading with class "text-3xl font-bold", and run npm run dev.',
      'Where do Tailwind\'s styles come from if you never write CSS rules?',
      'Tailwind scans your files for class names and generates only the CSS for the utilities you use.'),
    L('Utility-first styling',
      'Style components with Tailwind utility classes for spacing, colour, type and layout.',
      'A calm lesson card: soft background, generous padding, readable text, a clear focus ring.',
String.raw`function LessonCard({ title, minutes, done }) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">About {minutes} minutes</p>
      <button className="mt-4 rounded-lg bg-teal-700 px-4 py-2 font-medium text-white
                         hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-teal-700">
        {done ? 'Review' : 'Start'}
      </button>
    </article>
  );
}`,
      'Build three cards with different states using only Tailwind classes.',
      'How do you avoid repeating the same long class list everywhere?',
      'Put it in a reusable React component (like LessonCard or Button) rather than copying classes.'),
    L('Responsive layout and dark mode',
      'Use breakpoint prefixes for responsive design and the dark: variant for dark mode.',
      'One column on phones, two on tablets, three on desktops; colours switch in dark mode.',
String.raw`<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {lessons.map(l => <LessonCard key={l.id} {...l} />)}
</div>

<body className="bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">

/* Respect reduced motion */
<div className="transition motion-reduce:transition-none">`,
      'Make your card grid responsive and add dark mode that follows the system setting.',
      'Tailwind is "mobile first". What does that mean for unprefixed classes?',
      'Unprefixed classes apply to all sizes; prefixed ones like md: apply from that breakpoint upwards, so you design for small screens first.'),
    L('Components, props and composition',
      'Split the UI into small components and compose them.',
      'A Layout component wraps every page, so headings and navigation are always in the same place — predictable for every learner.',
String.raw`function Layout({ title, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <main className="mt-6 space-y-4">{children}</main>
    </div>
  );
}

function ModulePage({ module }) {
  return (
    <Layout title={module.title}>
      {module.lessons.map(l => <LessonCard key={l.id} {...l} />)}
    </Layout>
  );
}`,
      'Create Layout, Button and Card components and rebuild one page with them.',
      'What is the "children" prop?',
      'Whatever is placed between a component\'s opening and closing tags, letting the component wrap other content.'),
    L('State and effects with hooks',
      'Manage state with useState and useReducer, and load data with useEffect.',
      'Lesson progress has several actions, so a reducer keeps the logic in one testable function.',
String.raw`function progressReducer(state, action) {
  switch (action.type) {
    case 'done':  return { ...state, [action.id]: 'done' };
    case 'skip':  return { ...state, [action.id]: 'skipped' };
    case 'reset': return {};
    default:      return state;
  }
}

function Lessons({ lessons }) {
  const [progress, dispatch] = useReducer(progressReducer, {});
  return lessons.map(l => (
    <button key={l.id} onClick={() => dispatch({ type: 'done', id: l.id })}>
      {l.title} {progress[l.id] === 'done' && '✓'}
    </button>
  ));
}`,
      'Solve the "progress reducer" challenge in the practice lab, then use it in a component.',
      'Why must a reducer return a new object instead of changing the old one?',
      'React compares references to decide whether to re-render. Mutating the old object can leave the screen out of date.'),
    L('Forms and accessibility in React',
      'Build accessible forms with labels, error messages and keyboard support.',
      'Every input has a label; errors are announced to screen readers and linked to the field.',
String.raw`function NoteForm({ onSave }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault();
        if (!title.trim()) return setError('Give your note a title.');
        onSave({ title }); }}>
      <label htmlFor="title" className="block font-medium">Title</label>
      <input id="title" value={title} onChange={e => setTitle(e.target.value)}
             aria-invalid={!!error} aria-describedby="title-error"
             className="mt-1 w-full rounded-lg border px-3 py-2" />
      <p id="title-error" role="alert" className="text-sm text-red-700">{error}</p>
      <button type="submit" className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-white">Save</button>
    </form>
  );
}`,
      'Navigate your form with only the keyboard and a screen reader (VoiceOver or NVDA). Fix anything confusing.',
      'Why connect the error message with aria-describedby?',
      'Screen readers then read the error when the field is focused, so the user knows what to fix.'),
    L('Routing and calling the API',
      'Add pages with React Router and fetch data from a Spring Boot API.',
      'Each module has its own URL, so learners can bookmark and return to exactly where they were.',
String.raw`// main.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/modules/:id" element={<ModulePage />} />
  </Routes>
</BrowserRouter>

// ModulePage.tsx
const { id } = useParams();
const [module, setModule] = useState(null);
useEffect(() => {
  fetch('/api/modules/' + encodeURIComponent(id))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(setModule)
    .catch(() => setModule('error'));
}, [id]);`,
      'Add a detail page for one item from your API and a "Back to list" link.',
      'How does Vite avoid CORS problems with a local Spring Boot API during development?',
      'Its dev server can proxy /api requests to Spring Boot (server.proxy in vite.config), so the browser sees one origin.'),
    L('Testing React components',
      'Test components the way users use them with Testing Library.',
      'The test finds the button by its accessible name and checks the result, without relying on class names.',
String.raw`import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('marks a lesson as done', async () => {
  render(<Lessons lessons={[{ id: 1, title: 'Classes' }]} />);
  await userEvent.click(screen.getByRole('button', { name: /classes/i }));
  expect(screen.getByRole('button', { name: /classes ✓/i })).toBeInTheDocument();
});`,
      'Write tests for your form: an empty title shows an error, a valid title calls onSave.',
      'Why query by role and accessible name rather than by CSS class?',
      'It tests what users actually experience, and it fails if the component becomes inaccessible.'),
  ],
});

M.push({
  id: 'backend-spring', title: 'Backend development with Java and Spring', cat: 'Java', code: '10b · BACKEND',
  desc: 'Build Java back ends with the Spring Framework and Spring Boot: dependency injection, layered services, JPA with MySQL, transactions, Spring Security and testing.',
  outcome: 'Build a secure, tested Spring Boot back end on MySQL with clear layers and transactions.',
  jobSkills: ['Java and Spring Boot', 'Spring Security', 'Databases (MySQL)'],
  sourceUrl: 'https://docs.spring.io/spring-framework/reference/', sourceLabel: 'Spring Framework reference',
  example: 'A course-progress service runs in a transaction, saves to MySQL through JPA, is protected by Spring Security, and is tested against a real MySQL in a container.',
  exercise: 'Extend your Task Tracker API: add Spring Security login, a service with @Transactional methods, MySQL persistence and a Testcontainers integration test.',
  quiz: 'What does Spring\'s IoC container do?',
  quizChoices: ['Creates objects (beans) and injects their dependencies', 'Compiles Java code', 'Stores data in MySQL'], answer: 0,
  lessons: [
    L('Inversion of control and beans',
      'Understand how Spring creates and wires objects for you.',
      'Classes declare what they need in their constructor; Spring creates one instance of each and passes them in.',
String.raw`@Repository
class LessonRepository { /* data access */ }

@Service
class ProgressService {
    private final LessonRepository lessons;
    ProgressService(LessonRepository lessons) {   // constructor injection
        this.lessons = lessons;
    }
}

@Configuration
class ClockConfig {
    @Bean Clock clock() { return Clock.systemUTC(); }   // a bean you define yourself
}`,
      'Inject a Clock bean into a service and replace it with a fixed clock in a test.',
      'Why is constructor injection preferred over field injection (@Autowired on fields)?',
      'Dependencies are explicit, can be final, and the class can be created in a plain unit test without Spring.'),
    L('Layers: controller, service, repository',
      'Keep each layer focused, with DTOs at the web boundary.',
      'The controller translates HTTP, the service applies rules, the repository talks to the database.',
String.raw`@RestController
@RequestMapping("/api/progress")
class ProgressController {
    private final ProgressService service;
    ProgressController(ProgressService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ProgressDto record(@Valid @RequestBody RecordProgress req, Principal me) {
        return service.record(me.getName(), req.lessonId(), req.status());
    }
}
record RecordProgress(@NotNull Long lessonId, @NotNull Status status) {}`,
      'Move any business logic you find in a controller into a service, with a unit test.',
      'Why should controllers not contain business rules?',
      'Rules in services can be reused and tested without HTTP, and controllers stay simple translators.'),
    L('Spring Data JPA with MySQL',
      'Map entities to MySQL tables and write repository queries.',
      'An entity maps to a table; a repository method name becomes a query.',
String.raw`@Entity
@Table(name = "progress")
class Progress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @ManyToOne(optional = false) Learner learner;
    @ManyToOne(optional = false) Lesson lesson;
    @Enumerated(EnumType.STRING) Status status;
}

interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByLearnerUsernameAndStatus(String username, Status status);
    @Query("select count(p) from Progress p where p.learner.id = :id and p.status = 'DONE'")
    long countDone(@Param("id") Long learnerId);
}`,
      'Add an entity and a repository for your project and query it from a service.',
      'Why store enums with EnumType.STRING rather than ORDINAL?',
      'ORDINAL stores positions, so reordering or adding enum values silently corrupts existing data. STRING stores the names.'),
    L('Transactions',
      'Use @Transactional so related changes commit or roll back together.',
      'Completing a module saves progress and awards a badge. If the badge fails, the progress change is rolled back too.',
String.raw`@Service
class CompletionService {
    @Transactional
    public void completeModule(Long learnerId, Long moduleId) {
        progress.markModuleDone(learnerId, moduleId);
        badges.award(learnerId, "module-" + moduleId);   // if this throws, both roll back
    }

    @Transactional(readOnly = true)
    public Report report(Long learnerId) { return reports.build(learnerId); }
}`,
      'Write a test that forces the second step to fail and checks the first was rolled back.',
      'Why does calling a @Transactional method from another method in the same class not start a transaction?',
      'Spring applies transactions through a proxy. A call within the same object bypasses the proxy, so the annotation has no effect.'),
    L('Spring Security basics',
      'Protect endpoints with authentication and role-based rules, and hash passwords.',
      'Anyone can read modules; only logged-in learners can record progress; only admins can edit content.',
String.raw`@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/modules/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults())
            .build();
    }
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}`,
      'Secure your API and write a test proving a normal user gets 403 on an admin endpoint.',
      'Why is hiding the admin button in the UI not enough?',
      'Anyone can call the API directly. Access must be checked on the server for every request.'),
    L('Errors and validation in one place',
      'Return consistent, helpful error responses using Problem Details.',
      'Spring Boot can return RFC 9457 Problem Details, so every error has the same shape.',
String.raw`# application.yml
spring.mvc.problemdetails.enabled: true

@RestControllerAdvice
class Errors {
    @ExceptionHandler(LessonNotFound.class)
    ProblemDetail notFound(LessonNotFound e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        pd.setTitle("Lesson not found");
        return pd;
    }
}
// -> {"type":"about:blank","title":"Lesson not found","status":404,"detail":"..."}`,
      'Make every error in your API return Problem Details and test one 404 and one 400.',
      'Why does a consistent error format help front-end developers?',
      'They can handle every error the same way and show clear messages without special cases.'),
    L('Integration tests with a real MySQL',
      'Test the back end against a real MySQL database in a container with Testcontainers.',
      'An in-memory database can hide MySQL-specific problems. Testcontainers starts real MySQL for the test run.',
String.raw`@SpringBootTest
@Testcontainers
class ProgressRepositoryIT {
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @Autowired ProgressRepository repo;

    @Test
    void countsCompletedLessons() {
        // arrange data, then:
        assertEquals(2, repo.countDone(learnerId));
    }
}`,
      'Add one Testcontainers test to your project and run it with mvn verify.',
      'Why test against the same database engine you use in production?',
      'SQL dialects, types and behaviour differ. Testing on MySQL catches problems that an in-memory database would hide.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
