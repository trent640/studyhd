/* Testing, databases, web, REST APIs. */
(function (M, L) {

M.push({
  id: 'testing', title: 'Testing', cat: 'Engineering', code: '07 · ENGINEERING',
  desc: 'Write unit and integration tests with JUnit 5 and Mockito, practise TDD, and keep a test suite fast and reliable.',
  outcome: 'Cover a feature with focused unit tests, one integration test, and run them automatically on every push.',
  jobSkills: ['Writing unit, integration or automated tests (Apple)', 'Unit and integration testing methodologies (Twilio)', 'Automated unit testing (Accenture)'],
  sourceUrl: 'https://junit.org/junit5/docs/current/user-guide/', sourceLabel: 'JUnit 5 · User guide',
  example: 'A bug report says fines are charged for same-day returns. You first write a failing test that reproduces it, then fix the code. The test stops the bug coming back.',
  exercise: 'Add tests to a portfolio project until every public method of one service class is covered, including two failure cases.',
  quiz: 'Why write a test that fails before you write the code?',
  quizChoices: ['It proves the test can detect the missing behaviour', 'It makes the build faster', 'It removes the need for code review'], answer: 0,
  lessons: [
    L('Unit tests with JUnit 5',
      'Write small, independent tests with the Arrange-Act-Assert structure.',
      'Each test checks one behaviour of FineCalculator and has a name that reads like a sentence.',
String.raw`class FineCalculatorTest {
    private final FineCalculator calc = new FineCalculator(20); // 20c per day

    @Test
    void noFineWhenReturnedOnDueDate() {
        LocalDate due = LocalDate.of(2026, 3, 1);
        assertEquals(0, calc.fineCents(due, due));
    }

    @Test
    void chargesPerDayLate() {
        LocalDate due = LocalDate.of(2026, 3, 1);
        assertEquals(60, calc.fineCents(due, due.plusDays(3)));
    }

    @Test
    void rejectsNullDates() {
        assertThrows(NullPointerException.class, () -> calc.fineCents(null, null));
    }
}`,
      'Write a parameterised test (@ParameterizedTest with @CsvSource) for five day counts and expected fines.',
      'What makes a unit test a good one?',
      'It is fast, independent of other tests, checks one behaviour, has a descriptive name, and fails for one clear reason.'),
    L('Test-driven development',
      'Use red, green, refactor to design code through its tests.',
      'Red: write a test for isStrongPassword that fails. Green: write the simplest code to pass. Refactor: tidy up with the tests still green.',
String.raw`// RED
@Test
void passwordNeedsEightCharacters() {
    assertFalse(Passwords.isStrong("abc1"));
    assertTrue(Passwords.isStrong("abcdefg1"));
}

// GREEN
static boolean isStrong(String p) {
    return p.length() >= 8 && p.chars().anyMatch(Character::isDigit);
}

// REFACTOR: extract rules, add more tests, keep them green`,
      'Use TDD to build a Stack class: push, pop, peek and isEmpty, one test at a time.',
      'Why write the simplest code that passes, even if you know more is needed?',
      'It keeps each step small and verified. The next failing test drives the next piece of behaviour, so you never write untested code.'),
    L('Mocks and stubs with Mockito',
      'Isolate a class from slow or external dependencies by replacing them with test doubles.',
      'OrderService calls a PaymentGateway. The test mocks the gateway and verifies it was called with the right amount.',
String.raw`@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock PaymentGateway gateway;
    @InjectMocks OrderService service;

    @Test
    void chargesTheOrderTotal() {
        when(gateway.charge("c1", 500)).thenReturn(true);

        assertTrue(service.placeOrder("c1", 500));
        verify(gateway).charge("c1", 500);
    }
}`,
      'Add a test where the gateway throws an exception. What should placeOrder do?',
      'What is the risk of mocking too much?',
      'Tests end up checking your mocks instead of real behaviour, and they break on every refactor. Mock boundaries (network, database, clock), not simple value objects.'),
    L('Integration tests',
      'Test how components work together, such as a service with a real database.',
      'A Spring Boot test starts the application context and checks that saving and loading a Book works against an in-memory database.',
String.raw`@DataJpaTest
class BookRepositoryTest {
    @Autowired BookRepository books;

    @Test
    void findsBooksByTitleIgnoringCase() {
        books.save(new Book("Dune", "Frank Herbert"));
        assertEquals(1, books.findByTitleContainingIgnoreCase("dune").size());
    }
}`,
      'Write an integration test for a REST endpoint using @WebMvcTest and MockMvc.',
      'How is an integration test different from a unit test?',
      'A unit test checks one class in isolation; an integration test checks real collaborators together (database, web layer), so it is slower but catches wiring and configuration bugs.'),
    L('Testing JavaScript with Jest',
      'Write unit tests for front-end and Node.js code with Jest.',
      'A formatPrice helper is tested for normal values, zero and rounding.',
String.raw`// price.js
export function formatPrice(cents) {
  return '€' + (cents / 100).toFixed(2);
}

// price.test.js
import { formatPrice } from './price.js';

describe('formatPrice', () => {
  test('formats whole euros', () => expect(formatPrice(500)).toBe('€5.00'));
  test('formats zero', () => expect(formatPrice(0)).toBe('€0.00'));
  test('keeps cents', () => expect(formatPrice(1999)).toBe('€19.99'));
});`,
      'Add a test for negative amounts. Decide what the function should do and implement it.',
      'What does describe() add to a test file?',
      'It groups related tests under a name, so output is easier to read and shared setup (beforeEach) applies to the group.'),
    L('Coverage, CI and flaky tests',
      'Run tests on every push, read coverage reports critically, and fix flaky tests quickly.',
      'GitHub Actions runs mvn verify on each pull request. JaCoCo reports coverage; the team treats low coverage on new code as a review question, not a hard rule.',
String.raw`# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - run: mvn -B verify`,
      'Add this workflow to your project and make a pull request fail on purpose by breaking a test.',
      'Does 100% line coverage mean the code has no bugs?',
      'No. Coverage shows which lines ran, not whether the assertions check the right things. A test with no assertions still adds coverage.'),
  ],
});

M.push({
  id: 'databases', title: 'Databases and SQL', cat: 'Data', code: '08 · DATA',
  desc: 'Design relational schemas and write the SQL that internship assessments test: filters, joins, aggregates, subqueries and window functions.',
  outcome: 'Design a normalised schema for a small app and answer business questions with correct, efficient SQL.',
  jobSkills: ['SQL questions in online assessments (IBM)', 'Experience with databases (Autodesk)', 'Relational data modelling'],
  sourceUrl: 'https://www.postgresql.org/docs/current/tutorial.html', sourceLabel: 'PostgreSQL tutorial',
  example: 'A library app stores books, members and loans. One query finds every overdue loan with the member\'s email so the app can send reminders.',
  exercise: 'Design tables for a student society app (members, events, sign-ups). Write queries for: events with no sign-ups, top 3 events by attendance, and members who attended every event.',
  quiz: 'Which clause filters groups after aggregation?',
  quizChoices: ['HAVING', 'WHERE', 'ORDER BY'], answer: 0,
  lessons: [
    L('Tables, keys and normalisation',
      'Design tables with primary keys, foreign keys and constraints, and remove duplicated data.',
      'Storing a member\'s email on every loan row means updating many rows when it changes. A separate members table stores it once.',
String.raw`CREATE TABLE members (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE books (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  isbn       VARCHAR(13) UNIQUE
);
CREATE TABLE loans (
  id          SERIAL PRIMARY KEY,
  book_id     INT NOT NULL REFERENCES books(id),
  member_id   INT NOT NULL REFERENCES members(id),
  loaned_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_on      DATE NOT NULL,
  returned_on DATE,
  CHECK (due_on >= loaned_on)
);`,
      'Add a many-to-many relationship between books and authors with a book_authors table.',
      'What problem does normalisation solve?',
      'It removes duplicated data so each fact is stored once, which prevents update, insert and delete anomalies.'),
    L('SELECT, WHERE and ORDER BY',
      'Retrieve and filter rows, handle NULL correctly, and sort results.',
      'Find loans that are overdue and not yet returned, oldest first.',
String.raw`SELECT id, book_id, member_id, due_on
FROM loans
WHERE returned_on IS NULL          -- not "= NULL"
  AND due_on < CURRENT_DATE
ORDER BY due_on ASC
LIMIT 20;`,
      'Find members whose email ends in "@tcd.ie" or "@ucd.ie", sorted by name.',
      'Why does WHERE returned_on = NULL return no rows?',
      'NULL means unknown, so any comparison with = gives unknown, not true. Use IS NULL or IS NOT NULL.'),
    L('Aggregates: GROUP BY and HAVING',
      'Summarise data with COUNT, SUM, AVG, MIN and MAX, and filter groups with HAVING.',
      'Count loans per member and keep only members with more than three.',
String.raw`SELECT member_id, COUNT(*) AS loan_count
FROM loans
GROUP BY member_id
HAVING COUNT(*) > 3
ORDER BY loan_count DESC;`,
      'Find the average loan length in days for each book, only for books borrowed at least twice.',
      'What is the difference between WHERE and HAVING?',
      'WHERE filters individual rows before grouping; HAVING filters groups after aggregation, so it can use COUNT, SUM and other aggregates.'),
    L('Joins',
      'Combine tables with INNER, LEFT and self joins, and know which rows each keeps.',
      'A LEFT JOIN lists every book with its current borrower, or NULL if it is on the shelf.',
String.raw`-- Books and who has them (if anyone)
SELECT b.title, m.name AS borrower
FROM books b
LEFT JOIN loans l   ON l.book_id = b.id AND l.returned_on IS NULL
LEFT JOIN members m ON m.id = l.member_id
ORDER BY b.title;

-- Members who have never borrowed a book
SELECT m.name
FROM members m
LEFT JOIN loans l ON l.member_id = m.id
WHERE l.id IS NULL;`,
      'Write an INNER JOIN listing overdue books with the borrower\'s email.',
      'Why put l.returned_on IS NULL in the ON clause of the first query, not in WHERE?',
      'In ON, it only limits which loans can match, so every book still appears (with NULL for books on the shelf). In WHERE, a book whose loans were all returned would match those returned loans and then be filtered out, so it would vanish from the list.'),
    L('Subqueries, CTEs and window functions',
      'Break complex questions into steps with CTEs and rank rows with window functions.',
      'Find each member\'s most recent loan using ROW_NUMBER().',
String.raw`WITH ranked AS (
  SELECT l.*,
         ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY loaned_on DESC) AS rn
  FROM loans l
)
SELECT member_id, book_id, loaned_on
FROM ranked
WHERE rn = 1;`,
      'Use RANK() to find the top 3 most borrowed books, keeping ties.',
      'How is a window function different from GROUP BY?',
      'GROUP BY collapses rows into one per group. A window function computes a value across related rows but keeps every row in the result.'),
    L('Indexes and query plans',
      'Add indexes for frequent lookups and read EXPLAIN output to check they are used.',
      'Searching loans by member_id scans the whole table until an index exists on that column.',
String.raw`CREATE INDEX idx_loans_member ON loans (member_id);

EXPLAIN ANALYZE
SELECT * FROM loans WHERE member_id = 42;
-- Look for "Index Scan using idx_loans_member" instead of "Seq Scan"`,
      'Add a composite index for queries filtering on member_id and returned_on. Does column order matter?',
      'Why not index every column?',
      'Each index costs disk space and slows down INSERT, UPDATE and DELETE, because the index must be updated too. Index columns used in frequent filters, joins and sorts.'),
    L('Transactions and ACID',
      'Group statements so they succeed or fail together, and understand isolation.',
      'Borrowing a book inserts a loan and decrements available copies. If either fails, neither should happen.',
String.raw`BEGIN;
UPDATE books SET copies_available = copies_available - 1
  WHERE id = 7 AND copies_available > 0;
INSERT INTO loans (book_id, member_id, due_on)
  VALUES (7, 42, CURRENT_DATE + 14);
COMMIT;   -- or ROLLBACK on error`,
      'What happens if two members borrow the last copy at the same moment? How does the WHERE copies_available > 0 condition help?',
      'What does the A in ACID guarantee?',
      'Atomicity: all statements in a transaction take effect, or none do.'),
    L('Safe access from code',
      'Query a database from Java with parameters, least-privilege accounts and connection pooling.',
      'Concatenating user input into SQL allows SQL injection. A PreparedStatement sends the value separately from the query.',
String.raw`String sql = "SELECT id, title FROM books WHERE title ILIKE ?";
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, "%" + query + "%");
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            results.add(new BookSummary(rs.getLong("id"), rs.getString("title")));
        }
    }
}`,
      'Create a database user for your app that can SELECT, INSERT and UPDATE but cannot DROP tables.',
      'Why give the application\'s database user only the privileges it needs?',
      'If the app is compromised, the attacker is limited to those privileges. A read-only reporting user cannot delete data at all.'),
  ],
});

M.push({
  id: 'web-development', title: 'Web development', cat: 'Web', code: '09 · WEB',
  desc: 'Build accessible pages with HTML and CSS, add behaviour with JavaScript, and create React components that call an API.',
  outcome: 'Build a responsive, accessible React front end that loads data from a REST API and handles loading and error states.',
  jobSkills: ['Familiarity with modern web frameworks (Apple)', 'HTML/CSS, JavaScript, React or similar', 'Web development (Autodesk)'],
  sourceUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development', sourceLabel: 'MDN · Learn web development',
  example: 'A book search page uses semantic HTML, a CSS grid of results, and a React component that fetches /api/books?query=... as the user types.',
  exercise: 'Build a React page for your REST API with a list, a create form with validation, and visible loading and error states. Check it with the keyboard only.',
  quiz: 'Which element should wrap the main navigation links of a page?',
  quizChoices: ['<nav>', '<div class="nav">', '<section>'], answer: 0,
  lessons: [
    L('Semantic HTML and accessibility',
      'Structure pages with meaningful elements so browsers, search engines and screen readers understand them.',
      'A form with real <label> elements can be used with a screen reader and by clicking the label text.',
String.raw`<header>
  <nav aria-label="Main">
    <a href="/">Home</a> <a href="/books">Books</a>
  </nav>
</header>
<main>
  <h1>Find a book</h1>
  <form role="search">
    <label for="q">Title</label>
    <input id="q" name="q" type="search" required>
    <button type="submit">Search</button>
  </form>
</main>`,
      'Run your page through the browser\'s Lighthouse accessibility audit and fix every issue it reports.',
      'Why use a <button> instead of a clickable <div>?',
      'A button is focusable, works with Enter and Space, and is announced as a button by screen readers. A div needs extra code for all of that.'),
    L('CSS layout: flexbox and grid',
      'Lay out pages that adapt to phones and desktops.',
      'A card grid fills as many columns as fit, each at least 220px wide.',
String.raw`.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
@media (max-width: 600px) {
  .toolbar { flex-direction: column; align-items: stretch; }
}`,
      'Rebuild a page layout you like using only flexbox and grid. Test it at 375px wide.',
      'When do you choose grid over flexbox?',
      'Grid controls rows and columns together (two-dimensional layouts); flexbox arranges items along one axis, such as a toolbar or a row of buttons.'),
    L('JavaScript, the DOM and events',
      'Select elements, respond to events and update the page safely.',
      'A character counter updates as the user types. textContent (not innerHTML) avoids injecting HTML.',
String.raw`const input = document.querySelector('#bio');
const counter = document.querySelector('#bio-count');

input.addEventListener('input', () => {
  const left = 160 - input.value.length;
  counter.textContent = left + ' characters left';
  counter.classList.toggle('warning', left < 0);
});`,
      'Build a to-do list where clicking an item toggles it done, using one event listener on the list (event delegation).',
      'Why is element.innerHTML = userInput dangerous?',
      'It parses the input as HTML, so a value like <img src=x onerror=alert(1)> runs script (XSS). Use textContent for text.'),
    L('Asynchronous JavaScript and fetch',
      'Call APIs with fetch and async/await, and handle errors and loading states.',
      'fetch only rejects on network failure; a 404 or 500 still resolves, so you must check response.ok.',
String.raw`async function loadBooks(query) {
  const res = await fetch('/api/books?query=' + encodeURIComponent(query));
  if (!res.ok) {
    throw new Error('Request failed: ' + res.status);
  }
  return res.json();
}

try {
  const books = await loadBooks('dune');
  render(books);
} catch (err) {
  showError('Could not load books. Try again.');
}`,
      'Add a timeout to loadBooks using AbortController that cancels the request after 5 seconds.',
      'Why call encodeURIComponent on the query?',
      'It escapes characters like &, ? and spaces so the value cannot break or change the URL\'s structure.'),
    L('React components, props and state',
      'Build UIs from components that receive props and manage their own state.',
      'A BookList fetches on mount and shows loading, error or results.',
String.raw`function BookList({ query }) {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch('/api/books?query=' + encodeURIComponent(query))
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => { if (!cancelled) { setBooks(data); setStatus('done'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [query]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error') return <p role="alert">Could not load books.</p>;
  return <ul>{books.map(b => <li key={b.id}>{b.title}</li>)}</ul>;
}`,
      'Add a search input in a parent component and pass the query down as a prop.',
      'Why does each list item need a stable key?',
      'React uses keys to match items between renders. Stable keys (like IDs) keep state and DOM nodes attached to the right item; array indexes break when items are reordered.'),
    L('Forms and validation',
      'Validate input on the client for usability and on the server for safety.',
      'A sign-up form uses HTML constraints and shows a clear message next to the field.',
String.raw`function SignupForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    onSubmit({ email });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email}
             onChange={e => setEmail(e.target.value)}
             aria-invalid={!!error} aria-describedby="email-error" />
      <p id="email-error" role="alert">{error}</p>
      <button type="submit">Sign up</button>
    </form>
  );
}`,
      'Add a password field with a minimum length and a confirm-password check.',
      'If the client validates the email, does the server still need to?',
      'Yes. Anyone can bypass the browser and send requests directly, so the server must validate every input.'),
    L('Handling forms on the server with PHP',
      'Receive a form submission on the server, validate it, and respond safely.',
      'A contact form posts to contact.php. The script validates the fields, escapes output and stores the message with a prepared statement.',
String.raw`<?php
// contact.php
$name  = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');

$errors = [];
if ($name === '') $errors[] = 'Name is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email is not valid.';

if ($errors) {
    http_response_code(400);
    foreach ($errors as $e) echo '<p>' . htmlspecialchars($e) . '</p>';
    exit;
}

$pdo = new PDO(getenv('DB_DSN'), getenv('DB_USER'), getenv('DB_PASS'));
$stmt = $pdo->prepare('INSERT INTO messages (name, email) VALUES (?, ?)');
$stmt->execute([$name, $email]);
echo '<p>Thanks, ' . htmlspecialchars($name) . '!</p>';`,
      'Run it with php -S localhost:8000 and submit the form with an empty name and an invalid email.',
      'Why wrap output in htmlspecialchars()?',
      'It encodes characters like < and > so user input is shown as text instead of being run as HTML or script (XSS).'),
    L('How the web works',
      'Explain what happens between typing a URL and seeing a page, a common interview question.',
      'DNS finds the server, TCP and TLS set up a secure connection, the browser sends an HTTP request, the server responds, and the browser parses and renders.',
String.raw`1. DNS lookup        books.example.ie -> 203.0.113.10
2. TCP handshake     SYN, SYN-ACK, ACK
3. TLS handshake     certificate check, keys agreed
4. HTTP request      GET /books HTTP/1.1
5. Server            routing, database query, HTML/JSON response
6. Browser           parse HTML, fetch CSS/JS/images, layout, paint`,
      'Open your browser\'s Network tab, load a page, and identify the DNS, connection and download time for one request.',
      'What does HTTPS add on top of HTTP?',
      'Encryption and integrity via TLS, plus server authentication through certificates, so traffic cannot be read or altered in transit.'),
  ],
});

M.push({
  id: 'rest-apis', title: 'REST APIs with Spring Boot', cat: 'Java', code: '10 · BACKEND',
  desc: 'Design REST endpoints, build them with Spring Boot, persist data with Spring Data JPA, and test them.',
  outcome: 'Ship a documented, tested CRUD REST API in Java with validation and proper status codes.',
  jobSkills: ['Experience building or consuming REST APIs (Apple)', 'REST API development and testing (IQVIA)', 'Java and Spring Boot'],
  sourceUrl: 'https://spring.io/guides/gs/rest-service', sourceLabel: 'Spring · Building a RESTful web service',
  example: 'POST /api/books with a JSON body creates a book and returns 201 Created with its location; GET /api/books/99 for a missing book returns 404 with a clear message.',
  exercise: 'Build a Spring Boot task tracker API with create, list, update and delete endpoints, validation, a PostgreSQL database and MockMvc tests.',
  quiz: 'Which status code fits a successful POST that created a resource?',
  quizChoices: ['201 Created', '200 OK', '204 No Content'], answer: 0,
  lessons: [
    L('HTTP methods and status codes',
      'Use the right method and status code so clients can rely on your API.',
      'GET reads, POST creates, PUT replaces, PATCH updates part, DELETE removes. Status codes tell the client what happened.',
String.raw`GET    /api/books          200 OK            list
GET    /api/books/42       200 OK / 404      one book
POST   /api/books          201 Created       + Location header
PUT    /api/books/42       200 OK / 404      replace
DELETE /api/books/42       204 No Content

400 Bad Request     invalid input
401 Unauthorized    not logged in
403 Forbidden       logged in, not allowed
409 Conflict        duplicate ISBN
500 Server Error    bug on our side`,
      'Design the endpoints for a task tracker: tasks, comments on tasks, and marking a task done.',
      'Which methods should be idempotent?',
      'GET, PUT and DELETE: repeating the same request leaves the server in the same state. POST is not idempotent, because repeating it creates duplicates.'),
    L('A Spring Boot REST controller',
      'Map requests to methods, use DTOs, and keep controllers thin.',
      'BookController delegates to BookService and returns ResponseEntity with the right status.',
String.raw`@RestController
@RequestMapping("/api/books")
class BookController {
    private final BookService service;
    BookController(BookService service) { this.service = service; }

    @GetMapping
    List<BookDto> list() { return service.findAll(); }

    @GetMapping("/{id}")
    BookDto get(@PathVariable long id) { return service.findById(id); }

    @PostMapping
    ResponseEntity<BookDto> create(@Valid @RequestBody CreateBookRequest req) {
        BookDto created = service.create(req);
        return ResponseEntity.created(URI.create("/api/books/" + created.id())).body(created);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable long id) { service.delete(id); }
}`,
      'Generate a project at start.spring.io (Web, Validation, Data JPA, PostgreSQL) and add this controller.',
      'Why return DTOs instead of JPA entities from a controller?',
      'DTOs define a stable API contract, hide internal fields (like password hashes) and avoid lazy-loading and circular-reference problems when serialising entities.'),
    L('Validation and error handling',
      'Reject bad input with 400 and return consistent error bodies.',
      'Bean Validation annotations check the request; a @RestControllerAdvice turns exceptions into clean JSON errors.',
String.raw`record CreateBookRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank String author,
    @Pattern(regexp = "\\d{13}") String isbn) {}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(BookNotFoundException.class)
    ResponseEntity<Map<String, String>> notFound(BookNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors()
            .forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}`,
      'Return 409 Conflict when a book with the same ISBN already exists.',
      'Why not let exceptions reach the client as a stack trace?',
      'Stack traces leak internal details useful to attackers and are not useful to clients. A consistent error body with a status code is safer and easier to handle.'),
    L('Persistence with Spring Data JPA',
      'Map entities to tables and query them through repositories.',
      'A repository interface gets CRUD methods for free and derives queries from method names.',
String.raw`@Entity
class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(nullable = false) String title;
    @Column(nullable = false) String author;
    @Column(unique = true) String isbn;
    protected Book() {}
    Book(String title, String author) { this.title = title; this.author = author; }
}

interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String title);
    boolean existsByIsbn(String isbn);
}`,
      'Add paging to the list endpoint with Pageable and return the total number of books.',
      'What is the N+1 query problem?',
      'Loading a list of N entities and then lazily loading a relation for each one runs 1 + N queries. Fix it with a join fetch or an entity graph.'),
    L('Testing an API',
      'Test controllers with MockMvc and exercise the running API with Postman or curl.',
      'A MockMvc test posts invalid JSON and expects 400 with a field error.',
String.raw`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;
    @MockBean BookService service;

    @Test
    void rejectsBlankTitle() throws Exception {
        mvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"\",\"author\":\"Herbert\"}"))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.title").exists());
    }
}

# Manual check
curl -i -X POST localhost:8080/api/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Dune","author":"Frank Herbert"}'`,
      'Build a Postman collection for every endpoint, including two error cases each.',
      'What does @MockBean do in a @WebMvcTest?',
      'It replaces the real service bean with a Mockito mock in the Spring context, so the test checks only the web layer.'),
    L('API design and documentation',
      'Name resources consistently, version your API, and publish an OpenAPI document.',
      'springdoc-openapi generates interactive docs at /swagger-ui.html from your controllers.',
String.raw`Good resource design
  /api/v1/books               nouns, plural
  /api/v1/books/42/reviews    nested for ownership
  /api/v1/books?author=herbert&page=0&size=20   filter + paging

<!-- pom.xml -->
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.6.0</version>
</dependency>`,
      'Add OpenAPI docs to your API and link them from the README.',
      'Why version an API?',
      'Clients depend on its shape. Versioning lets you make breaking changes in a new version while existing clients keep working.'),
    L('Configuration and profiles',
      'Keep environment-specific settings and secrets outside the code.',
      'The database URL comes from an environment variable, with a local default for development.',
String.raw`# application.yml
spring:
  datasource:
    url: ${'$'}{DATABASE_URL:jdbc:postgresql://localhost:5432/books}
    username: ${'$'}{DATABASE_USER:books}
    password: ${'$'}{DATABASE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate

# application-test.yml uses an in-memory database for tests`,
      'Run the app with a "dev" profile and a "test" profile that use different databases.',
      'Why set ddl-auto to validate rather than update in production?',
      'update can silently change or fail to migrate the schema. Production schema changes should go through versioned migrations (Flyway or Liquibase) that are reviewed and repeatable.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
