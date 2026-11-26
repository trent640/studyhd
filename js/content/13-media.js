/* Lectures (narrated, captioned slide lectures with transcripts) and final quizzes.
   Attached to existing modules by id, so module files stay unchanged.

   A lecture can also point to a recorded video: add videoSrc (MP4/WebM) and
   captionsSrc (WebVTT) and the player shows the video with captions instead. */
(function (M) {
  const byId = (id) => M.find((m) => m.id === id);
  const add = (id, data) => { const m = byId(id); if (m) Object.assign(m, data); };

  add('oop', {
    lectures: [
      {
        title: 'Objects: state and behaviour', minutes: 4,
        slides: [
          { heading: 'What is an object?', points: ['An object bundles data (state) with the actions that use it (behaviour).', 'A class is the blueprint; objects are the things built from it.'],
            narration: 'Welcome. In this short lecture we look at objects. An object bundles some data, called its state, with the actions that use that data, called its behaviour. A class is the blueprint. Objects are the individual things built from that blueprint.' },
          { heading: 'A class in Java', code: 'public class Lesson {\n    private final String title;\n    private boolean done;\n\n    public Lesson(String title) { this.title = title; }\n    public void complete() { done = true; }\n    public boolean isDone() { return done; }\n}',
            narration: 'Here is a Lesson class in Java. It has two fields: a title and a done flag. The constructor sets the title. The complete method changes the state, and isDone reports it. Notice the fields are private.' },
          { heading: 'Creating objects', code: 'Lesson a = new Lesson("Classes");\nLesson b = new Lesson("Interfaces");\na.complete();\nSystem.out.println(a.isDone()); // true\nSystem.out.println(b.isDone()); // false',
            narration: 'We create two objects with the new keyword. Each object has its own state. Completing lesson a does not change lesson b. That independence is what makes objects useful for modelling real things.' },
          { heading: 'Key idea', points: ['Each object keeps its own state.', 'Methods are the only way to change that state.', 'Next: why fields should be private.'],
            narration: 'The key idea: each object keeps its own state, and its methods are the only way to change it. In the next lecture we will see why keeping fields private matters so much.' },
        ],
      },
      {
        title: 'Encapsulation: protecting your rules', minutes: 4,
        slides: [
          { heading: 'The problem with public fields', code: 'class Account { public long balance; }\n\naccount.balance = -500; // nothing stops this',
            narration: 'If a field is public, any code anywhere can change it, including setting a bank balance to minus five hundred. Nothing in the class can stop it.' },
          { heading: 'Encapsulation', code: 'class Account {\n    private long balance;\n    public void withdraw(long amount) {\n        if (amount > balance) throw new IllegalStateException("Insufficient funds");\n        balance -= amount;\n    }\n}',
            narration: 'Encapsulation fixes this. The field becomes private, and the only way to change it is through a method that checks the rule. Now an overdraft throws an exception instead of silently corrupting the data.' },
          { heading: 'Why it matters', points: ['Rules live in one place.', 'You can change the inside without breaking callers.', 'Bugs are easier to find.'],
            narration: 'Encapsulation keeps each rule in one place. You can change how the class works inside without breaking the code that uses it. And when something goes wrong, there is only one place to look.' },
        ],
      },
      {
        title: 'Interfaces and polymorphism', minutes: 5,
        slides: [
          { heading: 'An interface is a promise', code: 'interface Shape {\n    double area();\n}',
            narration: 'An interface is a promise. Any class that implements Shape promises to provide an area method. The interface says what, not how.' },
          { heading: 'Different classes, same promise', code: 'record Circle(double r) implements Shape {\n    public double area() { return Math.PI * r * r; }\n}\nrecord Square(double s) implements Shape {\n    public double area() { return s * s; }\n}',
            narration: 'Circle and Square both keep the promise in their own way. A circle uses pi r squared. A square multiplies its side by itself.' },
          { heading: 'Polymorphism', code: 'double total = 0;\nfor (Shape s : List.of(new Circle(1), new Square(2))) {\n    total += s.area();   // each object runs its own area()\n}',
            narration: 'This is polymorphism. The loop treats every item as a Shape, and each object runs its own version of area. The loop never needs to know which shapes exist.' },
          { heading: 'Why Spring loves interfaces', points: ['Depend on interfaces, not concrete classes.', 'Swap a real service for a fake one in tests.', 'Add new types without changing old code.'],
            narration: 'Spring applications rely on this all the time. Services depend on interfaces, so a test can swap in a fake implementation, and new behaviour can be added without changing tested code. That brings us to the end of this lecture.' },
        ],
      },
    ],
    finalQuiz: [
      { q: 'Which keyword creates a new object in Java?', choices: ['new', 'class', 'this', 'static'], answer: 0, why: 'new allocates an object and runs its constructor.' },
      { q: 'Why are fields usually private?', choices: ['So the class can protect its rules', 'To make the code faster', 'Because Java requires it', 'So subclasses cannot exist'], answer: 0, why: 'Private fields can only be changed through methods that check the rules (encapsulation).' },
      { q: 'What is polymorphism?', choices: ['Calling the same method on different objects runs each object\'s own version', 'A class with many fields', 'Copying an object', 'Hiding a method'], answer: 0, why: 'Callers depend on the shared type; each object supplies its own behaviour.' },
      { q: 'A Car has an Engine field instead of extending Engine. This is…', choices: ['Composition', 'Inheritance', 'Overloading', 'Encapsulation'], answer: 0, why: 'Composition builds behaviour by holding other objects.' },
      { q: 'Which SOLID principle says a class should have one reason to change?', choices: ['Single responsibility', 'Open–closed', 'Liskov substitution', 'Dependency inversion'], answer: 0, why: 'Single responsibility keeps classes small and focused.' },
      { q: 'Why does Spring prefer constructor injection?', choices: ['Dependencies are explicit and easy to replace in tests', 'It uses less memory', 'It avoids interfaces', 'It is the only option'], answer: 0, why: 'Constructor parameters make dependencies visible and testable without Spring.' },
    ],
  });

  add('java-fundamentals', {
    lectures: [
      {
        title: 'Your first Java program', minutes: 3,
        slides: [
          { heading: 'Hello, Java', code: 'public class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello, Study Desk");\n    }\n}',
            narration: 'Every Java program starts in a main method inside a class. This one prints a single line of text with System dot out dot println.' },
          { heading: 'Compile and run', code: 'javac Hello.java   # compile to Hello.class\njava Hello         # run it',
            narration: 'Java code is compiled first with javac, which produces a class file, and then run with the java command. Modern Java can also run a single file directly with java Hello dot java.' },
          { heading: 'Variables and types', code: 'int lessons = 7;\ndouble hours = 1.5;\nString name = "OOP";\nboolean done = false;',
            narration: 'Variables have types. int holds whole numbers, double holds decimals, String holds text, and boolean holds true or false. The compiler checks you use them correctly.' },
        ],
      },
    ],
    finalQuiz: [
      { q: 'Which method does Java run first?', choices: ['public static void main(String[] args)', 'start()', 'run()', 'init()'], answer: 0, why: 'The JVM looks for main with exactly that signature.' },
      { q: 'How do you compare two Strings\' text?', choices: ['a.equals(b)', 'a == b', 'a = b', 'a.compare(b)'], answer: 0, why: '== compares references; equals compares content.' },
      { q: 'Which collection gives fast lookups by key?', choices: ['HashMap', 'ArrayList', 'LinkedList', 'Array'], answer: 0, why: 'HashMap gives average O(1) lookup by key.' },
      { q: 'What does try-with-resources guarantee?', choices: ['Resources are closed even if an exception is thrown', 'No exceptions happen', 'Faster file reading', 'Automatic retries'], answer: 0, why: 'Resources declared in try(...) are closed automatically.' },
    ],
  });

  add('backend-spring', {
    lectures: [
      {
        title: 'How a Spring Boot request flows', minutes: 4,
        slides: [
          { heading: 'The request path', points: ['Browser sends HTTP request', 'Controller maps it to a method', 'Service applies the rules', 'Repository reads or writes MySQL'],
            narration: 'Let us follow one request. The browser sends an HTTP request. A controller maps it to a Java method. The service applies the business rules. The repository reads or writes the MySQL database. Then the answer travels back up.' },
          { heading: 'Spring wires it together', code: '@RestController class LessonController { LessonController(LessonService s) {...} }\n@Service class LessonService { LessonService(LessonRepository r) {...} }\ninterface LessonRepository extends JpaRepository<Lesson, Long> {}',
            narration: 'You never create these objects yourself. Spring finds the classes with annotations, creates them, and passes each one the dependencies its constructor asks for.' },
          { heading: 'Errors and security', points: ['Validation rejects bad input with 400', 'Spring Security checks who you are first', 'Exception handlers return clear errors'],
            narration: 'Before your code even runs, Spring Security checks who the user is. Validation rejects bad input with a 400 response, and exception handlers turn problems into clear, consistent errors.' },
        ],
      },
    ],
    finalQuiz: [
      { q: 'Which layer should contain business rules?', choices: ['Service', 'Controller', 'Repository', 'Entity'], answer: 0, why: 'Services hold rules so they can be reused and tested without HTTP.' },
      { q: 'What does @Transactional do?', choices: ['Makes the method\'s database changes commit or roll back together', 'Makes the method run faster', 'Logs every call', 'Secures the method'], answer: 0, why: 'All changes in the transaction succeed or none do.' },
      { q: 'Which class hashes passwords in Spring Security?', choices: ['BCryptPasswordEncoder', 'MessageDigest', 'Base64', 'String.hashCode'], answer: 0, why: 'BCrypt is slow and salted, which resists guessing.' },
      { q: 'Why use Testcontainers for repository tests?', choices: ['They run against a real MySQL like production', 'They avoid writing tests', 'They mock the database', 'They are required by JPA'], answer: 0, why: 'Real engine behaviour catches dialect and type problems.' },
    ],
  });

  add('frontend-react', {
    lectures: [
      {
        title: 'React components and Tailwind in five minutes', minutes: 5,
        slides: [
          { heading: 'A component is a function', code: 'function Greeting({ name }) {\n  return <h1 className="text-2xl font-bold">Hello, {name}</h1>;\n}',
            narration: 'A React component is a function that returns what should appear on screen. It receives inputs called props. Here the name prop is shown inside a heading.' },
          { heading: 'State makes it interactive', code: 'const [count, setCount] = useState(0);\n<button onClick={() => setCount(count + 1)}>Done {count}</button>',
            narration: 'State is data that changes over time. When you call setCount, React re-renders the component with the new value.' },
          { heading: 'Tailwind: utility classes', code: '<button className="rounded-lg bg-teal-700 px-4 py-2 text-white hover:bg-teal-800">\n  Start\n</button>',
            narration: 'Tailwind CSS styles elements with small utility classes, like rounded corners, a background colour, padding and a hover colour. You build designs without writing separate CSS files.' },
        ],
      },
    ],
    finalQuiz: [
      { q: 'What are props in React?', choices: ['Inputs passed to a component', 'CSS classes', 'Database rows', 'Browser cookies'], answer: 0, why: 'Props are read-only inputs from the parent.' },
      { q: 'Which hook stores a value that changes over time?', choices: ['useState', 'useRef only', 'useId', 'useMemo'], answer: 0, why: 'useState returns the value and a setter that triggers a re-render.' },
      { q: 'In Tailwind, "dark:bg-stone-900" applies when…', choices: ['Dark mode is active', 'The screen is small', 'The element is hovered', 'Always'], answer: 0, why: 'The dark: variant targets dark mode.' },
      { q: 'Why query by role in Testing Library?', choices: ['It tests what users and assistive tech experience', 'It is faster', 'It avoids writing assertions', 'It works without React'], answer: 0, why: 'Role queries also fail when a component is inaccessible.' },
    ],
  });

  add('mysql', {
    finalQuiz: [
      { q: 'Which character set stores emoji and all accented letters?', choices: ['utf8mb4', 'latin1', 'ascii', 'utf16le'], answer: 0, why: 'utf8mb4 is full UTF-8 in MySQL.' },
      { q: 'What does EXPLAIN type "ALL" mean?', choices: ['A full table scan', 'All indexes were used', 'The query returned all rows', 'The query is cached'], answer: 0, why: 'ALL means MySQL read every row; an index may help.' },
      { q: 'Which mysqldump option gives a consistent InnoDB backup without locking?', choices: ['--single-transaction', '--lock-all-tables', '--no-data', '--force'], answer: 0, why: 'It takes a snapshot inside one transaction.' },
      { q: 'What should the app\'s MySQL user be allowed to do?', choices: ['Only the data operations it needs', 'Everything, to avoid errors', 'Only DROP and CREATE', 'Nothing'], answer: 0, why: 'Least privilege limits damage if the app is compromised.' },
    ],
  });

  add('algorithms', {
    finalQuiz: [
      { q: 'Binary search requires the input to be…', choices: ['Sorted', 'Unique', 'Numeric', 'Small'], answer: 0, why: 'It discards half the range based on order.' },
      { q: 'Which traversal finds the shortest path in an unweighted graph?', choices: ['BFS', 'DFS', 'In-order', 'Random walk'], answer: 0, why: 'BFS visits nodes in order of distance.' },
      { q: 'Merge sort\'s time complexity is…', choices: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'], answer: 0, why: 'log n levels of splitting, n work per level.' },
      { q: 'Dynamic programming helps when subproblems…', choices: ['Overlap', 'Are independent', 'Are sorted', 'Are random'], answer: 0, why: 'It solves each overlapping subproblem once.' },
    ],
  });
})(window.SD_MODULES);
