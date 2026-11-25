/* Course modules and lessons. Generated from the original Study Desk content. */
window.SD_MODULES = [
 {
  "id": "oop",
  "title": "Object-oriented design",
  "cat": "Engineering",
  "code": "7 · ENGINEERING",
  "desc": "Plan systems as collaborating objects with clear responsibilities.",
  "outcome": "Break a problem into collaborating objects, write clear contracts, and test them individually.",
  "sourceUrl": "https://react.dev/learn",
  "sourceLabel": "Course Desk · OOP",
  "example": "A Course object holds lessons. Each Lesson has a title and a status. The system reports the last lesson in the course.",
  "exercise": "Design a small system for a weather station. List the objects, their fields, and their behaviors.",
  "quiz": "What makes a good object?",
  "quizChoices": [
   "A clear responsibility and low coupling with others",
   "A large class that does many things",
   "A class with many public methods"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Classes, instances, and contracts",
    "objective": "Define a class, create instances, and state clear contracts between objects.",
    "example": "A Course class stores modules and lessons. Each lesson has a title and a status. A course can add a lesson and list its modules.",
    "code": "class Course {\n  constructor(name) {\n    this.name = name;\n    this.modules = [];\n    this.lessons = [];\n  }\n  addLesson(lesson) {\n    this.lessons.push(lesson);\n  }\n  lessonOrder() {\n    return this.lessons.map(l => l.title);\n  }\n}",
    "practice": "Add a method to the Course class that returns the number of lessons.",
    "check": "What happens if an object exposes too much state?",
    "answer": "Other objects become coupled to it, and changes become harder to make."
   },
   {
    "title": "Systems of cooperating objects",
    "objective": "Combine small, single-purpose objects into a system.",
    "example": "A Course has Modules. Each Module has Lessons. A Lesson has a body and a title. The system reports the last lesson in a course.",
    "code": "// A small system of cooperating objects\nclass Course {\n  constructor(name) {\n    this.name = name;\n    this.modules = [];\n    this.lessons = [];\n  }\n  addLesson(lesson) {\n    this.lessons.push(lesson);\n  }\n  lessonOrder() {\n    return this.lessons.map(l => l.title);\n  }\n}\n\nclass Module {\n  constructor(title) {\n    this.title = title;\n    this.lessons = [];\n  }\n  addLesson(lesson) {\n    this.lessons.push(lesson);\n  }\n}",
    "practice": "Add a method to Module that returns its lessons.",
    "check": "How does the system change when you add a new role, like a Student?",
    "answer": "The system gains a new object that interacts with Course and Lesson through defined contracts."
   },
   {
    "title": "Order of correctness and contracts",
    "objective": "Write a clear contract for each object, and test the system as a whole.",
    "example": "A Course tells a Lesson what data it needs. The Lesson returns a small value, not the whole course. The test checks the final index against the contract the reviewers agreed on.",
    "code": "// A contract example\n// Course.lessonOrder() returns the titles of lessons in order\n// Lesson.title returns the title of that lesson\n// The test asserts the order matches the list the reviewers agreed on",
    "practice": "Test the system by listing the titles of all lessons in a course.",
    "check": "What does a contract do for a team?",
    "answer": "A contract describes what each object promises to do. It makes changes safer and review faster."
   },
   {
    "title": "Composition Over Inheritance",
    "objective": "Use composition to build flexible systems. Understand when to use which.",
    "example": "Composition means building systems by combining objects. Inheritance uses class hierarchies.",
    "code": "class Engine {\n  start() { return 'Engine starting...'; }\n}\nclass Car {\n  constructor() {\n    this.engine = new Engine();\n  }\n  start() {\n    return this.engine.start();\n  }\n}",
    "practice": "Rewrite a class hierarchy using composition. How does it change the design?",
    "check": "Use composition for flexibility. Use inheritance for 'is-a' relationships. Test with different combinations.",
    "answer": "Use composition for flexibility. Use inheritance for 'is-a' relationships. Test with different combinations."
   },
   {
    "title": "Dependency Injection",
    "objective": "Use dependency injection to make systems testable. Understand the DI container.",
    "example": "Dependency injection passes dependencies to a class. The DI container manages the dependencies.",
    "code": "class Engine {\n  constructor() { /* ... */ }\n}\nclass Car {\n  constructor(engine) {\n    this.engine = engine;\n  }\n}",
    "practice": "Create a class with a dependency. How would you test it with a mock dependency?",
    "check": "Use dependency injection for testability. Use a DI container to manage dependencies. Test with mocks.",
    "answer": "Use dependency injection for testability. Use a DI container to manage dependencies. Test with mocks."
   },
   {
    "title": "SOLID Principles",
    "objective": "Apply SOLID principles to design robust systems.",
    "example": "SOLID: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.",
    "code": "// SRP: A class should have one reason to change\nclass User {\n  constructor(name) { this.name = name; }\n  getUserInfo() { return this.name; }\n}\n\nclass UserRepository {\n  findUser(id) { /* ... */ }\n  saveUser(user) { /* ... */ }\n}",
    "practice": "Refactor a class that violates the Single Responsibility Principle. How would you fix it?",
    "check": "Apply SOLID principles. Test the design with different scenarios. Refactor as needed.",
    "answer": "Apply SOLID principles. Test the design with different scenarios. Refactor as needed."
   },
   {
    "title": "Design Patterns",
    "objective": "Apply common design patterns to solve recurring problems.",
    "example": "Design patterns are reusable solutions to common problems. They provide best practices.",
    "code": "// Singleton Pattern\nclass Singleton {\n  constructor() {\n    if (!Singleton.instance) {\n      Singleton.instance = this;\n    }\n    return Singleton.instance;\n  }\n}",
    "practice": "Identify a design pattern in a piece of code. How would you apply it to a new problem?",
    "check": "Use design patterns for common problems. Test the patterns with different scenarios.",
    "answer": "Use design patterns for common problems. Test the patterns with different scenarios."
   }
  ]
 },
 {
  "id": "software-engineering",
  "title": "Software engineering",
  "cat": "Engineering",
  "code": "7 · ENGINEERING",
  "desc": "Build reliable software with testing, pair reviews, branches, and small releases.",
  "outcome": "Run small changes end-to-end: tests, PR, review, and deploy.",
  "sourceUrl": "https://docs.spring.io/spring-boot/index.html",
  "sourceLabel": "Spring Boot · reference guide",
  "example": "A small change to a course model is written as a test-backed feature and merged through a pull request.",
  "exercise": "Make a small change to a course model. Add a test, open a pull request, and ask for a review.",
  "quiz": "Why run a test before you merge a change?",
  "quizChoices": [
   "It verifies the change does not break existing behavior",
   "It compiles the code",
   "It deploys the code"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Testing, TDD, and asserting",
    "objective": "Write tests that lock in behavior, and let failures guide the next step.",
    "example": "A Course model has a method that lists its lessons. The test asserts that the method returns the lessons in order.",
    "code": "// A simple test using Node's built-in test runner\nimport test from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('Course lists lessons in order', () => {\n  const c = new Course('Intro to CS');\n  c.addLesson(new Lesson('Variables'));\n  c.addLesson(new Lesson('Flow'));\n  assert.deepEqual(c.lessonOrder(), ['Variables', 'Flow']);\n});",
    "practice": "Write a failing test for a removeLesson method, then implement it until the test passes.",
    "check": "What is the red-green-refactor cycle?",
    "answer": "Write a failing test (red), write the simplest code to pass it (green), then clean up the code while the tests stay green (refactor)."
   },
   {
    "title": "Pairing, reviewing, and closing",
    "objective": "Use reviewers, feedback, and a PR checklist to ship better changes.",
    "example": "Two students pair on a new lesson. They review each other\\u2019s code, mention a missing test, and close the PR after one small fix.",
    "code": "// PR checklist:\n// - [ ] Test covers the new behavior\n// - [ ] No breaking changes\n// - [ ] Docs updated\n// - [ ] Reviewed by a peer",
    "practice": "Open a PR with a clear description and mark tasks as you close them.",
    "check": "How do you respond to feedback?",
    "answer": "Thank the reviewer, fix the issue, and close the PR with a short note explaining what changed."
   },
   {
    "title": "Small changes, reviewed design",
    "objective": "Keep a codebase consistent by doing one small thing at a time.",
    "example": "A course rubric is in one place. A new course uses the same rubric, and prs follow the same review rules.",
    "code": "// One change per task\n// Small units, reviewed and merged quickly",
    "practice": "Finish the first exercise, open a PR, and ask for a review.",
    "check": "What should you do if a PR gets too large?",
    "answer": "Split it into smaller units. You review and test each one before you merge it."
   },
   {
    "title": "Code Review Process",
    "objective": "Conduct a peer code review. Provide constructive feedback.",
    "example": "Code review is a process where peers review code before merging. It catches bugs and improves quality.",
    "code": "// Code Review Checklist:\n// - [ ] Does the code pass all tests?\n// - [ ] Is the code readable and well-structured?\n// - [ ] Are there any security concerns?\n// - [ ] Is the documentation up-to-date?",
    "practice": "Conduct a code review for a small piece of code. What feedback would you give?",
    "check": "Use a code review checklist. Provide constructive feedback. Focus on the code, not the person.",
    "answer": "Use a code review checklist. Provide constructive feedback. Focus on the code, not the person."
   },
   {
    "title": "CI/CD Pipeline",
    "objective": "Set up a CI/CD pipeline for a project. Use GitHub Actions.",
    "example": "CI/CD automates testing and deployment. GitHub Actions runs workflows on push or pull request.",
    "code": "# .github/workflows/ci.yml\nname: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test\n      - run: npm run build\n  deploy:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo 'Deploying...'",
    "practice": "Set up a CI/CD pipeline for your project. What stages would you include?",
    "check": "Use GitHub Actions for CI/CD. Add test and deploy stages. Test the pipeline.",
    "answer": "Use GitHub Actions for CI/CD. Add test and deploy stages. Test the pipeline."
   },
   {
    "title": "Refactoring Techniques",
    "objective": "Refactor code to improve quality. Use common refactoring patterns.",
    "example": "Refactoring improves code without changing behavior. Use small steps. Run tests after each step.",
    "code": "// Refactoring: Extract Method\n// Before: doSomething() { /* ... */ }\n// After: doSomething() { helper(); }\n//           helper() { /* ... */ }",
    "practice": "Refactor a piece of code. What changes did you make? Why?",
    "check": "Identify code smells. Apply refactoring patterns. Run tests after each change.",
    "answer": "Identify code smells. Apply refactoring patterns. Run tests after each change."
   },
   {
    "title": "Agile Ceremonies",
    "objective": "Run Agile ceremonies: sprint planning, daily standup, retrospective.",
    "example": "Agile ceremonies are regular meetings. Sprint planning plans work for the sprint. Daily standup is a 15-minute meeting.",
    "code": "// Sprint Planning Agenda:\n// 1. Review the sprint goal\n// 2. Discuss the backlog\n// 3. Assign tasks\n// 4. Estimate effort\n// 5. Identify risks",
    "practice": "Write an agenda for a sprint retrospective. What topics would you cover?",
    "check": "Use Agile ceremonies to communicate. Plan, review, and retrospect. Improve continuously.",
    "answer": "Use Agile ceremonies to communicate. Plan, review, and retrospect. Improve continuously."
   }
  ]
 },
 {
  "id": "algorithms",
  "title": "Algorithms",
  "cat": "Logic",
  "code": "8 · LOGIC",
  "desc": "Design algorithms, prove correctness, and reason about complexity.",
  "outcome": "Write clear pseudocode, prove correctness, and compare algorithmic efficiency.",
  "sourceUrl": "https://react.dev/learn",
  "sourceLabel": "Course Desk · Algorithms",
  "example": "A divide-and-conquer search splits the input in half each pass, giving O(log n) time.",
  "exercise": "Compare binary search with linear search on a 1,000 item list. State the time and space used by each.",
  "quiz": "What is the complexity of binary search?",
  "quizChoices": [
   "O(log n)",
   "O(n)",
   "O(n log n)"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Pseudocode and correctness",
    "objective": "Write step-by-step algorithm steps and prove they terminate with the right result.",
    "example": "A binary search function takes a sorted list and a target. It returns the index of the target, or -1 if the target is not present.",
    "code": "function binarySearch(list, target):\n  left = 0\n  right = length(list) - 1\n  while left <= right:\n    mid = (left + right) / 2\n    if list[mid] == target:\n      return mid\n    else if list[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n  return -1",
    "practice": "Trace binary search on a list of 10 items for a target that is not present. Count the number of comparisons.",
    "check": "Does binary search work on an unsorted list?",
    "answer": "No. Binary search requires the list to be sorted."
   },
   {
    "title": "Divide and conquer",
    "objective": "Break a problem into smaller, similar subproblems, solve each, and combine the results.",
    "example": "Merge sort splits the list in half, sorts each half, then merges the sorted halves in O(n log n) time.",
    "code": "function mergeSort(list):\n  if length(list) <= 1:\n    return list\n  mid = length(list) / 2\n  left = mergeSort(list[0..mid-1])\n  right = mergeSort(list[mid..length(list)-1])\n  return merge(left, right)",
    "practice": "Trace merge sort on a list of 8 items. Count the number of merge operations.",
    "check": "How does divide and conquer differ from dynamic programming?",
    "answer": "Divide and conquer solves independent subproblems; dynamic programming solves overlapping subproblems."
   },
   {
    "title": "Greedy and dynamic programming",
    "objective": "Choose the right approach for a problem based on whether it has overlapping subproblems.",
    "example": "The knapsack problem can be solved with greedy (when items are fractional) or dynamic programming (when items cannot be split).",
    "code": "// Greedy: fractional knapsack\nfunction knapsackGreedy(items, capacity):\n  items.sort((a, b) => b.valuePerWeight - a.valuePerWeight)\n  total = 0\n  for item in items:\n    if capacity >= item.weight:\n      total += item.value\n      capacity -= item.weight\n    else:\n      total += item.value * (capacity / item.weight)\n      break\n  return total",
    "practice": "Give one problem that fits greedy and one that fits dynamic programming.",
    "check": "When is greedy guaranteed to give the optimal solution?",
    "answer": "When local choices do not affect future choices, and the problem has the greedy-choice property."
   },
   {
    "title": "Graph Traversal",
    "objective": "Implement DFS and BFS for graph traversal. Understand when to use each.",
    "example": "DFS uses a stack (or recursion). BFS uses a queue. DFS goes deep first. BFS explores level by level.",
    "code": "function dfs(graph, start) {\n  const visited = new Set();\n  const stack = [start];\n  while (stack.length) {\n    const node = stack.pop();\n    if (!visited.has(node)) {\n      visited.add(node);\n      stack.push(...graph[node].filter(n => !visited.has(n)));\n    }\n  }\n  return visited;\n}",
    "practice": "Add a BFS implementation. How would you track the level of each node in BFS?",
    "check": "Use a queue for BFS. Track the level of each node. Use a visited set to avoid cycles.",
    "answer": "Use DFS for deep searches. Use BFS for shortest paths. Both use a visited set to avoid cycles."
   },
   {
    "title": "Dynamic Programming",
    "objective": "Solve problems using dynamic programming. Understand memoization and tabulation.",
    "example": "DP solves problems by breaking them into smaller subproblems. Use memoization to store results.",
    "code": "function fibonacci(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);\n}",
    "practice": "Implement a DP solution for the knapsack problem. How would you optimize it for space?",
    "check": "Use a 2D array or 1D array to store results. Optimize space by using only the current and previous row.",
    "answer": "Use memoization to store results. Use tabulation for bottom-up approach. Optimize for space."
   },
   {
    "title": "Union-Find",
    "objective": "Implement the union-find data structure for disjoint set operations.",
    "example": "Union-find supports union and find operations. It uses path compression and union by rank.",
    "code": "class UnionFind {\n  constructor(n) {\n    this.parent = Array.from({length: n}, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n  find(x) {\n    if (this.parent[x] !== x) {\n      this.parent[x] = this.find(this.parent[x]);\n    }\n    return this.parent[x];\n  }\n  union(x, y) {\n    const rootX = this.find(x);\n    const rootY = this.find(y);\n    if (rootX !== rootY) {\n      if (this.rank[rootX] < this.rank[rootY]) {\n        this.parent[rootX] = rootY;\n      } else {\n        this.parent[rootY] = rootX;\n      }\n    }\n  }\n}",
    "practice": "Add path compression to the union-find. How would you test it with a large dataset?",
    "check": "Use union and find operations. Test with a large dataset. Measure performance.",
    "answer": "Use union-find for disjoint sets. Use path compression and union by rank for efficiency."
   },
   {
    "title": "String Matching (KMP)",
    "objective": "Implement the Knuth-Morris-Pratt algorithm for string matching.",
    "example": "KMP uses a prefix function to avoid unnecessary comparisons. It runs in O(n+m) time.",
    "code": "function kmpSearch(text, pattern) {\n  const lps = computeLPS(pattern);\n  let i = 0, j = 0;\n  while (i < text.length) {\n    if (text[i] === pattern[j]) {\n      i++; j++;\n      if (j === pattern.length) return i - j;\n    } else {\n      if (j !== 0) j = lps[j-1];\n      else i++;\n    }\n  }\n  return -1;\n}",
    "practice": "Add a partial match table computation for KMP. How would you verify the algorithm on a long text?",
    "check": "Use KMP for pattern matching. It avoids unnecessary comparisons. The partial match table helps.",
    "answer": "Use KMP for pattern matching. It runs in O(n+m) time. The partial match table helps avoid unnecessary comparisons."
   }
  ]
 },
 {
  "id": "testing",
  "title": "Testing",
  "cat": "Engineering",
  "code": "7 · ENGINEERING",
  "desc": "Write tests before their target code, and keep the test suite fast and reliable.",
  "outcome": "Write a small test that fails when a feature is missing, and watch the two tests stay green.",
  "lessons": [
   {
    "title": "Test-driven value and runner setup",
    "objective": "Set up a test runner, then write a test that fails before the target code exists.",
    "example": "A Course model has a method that lists its lessons. The test asserts that the method returns the lessons in order. The test fails before the method exists.",
    "code": "// A simple test using Node's built-in test runner\nimport test from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('Course lists lessons in order', () => {\n  const c = new Course('Intro to CS');\n  c.addLesson(new Lesson('Variables'));\n  c.addLesson(new Lesson('Flow'));\n  assert.deepEqual(c.lessonOrder(), ['Variables', 'Flow']);\n});",
    "practice": "Set up the test runner and add one failing test for a function that does not exist yet.",
    "check": "Why should a new test fail first?",
    "answer": "A test that never fails might not be testing anything. Seeing it fail proves it checks the behavior."
   },
   {
    "title": "CI, logs, and coverage",
    "objective": "Run tests in a pipeline, and keep coverage high enough to trust changes.",
    "example": "A learner adds a new feature, runs the test locally, then pushes the branch. The CI runner runs the test suite and the report shows a coverage number that stays above the project line.",
    "code": "# .github/workflows/test.yml\nname: test\non: [push, pull_request]\nsteps:\n  - uses: actions/checkout@v4\n  - run: npm test\n  - run: npm run coverage",
    "practice": "Add a coverage step to the CI pipeline. Read the coverage report and decide if the threshold is met.",
    "check": "What does a coverage report tell you?",
    "answer": "It tells you how much of the code is exercised by tests. Fixing a failing test is a lead, not a done result."
   },
   {
    "title": "Duplicates, snapshots, and review",
    "objective": "Keep tests independent and avoid fragile snapshots.",
    "example": "The test for a course lesson stores a value and compares it. The test does not depend on other tests.",
    "code": "// A fragile test is a warning\n// Keep tests independent; do not assert a value that changes with unrelated code",
    "practice": "Run the test locally, then in CI. If a test fails locally but passes in CI, check the environment and the working directory. Track each fix until the suite is green.",
    "check": "When does an unstable test stop being useful?",
    "answer": "When it fails too often. Remove or fix it before it masks a true failure."
   },
   {
    "title": "Unit Testing with Jest",
    "objective": "Write unit tests using Jest. Test functions in isolation.",
    "example": "Jest is a testing framework. Use describe() for test suites. Use test() for test cases. Use expect() for assertions.",
    "code": "// sum.js\nfunction sum(a, b) { return a + b; }\nexport default sum;\n\n// sum.test.js\nimport sum from './sum';\ndescribe('sum', () => {\n  test('adds 1 + 2 to equal 3', () => {\n    expect(sum(1, 2)).toBe(3);\n  });\n});",
    "practice": "Write a unit test for a function. What edge cases would you test?",
    "check": "Use Jest for unit testing. Write tests for functions. Test edge cases.",
    "answer": "Use Jest for unit testing. Write tests for functions. Test edge cases."
   },
   {
    "title": "Integration Testing",
    "objective": "Write integration tests. Test how modules work together.",
    "example": "Integration tests test multiple modules together. They test the interfaces between modules.",
    "code": "// test/user.test.js\nimport { getUser, createUser } from './user';\ntest('createUser and getUser work together', async () => {\n  const user = await createUser({ name: 'John' });\n  const found = await getUser(user.id);\n  expect(found.name).toBe('John');\n});",
    "practice": "Write an integration test for a module. What would you test?",
    "check": "Use integration tests for module interactions. Test the interfaces between modules.",
    "answer": "Use integration tests for module interactions. Test the interfaces between modules."
   },
   {
    "title": "Test Coverage",
    "objective": "Measure test coverage. Use Istanbul/nyc to generate coverage reports.",
    "example": "Test coverage measures how much code is tested. Istanbul/nyc generates coverage reports.",
    "code": "// .nycrc\n{\n  \"all\": true,\n  \"check-coverage\": true,\n  \"branches\": 80,\n  \"lines\": 80,\n  \"reporter\": [\"text\", \"html\"]\n}",
    "practice": "Run coverage on your project and find one branch that no test reaches. Write a test for it.",
    "check": "Does 100% coverage mean the code has no bugs?",
    "answer": "No. Coverage shows which lines ran, not whether the assertions check the right behavior."
   },
   {
    "title": "Mocking and Stubbing",
    "objective": "Use mocks and stubs to isolate units. Test with fake dependencies.",
    "example": "Mocking replaces real dependencies with fake ones. Jest provides mocking utilities.",
    "code": "// jest.mock\nexport const userService = {\n  getUser: jest.fn(),\n  createUser: jest.fn()\n};\n\n// In test\ntest('uses userService.get_user', async () => {\n  userService.getUser.mockResolvedValue({ id: 1, name: 'John' });\n  const result = await getUser(1);\n  expect(userService.getUser).toHaveBeenCalledWith(1);\n});",
    "practice": "Create a mock for a dependency. How would you verify it was called?",
    "check": "Use jest.mock for mocking. Verify calls with expect().toHaveBeenCalled().",
    "answer": "Use jest.mock for mocking. Verify calls with expect().toHaveBeenCalled()."
   }
  ],
  "sourceUrl": "https://junit.org/junit5/docs/current/user-guide/",
  "sourceLabel": "JUnit 5 · User guide",
  "example": "A login test fails before the password check is done. The test locks in the expected behavior, and when the check is done the test stays green.",
  "exercise": "Write a small test for a new function. Watch it fail, then make it pass and keep the suite green.",
  "quiz": "Why write the test before the target code?",
  "quizChoices": [
   "It locks in the expected behavior",
   "It makes the suite slower",
   "It cleans up the repository"
  ],
  "answer": 0
 },
 {
  "id": "databases",
  "title": "Databases",
  "cat": "Data",
  "code": "11 · OPERATIONS",
  "desc": "Design and query relational databases, focusing on the operation side.",
  "outcome": "Design a relational database, write SQL queries, and reason about performance.",
  "sourceUrl": "https://www.postgresql.org/docs/current/",
  "sourceLabel": "PostgreSQL documentation",
  "example": "A three-table schema for a course: modules, lessons, and learners.",
  "exercise": "Design a small schema for a library system with books, members, and loans. Write the CREATE TABLE statements.",
  "quiz": "What is a primary key?",
  "quizChoices": [
   "A unique identifier for a row",
   "A foreign key reference",
   "An index on a table"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Schema design and normalization",
    "objective": "Design a schema that avoids redundancy and preserves data integrity.",
    "example": "A library database with a books table, a members table, and a loans table. The loans table links books and members.",
    "code": "CREATE TABLE books (\n  id SERIAL PRIMARY KEY,\n  title VARCHAR(255) NOT NULL,\n  author VARCHAR(255) NOT NULL,\n  isbn VARCHAR(20) UNIQUE\n);\nCREATE TABLE members (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  email VARCHAR(255) UNIQUE\n);\nCREATE TABLE loans (\n  id SERIAL PRIMARY KEY,\n  book_id INTEGER REFERENCES books(id),\n  member_id INTEGER REFERENCES members(id),\n  due_date DATE NOT NULL\n);",
    "practice": "Add a foreign key constraint to the loans table that ensures a loan references a valid book.",
    "check": "Why do we normalize tables?",
    "answer": "Normalization reduces redundancy and the risk of update anomalies."
   },
   {
    "title": "Indexes and query plans",
    "objective": "Choose indexes that speed up queries without slowing down writes.",
    "example": "An index on the books.title column makes a search for a specific title fast. But it slows down inserts and updates.",
    "code": "-- Create an index on a column\nCREATE INDEX idx_books_title ON books(title);\n\n-- Check the query plan\nEXPLAIN ANALYZE\nSELECT * FROM books WHERE title = 'The Great Gatsby';",
    "practice": "Add an index to the loans table on the due_date column. Test a query that finds all overdue loans.",
    "check": "When is an index not worth the cost?",
    "answer": "When the index makes writes much slower but only reads a few rows."
   },
   {
    "title": "Joins and performance",
    "objective": "Write efficient join queries that retrieve data from multiple tables.",
    "example": "A query that joins the books and loans tables shows all books that are currently on loan, with their due dates.",
    "code": "SELECT b.title, l.due_date\nFROM books b\nJOIN loans l ON b.id = l.book_id\nWHERE l.due_date < CURRENT_DATE;",
    "practice": "Run the join query on a database with 10,000 books and 5,000 loans. Time it with and without an index.",
    "check": "How can you optimize a slow join query?",
    "answer": "Add indexes on the join columns, reduce the number of columns selected, or use a materialized view."
   },
   {
    "title": "Query Optimization",
    "objective": "Write optimized SQL queries. Understand query plans and index usage.",
    "example": "EXPLAIN ANALYZE shows the query plan. Indexes speed up queries. Avoid SELECT *. Only select needed columns.",
    "code": "EXPLAIN ANALYZE\nSELECT title, author\nFROM books\nWHERE published_date > '2020-01-01';\n\n-- With index: EXPLAIN ANALYZE\nSELECT id FROM books WHERE title LIKE 'A%';",
    "practice": "Add an index to a frequently queried column. How would you measure the performance improvement?",
    "check": "Use EXPLAIN ANALYZE to check the query plan. Add indexes on columns with high selectivity.",
    "answer": "Use EXPLAIN ANALYZE to check the query plan. Add indexes on columns with high selectivity."
   },
   {
    "title": "Window Functions",
    "objective": "Use SQL window functions for advanced data analysis.",
    "example": "Window functions operate on a set of rows. They use OVER() to define the window.",
    "code": "SELECT title, published_date,\n  ROW_NUMBER() OVER (ORDER BY published_date DESC) AS rank,\n  SUM(price) OVER (ORDER BY published_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_sum\nFROM books;",
    "practice": "Write a query that uses a window function. What is the difference between ROWS and RANGE in a window?",
    "check": "Use window functions for ranking, running totals, and moving averages. Test with different window frames.",
    "answer": "Use window functions for ranking and running totals. Test with different window frames."
   },
   {
    "title": "Indices for Performance",
    "objective": "Create and manage database indexes for optimal performance.",
    "example": "Indexes speed up queries. Clustered indexes determine the physical order of data. Non-clustered indexes are separate structures.",
    "code": "CREATE INDEX idx_books_title ON books(title);\n\n-- Partial index\nCREATE INDEX idx_books_published ON books(published_date) WHERE published_date > '2020-01-01';",
    "practice": "Create a composite index. How would you test the index performance?",
    "check": "Use CREATE INDEX for single and composite indexes. Test performance with EXPLAIN ANALYZE.",
    "answer": "Use CREATE INDEX for single and composite indexes. Test performance with EXPLAIN ANALYZE."
   },
   {
    "title": "Advanced Join Types",
    "objective": "Use different join types: INNER, LEFT, RIGHT, FULL, CROSS, and SELF joins.",
    "example": "INNER JOIN returns matching rows. LEFT JOIN returns all rows from the left table. RIGHT JOIN returns all rows from the right table.",
    "code": "SELECT b.title, l.due_date\nFROM books b\nLEFT JOIN loans l ON b.id = l.book_id\nWHERE l.due_date IS NULL; -- Books not on loan",
    "practice": "Write a query that uses a SELF join. What is a common use case for a self join?",
    "check": "Use all join types. Test with different table structures. Verify the results.",
    "answer": "Use all join types. Test with different table structures. Verify the results."
   }
  ]
 },
 {
  "id": "db-management",
  "title": "Database management",
  "cat": "Data",
  "code": "11 · OPERATIONS",
  "desc": "Manage database access, backups, and monitoring.",
  "outcome": "Secure a database with least privilege, test a restore, and watch key metrics.",
  "sourceUrl": "https://www.postgresql.org/docs/current/",
  "sourceLabel": "PostgreSQL documentation",
  "example": "A restore drill finds that the backup needs to be copied to a staging host and checked before it can be restored.",
  "exercise": "Write a short restore checklist for a course database. Test it in a staging environment.",
  "quiz": "What is the worst thing a backup job can do?",
  "quizChoices": [
   "Alters or deletes data",
   "Compresses the backup",
   "Creates a checksum"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Roles and least privilege",
    "objective": "Give a role only the access it needs, and no more.",
    "example": "A backup job reads data but writes nothing. It needs SELECT on tables but no DDL privileges.",
    "code": "-- A read-only backup role\nCREATE ROLE backup_reader LOGIN;\nGRANT CONNECT ON DATABASE courses TO backup_reader;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_reader;",
    "practice": "List the privileges a backup job needs, and which it does not need.",
    "check": "What is the worst case if a backup job has DDL privileges?",
    "answer": "It could alter or delete tables during a routine backup run."
   },
   {
    "title": "Backup and restore",
    "objective": "Confirm a restore works before you need it.",
    "example": "A restore drill restores to a staging database and checks the row count and a sample record.",
    "code": "-- A restore checklist:\n// 1. Copy the backup file to a staging host.\n// 2. Run the restore script against a fresh database.\n// 3. Check the row count matches the source.\n// 4. Query a few sample rows.\n// 5. Record the restore time and the checksum.",
    "practice": "Write a restore checklist and add a timing estimate for each step.",
    "check": "How do you prove a restore is complete?",
    "answer": "Compare row counts, checksums, and a few sample records against the source."
   },
   {
    "title": "Monitoring and capacity",
    "objective": "Watch a database for problems before they happen.",
    "example": "A slow query on a large table triggers a page. The team adds an index and the query time drops from seconds to milliseconds.",
    "code": "-- A health check endpoint\napp.get('/health/db', async (req, res) => {\n  const rows = await db.query(\n    'SELECT count(*) AS count FROM pg_stat_user_tables'\n  );\n  const tables = Number(rows[0].count);\n  res.json({ tables, status: tables > 100 ? 'review' : 'ok' });\n});",
    "ok": "warning",
    "practice": "List three metrics you would chart for a production database and the action each one triggers.",
    "check": "What is a good first response to a sudden spike in slow queries?",
    "answer": "Find the slowest query with the query log or pg_stat_statements, inspect its plan, and add or fix an index."
   },
   {
    "title": "Automated Backup Verification",
    "objective": "Write a script to verify backups. Check checksums and row counts.",
    "example": "pg_dump creates a backup. gzip compresses it. sha256sum creates a checksum. Verify with psql.",
    "code": "#!/bin/bash\nBACKUP_DIR=/backups\nDATE=$(date +%Y%m%d)\n# Verify checksum\nsha256sum -c \"$BACKUP_DIR/courses_$DATE.sha256\"\n# Verify row count after a test restore\npsql -U backup_reader -d courses_restore \\\n  -c 'SELECT count(*) FROM courses;'",
    "practice": "Schedule this script with cron and make it send an alert when the checksum or row count check fails.",
    "check": "Is a backup that has never been restored a reliable backup?",
    "answer": "No. Only a tested restore proves the backup is complete and usable."
   },
   {
    "title": "PostgreSQL Log Analysis",
    "objective": "Analyze PostgreSQL logs to identify performance issues.",
    "example": "PostgreSQL logs with log_statement and log_duration. Use log_line_prefix for useful information.",
    "code": "-- postgresql.conf\nlog_statement = 'all'\nlog_duration = on\nlog_line_prefix = '%t [%p] user=%u, db=%d, state=%r'\nlog_min_duration_statement = 5000",
    "practice": "How would you configure PostgreSQL to log slow queries? What settings would you adjust?",
    "check": "Use log_min_duration_statement to log queries longer than a threshold. Analyze the logs.",
    "answer": "Use log_min_duration_statement to log slow queries. Analyze the logs for patterns."
   },
   {
    "title": "High Availability Setup",
    "objective": "Set up PostgreSQL high availability with streaming replication.",
    "example": "PostgreSQL streaming replication creates a standby server. Use pg_basebackup to create the standby.",
    "code": "-- On the standby server\npg_basebackup -h primary -D /var/lib/postgresql/data -U replicator -v -P\n-- Configure postgresql.conf on standby\nprimary_conninfo = 'host=primary port=5432 user=replicator password=secret'",
    "practice": "Set up a PostgreSQL standby server. How would you monitor the replication lag?",
    "check": "Use pg_basebackup for streaming replication. Monitor replication lag with pg_stat_replication.",
    "answer": "Use pg_basebackup for streaming replication. Monitor replication lag with pg_stat_replication."
   },
   {
    "title": "Index Maintenance",
    "objective": "Maintain database indexes for optimal performance.",
    "example": "Indexes can become fragmented over time. Use REINDEX to rebuild indexes. Use VACUUM to clean up.",
    "code": "-- Rebuild index\nREINDEX INDEX idx_books_title;\n\n-- Vacuum and analyze\nVACUUM ANALYZE books;",
    "practice": "Add a maintenance task to your script. How would you schedule it?",
    "check": "Use REINDEX to rebuild indexes. Use VACUUM to clean up. Schedule with cron.",
    "answer": "Use REINDEX to rebuild indexes. Use VACUUM to clean up. Schedule with cron."
   }
  ]
 },
 {
  "id": "database-admin",
  "title": "Database administration",
  "cat": "Data",
  "code": "11 · OPERATIONS",
  "desc": "Operate a database with attention to access, backups and reliability.",
  "outcome": "Manage a database with least privilege, tested backups, and a checked monitoring setup.",
  "sourceUrl": "https://www.postgresql.org/docs/current/",
  "sourceLabel": "PostgreSQL documentation",
  "example": "A restore drill checks whether backups can recover a service, not only whether a backup file exists.",
  "exercise": "Write a short restore checklist for a course database.",
  "quiz": "Why test a restore procedure?",
  "quizChoices": [
   "To verify the backup can recover usable data",
   "To make backups smaller",
   "To avoid access controls"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Roles and least privilege",
    "objective": "Do not give a role more access than the task requires.",
    "example": "A backup job reads data but writes nothing. It needs SELECT on the tables and no DDL privileges.",
    "code": "-- A read-only backup role\nCREATE ROLE backup_reader LOGIN;\nGRANT CONNECT ON DATABASE courses TO backup_reader;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_reader;",
    "practice": "List the privileges a backup job needs, and which it does not need.",
    "check": "What is the worst case if a backup job has DDL privileges?",
    "answer": "It could alter or delete tables during a routine backup run."
   },
   {
    "title": "Backup and restore",
    "objective": "Confirm a restore works before you need it.",
    "example": "A restore drill restores to a staging database and checks a row count and a sample record.",
    "code": "-- A restore checklist:\n// 1. Copy the backup file to a staging host.\n// 2. Run the restore script against a fresh database.\n// 3. Check the row count matches the source.\n// 4. Query a few sample rows.\n// 5. Record the restore time and the checksum.",
    "practice": "Write a restore checklist and add a timing estimate for each step.",
    "check": "How do you prove the restore is complete?",
    "answer": "Compare row counts, checksums and a few sample records against the source."
   },
   {
    "title": "Monitoring capacity and health",
    "objective": "Know when a database is near its limits and act before it breaks.",
    "example": "A slow query on a large table triggers a page to the team. The team adds an index, and the query time drops from seconds to milliseconds.",
    "code": "-- A health check endpoint\napp.get('/health/db', async (req, res) => {\n  const rows = await db.query(\n    'SELECT count(*) AS count FROM pg_stat_user_tables'\n  );\n  const tables = Number(rows[0].count);\n  res.json({ tables, status: tables > 100 ? 'review' : 'ok' });\n});",
    "ok": "warning",
    "practice": "Add a health check that reports the number of active connections. What threshold would trigger an alert?",
    "check": "Why alert before the database is full rather than when it fails?",
    "answer": "An early alert gives the team time to add capacity or fix a slow query before users see errors."
   },
   {
    "title": "PostgreSQL Backup Script",
    "objective": "Write a shell script to automate database backups with compression and checksums.",
    "example": "pg_dump creates a SQL dump. gzip compresses it. sha256sum creates a checksum. Use cron for scheduling.",
    "code": "#!/bin/bash\nBACKUP_DIR=/backups\nDATE=$(date +%Y%m%d)\npg_dump -U backup_reader courses > $BACKUP_DIR/courses_$DATE.sql\ngzip $BACKUP_DIR/courses_$DATE.sql\nsha256sum $BACKUP_DIR/courses_$DATE.sql.gz > $BACKUP_DIR/courses_$DATE.sha256",
    "practice": "Add a variable to the backup script to specify the database name. How would you make it work for multiple databases?",
    "check": "Use environment variables or command line arguments. Test the script by running it manually.",
    "answer": "Create a shell script. Use pg_dump, gzip, and sha256sum. Test it manually before automating with cron."
   },
   {
    "title": "Database Monitoring with pg_stat",
    "objective": "Write a query to monitor database health using pg_stat_activity and pg_stat_user_tables.",
    "example": "PostgreSQL provides views for monitoring. pg_stat_activity shows active connections. pg_stat_user_tables shows table stats.",
    "code": "SELECT datname, state, COUNT(*) AS active\nFROM pg_stat_activity\nGROUP BY datname, state\nORDER BY datname;",
    "practice": "Add a query to find long-running queries. What view would you use? How would you identify queries taking longer than 5 seconds?",
    "check": "Use pg_stat_activity and pg_stat_user_tables. Filter by state and duration. Alert on long-running queries.",
    "answer": "Use pg_stat_activity for connections. Use pg_stat_user_tables for table stats. Write queries to monitor health."
   },
   {
    "title": "PGASSWORD for Passwordless Auth",
    "objective": "Use PGPASSWORD to connect to PostgreSQL without a password in scripts.",
    "example": "pg_dump can use PGPASSWORD for passwordless connections. Set PGPASSWORD environment variable.",
    "code": "#!/bin/bash\nexport PGPASSWORD='password123'\npg_dump -U backup_reader -h localhost courses > /backups/courses.sql\nunset PGPASSWORD",
    "practice": "Write a script that connects to PostgreSQL without a password. What security risks should you consider?",
    "check": "Use PGPASSWORD environment variable. Set it before running the command. Unset it after. Use secure permissions.",
    "answer": "Use PGPASSWORD for passwordless auth. Set it before running the command. Unset it after. Use secure permissions."
   },
   {
    "title": "Database Connection Pooling",
    "objective": "Use a connection pooler like PgBouncer to manage database connections efficiently.",
    "example": "PgBouncer acts as a proxy. It manages connections to the database. It reduces the load on the database server.",
    "code": "-- PgBouncer config (pgbouncer.ini)\n[databases]\ncourses = host=localhost port=5432 dbname=courses\n\n[authorize]\nadmin_user = cert\n\n[stats]\nstats_period = 60",
    "practice": "How would you configure PgBouncer for a production database? What settings would you tune for performance?",
    "check": "Use PgBouncer in transaction pooling mode. Configure max_client_conn and pool_size. Monitor with pg_stat_activity.",
    "answer": "Use PgBouncer for connection pooling. Configure max_client_conn and pool_size. Monitor with pg_stat_activity."
   }
  ]
 },
 {
  "id": "data-analysis",
  "title": "Data analysis",
  "cat": "Data",
  "code": "12 · DATA",
  "desc": "Inspect and clean data using SQL, Python, and reporting tools.",
  "outcome": "Clean and analyze data, then present findings in a clear table.",
  "sourceUrl": "https://www.postgresql.org/docs/current/",
  "sourceLabel": "PostgreSQL documentation",
  "example": "A dataset of course completions is cleaned, grouped, and aggregated to find the completion rate by module.",
  "exercise": "Load a small CSV of course completions into a database. Write a query that returns the completion rate by course.",
  "quiz": "What is the best way to clean dirty data?",
  "quizChoices": [
   "Use automated tools to find and fix errors",
   "Ignore it and hope it goes away",
   "Always trust the source"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Data cleaning with SQL",
    "objective": "Find and fix dirty data using SQL queries.",
    "example": "A table has missing values, duplicate rows, and invalid entries. SQL queries can find them.",
    "code": "-- Find rows with missing values\nSELECT * FROM courses WHERE title IS NULL;\n\n-- Find duplicate rows\nSELECT title, COUNT(*) AS count\nFROM courses\nGROUP BY title\nHAVING COUNT(*) > 1;",
    "practice": "Find rows with invalid email addresses in a table.",
    "check": "How do you fix a row with missing data?",
    "answer": "Decide whether to fill it in, delete it, or mark it as unknown. Document the decision."
   },
   {
    "title": "Exploratory data analysis",
    "objective": "Summarize data and find patterns and outliers.",
    "example": "A course completion dataset is grouped by module and course. The average completion rate is calculated.",
    "code": "-- Average completion rate by course\nSELECT course_id, AVG(completion_rate) AS avg_rate\nFROM completions\nGROUP BY course_id\nORDER BY avg_rate DESC;",
    "practice": "Find the 10 courses with the highest enrollment in a dataset.",
    "check": "What does it mean to have a high variance in completion rates?",
    "answer": "It means some courses are very popular and others are not. The analyst should investigate why."
   },
   {
    "title": "Data quality checks and reporting",
    "objective": "Build repeatable checks that prevent dirty data from reaching reports.",
    "example": "Automated checks verify that every course has a title, every enrollment has a valid learner, and no date is in the future.",
    "code": "-- Data quality check\nSELECT 'missing_title' AS issue, COUNT(*) AS count\nFROM courses WHERE title IS NULL\nUNION ALL\nSELECT 'duplicate_courses', COUNT(*) FROM (\n  SELECT title FROM courses GROUP BY title HAVING COUNT(*) > 1\n) AS dupes;",
    "practice": "Write a check that flags enrollments where the completion date is before the enrollment date.",
    "check": "How often should you run data quality checks?",
    "answer": "Regularly, and whenever new data is added. Automated checks should run daily or per load."
   },
   {
    "title": "Data Cleaning with pandas",
    "objective": "Use pandas to clean and prepare data for analysis.",
    "example": "pandas.read_csv() loads data. df.dropna() removes rows with missing values. df.fillna() fills missing values.",
    "code": "import pandas as pd\ndf = pd.read_csv('data.csv')\n# Remove rows with missing values\ndf = df.dropna()\n# Fill missing values\ndf['price'] = df['price'].fillna(df['price'].mean())",
    "practice": "Load a CSV file and clean it. What transformations would you apply?",
    "check": "Use pandas for data cleaning. Remove or fill missing values. Standardize data formats.",
    "answer": "Use pandas for data cleaning. Remove or fill missing values. Standardize data formats."
   },
   {
    "title": "Data Visualization with matplotlib",
    "objective": "Create visualizations using matplotlib. Understand chart types.",
    "example": "matplotlib.pyplot provides plotting functions. Use plt.bar(), plt.line(), plt.scatter(), etc.",
    "code": "import matplotlib.pyplot as plt\nplt.bar(df['year'], df['value'])\nplt.xlabel('Year')\nplt.ylabel('Value')\nplt.title('Data Over Time')\nplt.show()",
    "practice": "Create a visualization for your dataset. What chart type would you choose? Why?",
    "check": "Use matplotlib for visualization. Choose the right chart type. Label axes and add titles.",
    "answer": "Use matplotlib for visualization. Choose the right chart type. Label axes and add titles."
   },
   {
    "title": "Statistical Analysis",
    "objective": "Perform statistical analysis on data. Understand mean, median, standard deviation, etc.",
    "example": "pandas provides statistical functions. df.mean(), df.median(), df.std(), df.describe()",
    "code": "import pandas as pd\ndf = pd.read_csv('data.csv')\n# Summary statistics\nprint(df.describe())\n# Mean, median, std\nprint(df['column'].mean())\nprint(df['column'].median())\nprint(df['column'].std())",
    "practice": "Calculate the mean, median, and standard deviation of a dataset. How would you interpret these values?",
    "check": "Use pandas for statistical analysis. Use df.describe() for summary statistics. Interpret the results.",
    "answer": "Use pandas for statistical analysis. Use df.describe() for summary statistics. Interpret the results."
   },
   {
    "title": "Time Series Analysis",
    "objective": "Analyze time series data. Use pandas for date-based analysis.",
    "example": "pandas reads dates with parse_dates. df.set_index() sets the index. df.resample() groups by time.",
    "code": "df = pd.read_csv('data.csv', parse_dates=['date'])\ndf = df.set_index('date')\ndf_resampled = df.resample('M').mean()",
    "practice": "Load time series data and resample it. What frequency would you choose? Why?",
    "check": "Use pandas for time series analysis. Use parse_dates and set_index. Resample to different frequencies.",
    "answer": "Use pandas for time series analysis. Use parse_dates and set_index. Resample to different frequencies."
   }
  ]
 },
 {
  "id": "cloud-frameworks",
  "title": "Spring Boot + Spring AI",
  "cat": "Java",
  "code": "12 · JAVA + AI",
  "desc": "Build a Spring Boot study assistant that retrieves course material and calls a model through Spring AI.",
  "outcome": "Create a small AI-backed service with clear API boundaries, grounded context, validated output and explicit failure handling.",
  "sourceUrl": "https://docs.spring.io/spring-ai/reference/",
  "sourceLabel": "Spring AI · reference guide",
  "example": "The Course Companion answers a question from the selected module's notes and returns the lesson sections it used. If retrieval finds no relevant notes, it says so instead of inventing a course answer.",
  "exercise": "Build the flow in milestones: a validated Spring Boot endpoint, a ChatClient-backed draft, document ingestion and retrieval, source-aware output, then tests for no matches and model timeout.",
  "quiz": "What does retrieval add to a course assistant?",
  "quizChoices": [
   "Relevant course passages and source references for the model to use",
   "A guarantee that every generated answer is correct",
   "A way to skip authorization checks"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Map the service before adding AI",
    "objective": "Separate the HTTP boundary, orchestration, retrieval and model call.",
    "example": "A learner question enters a controller, passes to a StudyAssistantService, retrieves course notes, then reaches the model. The service returns an answer with the notes it used.",
    "code": "QuestionController\n  -> StudyAssistantService\n    -> CourseRetriever\n    -> ChatClient\n  <- Answer + source references",
    "practice": "Draw the request path. Mark where input validation happens, where course access is checked and where model failures are handled.",
    "check": "Why should the controller avoid building the prompt itself?",
    "answer": "Keeping orchestration in a service makes the endpoint thin and lets the AI flow be tested without an HTTP request."
   },
   {
    "title": "Create a small Spring Boot API",
    "objective": "Define a stable request and response contract before wiring a model.",
    "example": "POST /study/answers accepts a course ID and question. The server checks that the learner can access that course before retrieving its notes.",
    "code": "record AskRequest(String courseId, String question) {}\nrecord SourceRef(String title, String section) {}\nrecord AskResponse(String answer, List<SourceRef> sources) {}",
    "practice": "Write acceptance checks for a blank question, an unknown course and a valid request. Decide what status the client should receive for each.",
    "check": "Why check course access before retrieval?",
    "answer": "It prevents a learner from retrieving documents outside the course they are allowed to use."
   },
   {
    "title": "Call a model through Spring AI",
    "objective": "Keep provider-specific model access behind Spring AI chat client boundary.",
    "example": "StudyAssistantService receives a configured ChatClient and asks it for a draft. The web controller does not depend on the model provider.",
    "code": "String draft = chatClient.prompt()\n    .user(question)\n    .call()\n    .content();",
    "practice": "Add the model call behind a StudyAssistantService method. Keep the HTTP request and response types independent of the provider API.",
    "check": "What becomes easier when callers depend on your service rather than a provider SDK?",
    "answer": "You can test and change the model integration without reshaping the web API or the rest of the application."
   },
   {
    "title": "Write prompts as a clear contract",
    "objective": "Separate trusted instructions, the learner question and retrieved course context.",
    "example": "Tell the assistant to answer from the supplied course excerpts, say when they do not contain the answer, and return source identifiers for claims it uses.",
    "code": "Instructions: answer from the course excerpts.\nQuestion: [learner input]\nExcerpts: [retrieved passages with IDs]",
    "practice": "Draft a short instruction for a course tutor. Add a rule for missing evidence and one for requests outside the course.",
    "check": "Should learner-supplied text be treated as trusted system instructions?",
    "answer": "No. Keep user text in the user-input part of the request and apply the application's trusted instructions separately."
   },
   {
    "title": "Prepare course notes for retrieval",
    "objective": "Turn source documents into searchable chunks while preserving useful provenance.",
    "example": "A database lesson is split into sections. Store course, module, section title and document URL as metadata so a result can point back to its origin.",
    "code": "source document\n  -> clean text\n  -> section-sized chunks + metadata\n  -> embeddings\n  -> vector store",
    "practice": "Choose chunk boundaries for a lesson with headings, code examples and a quiz. List the metadata needed to show a source link.",
    "check": "Why keep module and section metadata with each chunk?",
    "answer": "It helps filter results to the learner course and identify where a retrieved passage came from."
   },
   {
    "title": "Retrieve context before generating",
    "objective": "Use relevant course passages as context and keep their source IDs with the answer.",
    "example": "Search within the selected course, retrieve a few relevant passages, then ask the model to answer from those passages. Return their titles alongside the answer.",
    "code": "// FLOW, not Spring AI API code\ncontext = retrieve(courseId, question);\ndraft = generate(question, context);\nreturn answerWithSources(draft, context.sources());",
    "practice": "Plan what the service should return when retrieval finds no relevant passage. Avoid presenting an unsupported guess as a course fact.",
    "check": "Does retrieval guarantee that the model answer is correct?",
    "answer": "No. Retrieval supplies relevant context; the service still needs source display, output checks and a clear response when evidence is missing."
   },
   {
    "title": "Validate output before showing it",
    "objective": "Treat generated content as an untrusted draft and validate the response contract.",
    "example": "The response DTO requires a non-empty answer and source references that came from retrieved documents. The UI can show those sources next to the explanation.",
    "code": "Answer draft\n  -> parse into response shape\n  -> validate required fields\n  -> verify source IDs\n  -> return answer + references",
    "practice": "Define a response schema for an explanation, source list and \"not found in course notes\" state. What should happen if parsing fails?",
    "check": "Why should source references come from retrieval results, not model-invented URLs?",
    "answer": "The application can verify retrieved references and avoid presenting fabricated links as evidence."
   },
   {
    "title": "Test the flow without a live model",
    "objective": "Test retrieval, orchestration and error handling as separate behaviors.",
    "example": "A service test supplies a known retrieval result and a predictable model response. Separate tests cover no matching notes, a model timeout and a malformed draft.",
    "code": "Test cases\n- relevant notes -> answer includes those sources\n- no matches -> no unsupported course claim\n- model timeout -> controlled service error\n- invalid output -> do not return a broken response",
    "practice": "Write one test for an empty retrieval result and one for a model failure. State what the learner should see.",
    "check": "Why keep a test that does not call a real model?",
    "answer": "It is repeatable and lets you check application behavior without network cost or unpredictable model output."
   },
   {
    "title": "Secure and operate the assistant",
    "objective": "Protect credentials and learner data while making failures visible.",
    "example": "Keep provider keys in external configuration, enforce course authorization before retrieval, set request limits and record latency or error type without logging private prompts.",
    "code": "Configuration -> secret store / environment\nRequest -> authenticate -> authorize course\nModel call -> timeout + bounded input\nLogs -> latency + outcome, not raw private text",
    "practice": "Make a launch checklist for secret handling, access checks, timeout behavior, prompt privacy and source visibility.",
    "check": "What should an operational log capture if raw learner prompts are sensitive?",
    "answer": "Record useful metadata such as request outcome, latency and error category while avoiding unnecessary prompt or personal data."
   },
   {
    "title": "Docker for Spring Boot",
    "objective": "Containerize a Spring Boot application using Docker. Create a multi-stage Dockerfile.",
    "example": "Docker uses layers for images. Multi-stage builds reduce the final image size. Use a JRE image for production.",
    "code": "FROM maven:3.9-eclipse-temurin-21 AS build\nCOPY pom.xml /build/\nCOPY src /build/src\nRUN mvn -f /build/pom.xml package -DskipTests\n\nFROM eclipse-temurin:21-jre\nCOPY --from=build /build/target/*.jar /app/app.jar\nENTRYPOINT [\"java\", \"-jar\", \"/app/app.jar\"]",
    "practice": "Build the image and run it with docker run -p 8080:8080. How would you pass a database URL in?",
    "check": "Why use a multi-stage build?",
    "answer": "The final image only contains the JRE and the jar, so it is smaller and has fewer tools an attacker could use."
   },
   {
    "title": "Spring AI ChatClient",
    "objective": "Use Spring AI's ChatClient to send messages to an AI model. Configure it with a ChatOptions.",
    "example": "ChatClient is the main interface. ChatOptions configures the model, temperature, and max tokens.",
    "code": "ChatClient client = ChatClient.Builder.create(model)\n    .defaultChatOptions(ChatOptions.builder()\n        .temperature(0.7)\n        .maxTokens(500)\n        .build())\n    .build();",
    "practice": "Add a prompt template to the ChatClient. How would you use a template with variables?",
    "check": "Use PromptTemplate to create a template. Use WireMask to bind parameters. Test the response.",
    "answer": "Use ChatClient.Builder to configure the client. Use ChatOptions to set temperature and max tokens."
   },
   {
    "title": "Vector Store for RAG",
    "objective": "Use Spring AI's VectorStore to implement retrieval-augmented generation (RAG).",
    "example": "VectorStore stores vector embeddings. It supports similarity search. Spring AI uses it for RAG.",
    "code": "// In-memory store for local development\nVectorStore vectorStore = SimpleVectorStore.builder(embeddingModel).build();\n\nvectorStore.add(List.of(new Document(\"Spring Boot simplifies configuration.\")));\n\nList<Document> hits = vectorStore.similaritySearch(\n    SearchRequest.builder().query(\"How does Spring Boot help?\").topK(3).build());",
    "practice": "Load three short documents into the store and run a similarity search. Which document comes back first and why?",
    "check": "What does a vector store add to a model call?",
    "answer": "It finds the most relevant chunks of your own content so the model can answer from that context instead of guessing."
   },
   {
    "title": "Rate Limiting with Bucket4j",
    "objective": "Implement rate limiting for a Spring Boot application using Bucket4j.",
    "example": "Bucket4j provides token bucket algorithm. It can limit requests per second. Use it as a Spring Filter.",
    "code": "@Bean\npublic Bucket4jConfig bucket4jConfig() {\n  return Bucket4jConfig.builder()\n      .defaultPolicy(Bucket4jConfig.Policy.fixed(10, Duration.ofMinutes(1)))\n      .build();\n}",
    "practice": "Add rate limiting to a Spring Boot endpoint. How would you configure the limit? What happens when the limit is exceeded?",
    "check": "Use Bucket4j to limit requests. Configure the policy. Return 429 when limit is exceeded.",
    "answer": "Use Bucket4j for rate limiting. Configure the policy. Return 429 when limit is exceeded."
   },
   {
    "title": "Graceful Shutdown",
    "objective": "Implement graceful shutdown for a Spring Boot application. Handle slow requests and idle connections.",
    "example": "Spring Boot 2.3+ supports graceful shutdown. It stops accepting new requests before shutting down.",
    "code": "server.shutdown=graceful\nspring.lifecycle.timeout-per-shutdown-phase=30s",
    "practice": "Set a graceful shutdown timeout for your Spring Boot app. How would you test it?",
    "check": "Use server.shutdown=graceful. Set spring.lifecycle.timeout-per-shutdown-phase. Test the shutdown.",
    "answer": "Use server.shutdown=graceful. Set timeout. Test the shutdown. Handle slow requests."
   }
  ]
 },
 {
  "id": "web-patterns",
  "title": "Web patterns",
  "cat": "Web",
  "code": "10 · WEB",
  "desc": "Build pages with HTML and CSS, add JavaScript behavior, and connect React applications to clear API boundaries.",
  "outcome": "Create a web page that separates structure (HTML), style (CSS), behavior (JavaScript) and the API boundary.",
  "sourceUrl": "https://react.dev/learn",
  "sourceLabel": "React · Learn",
  "example": "A React client sends a typed request to a Spring Boot endpoint, which validates the input before saving it.",
  "exercise": "Draw a request path from an HTML form through JavaScript or PHP to a Spring Boot endpoint and database.",
  "quiz": "What is the API boundary responsible for?",
  "quizChoices": [
   "A defined contract between client and server",
   "Rendering every browser element",
   "Replacing database constraints"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "HTML structure and CSS layout",
    "objective": "Separate content from style so the page can change without breaking either.",
    "example": "A header is one <header> element with a logo and a nav. CSS puts the pieces in place and sets the spacing.",
    "code": "<header>\n  <a href='/'>Course Desk</a>\n  <nav><a href='/courses'>Courses</a></nav>\n</header>\n\n<style>\n  header { display: flex; gap: 1rem; align-items: center; }\n  nav { display: flex; gap: 0.5rem; }\n</style>",
    "practice": "Take one page you know and draw a box around the content, then put a second box around the style.",
    "check": "Can you change the color without touching the content?",
    "answer": "Yes. The HTML and CSS are separate files."
   },
   {
    "title": "JavaScript, PHP and HTTP forms",
    "objective": "Send data from a form to a server and read it back.",
    "example": "A login form posts a request to /login. The server checks the password and redirects to the dashboard.",
    "code": "<form action='/login' method='post'>\n  <label for='email'>Email</label>\n  <input id='email' name='email' type='email' required>\n  <label for='password'>Password</label>\n  <input id='password' name='password' type='password' required>\n  <button type='submit'>Sign in</button>\n</form>",
    "practice": "Add a form to a page that saves a lesson note to a PHP script.",
    "check": "What happens if the form submits to the wrong URL?",
    "answer": "The data goes nowhere. The action attribute must point to a handler that can read the request."
   },
   {
    "title": "React clients and API integration",
    "objective": "Use a client framework to call a server API and render the result.",
    "example": "A CourseList component fetches courses, shows a spinner while waiting, and renders each course as a button.",
    "code": "function CourseList({ onOpen }) {\n  const [courses, setCourses] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch('/api/courses')\n      .then(r => r.json())\n      .then(setCourses)\n      .catch(console.error)\n      .finally(() => setLoading(false));\n  }, []);\n\n  if (loading) return <p>Loading...</p>;\n  return (\n    <ul>\n      {courses.map(c => (\n        <li key={c.id}><button onClick={() => onOpen(c)}>{c.title}</button></li>\n      ))}\n    </ul>\n  );\n}",
    "practice": "Add a useEffect that loads data and shows a loading state before the list appears.",
    "check": "What happens if the network call fails?",
    "answer": "The component should show an error message and a retry button so the user is not stuck."
   },
   {
    "title": "Todo List App Implementation",
    "objective": "Build a working todo application using classes, arrays, and DOM manipulation.",
    "example": "A Course object stores lessons. A todo app stores tasks. Both use the same pattern: create objects, add items, list them.",
    "code": "class Todo {\n  constructor() {\n    this.tasks = [];\n  }\n  add(task) {\n    this.tasks.push(task);\n  }\n  list() {\n    return this.tasks.map(t => t.name);\n  }\n}",
    "practice": "Add a method to mark tasks as completed. What data structure would you use to track the state of each task?",
    "check": "Use an array of objects with a name, completed, and id property. Filter by completed status when listing.",
    "answer": "Use class Todo with tasks array. Add methods: add(), list(), toggleComplete(id). Store each task as an object with id, name, completed."
   },
   {
    "title": "REST API Client",
    "objective": "Call a REST API from JavaScript using fetch(). Handle loading, success, and error states.",
    "example": "fetch() returns a Promise. You can use .then() or async/await to handle it. Always handle errors.",
    "code": "async function fetchCourses() {\n  const res = await fetch('/api/courses');\n  if (!res.ok) throw new Error('Failed');\n  return await res.json();\n}",
    "practice": "Add a loading state to the todo app. Show a spinner while data is being fetched. What happens if the server is down?",
    "check": "Use a loading state variable. Show loading text or spinner. Catch errors with try/catch and show an error message.",
    "answer": "Use fetch() with async/await. Handle loading, success, and error states. Show loading spinner while waiting."
   },
   {
    "title": "Forms and Validation",
    "objective": "Build HTML forms with client-side validation. Use the Constraint Validation API.",
    "example": "HTML5 has built-in validation: required, minlength, pattern, etc. JavaScript can also validate.",
    "code": "const form = document.querySelector('form');\nform.addEventListener('submit', e => {\n  if (!form.checkValidity()) {\n    e.preventDefault();\n    alert('Please fill all required fields');\n  }\n});",
    "practice": "Add a form that submits a todo item. Validate that the task name is at least 3 characters.",
    "check": "Use form.checkValidity() to check. Validate on submit and on blur. Show error messages near fields.",
    "answer": "Use HTML5 validation attributes. Add JavaScript to enhance validation. Show custom error messages."
   },
   {
    "title": "CSS Grid Layout",
    "objective": "Use CSS Grid to create responsive layouts. Place items precisely.",
    "example": "CSS Grid is two-dimensional. Use display: grid, grid-template-columns, grid-gap, etc.",
    "code": "const container = document.createElement('div');\ncontainer.style.display = 'grid';\ncontainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))');\ncontainer.style.gap = '1rem';",
    "practice": "Create a grid layout for the todo app. Show tasks in a grid with responsive columns.",
    "check": "Use grid-template-columns with auto-fill and minmax. Use gap for spacing. Test on different screen sizes.",
    "answer": "Use CSS Grid for layout. Place items with grid-column and grid-row. Use media queries for responsive design."
   },
   {
    "title": "JavaScript Events",
    "objective": "Handle events in JavaScript. Use addEventListener to respond to user actions.",
    "example": "addEventListener() takes an event type and a handler function. events: click, input, submit, etc.",
    "code": "const button = document.querySelector('button');\nbutton.addEventListener('click', () => {\n  console.log('Button clicked!');\n});",
    "practice": "Add a button to the todo app that clears all completed tasks.",
    "check": "Use addEventListener with the click event. Find the button and add the event listener.",
    "answer": "Use addEventListener for all UI interactions. Use event delegation for dynamic elements."
   }
  ]
 },
 {
  "id": "security",
  "title": "Web security",
  "cat": "Security",
  "code": "8 · SECURITY",
  "desc": "Secure a web application by validating input, storing secrets safely, and scanning dependencies.",
  "outcome": "Validate input, store secrets outside the repository, and run a security check for a feature.",
  "sourceUrl": "https://react.dev/learn",
  "sourceLabel": "Course Desk · Security",
  "example": "A login form sends a username and password to a server. The server escapes the input before it is stored, and the session token is kept in a secure cookie.",
  "exercise": "Add a required field to a form. Validate the input on the client and server. Check that the secret is not in the repository.",
  "quiz": "What is the most important security step for a new feature?",
  "quizChoices": [
   "Validate and sanitize all input",
   "Using the newest framework",
   "Hiding the source code"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Validating and sanitizing input",
    "objective": "Treat all input as untrusted and verify, sanitize, and escape it before use.",
    "example": "A login form sends a username and password. The server escapes those strings before it stores them, and the session token is kept in a secure cookie.",
    "code": "// Validate input before it reaches the database\nfunction sanitizeInput(input) {\n  return input.replace(/[<>\"'\\/]/g, '');\n}\n\n// Use the validated input\nconst username = sanitizeInput(req.body.username);",
    "practice": "Add a required field to a form. Validate the input on the client and server.",
    "check": "What should you do if the input fails validation?",
    "answer": "Reject the input, show a clear error, and do not proceed with the action."
   },
   {
    "title": "Secrets, configuration, and transport",
    "objective": "Keep secrets out of the repository and use encrypted connections.",
    "example": "API keys and database passwords live in environment variables or a secret store. The application sets Secure and HttpOnly on cookies.",
    "code": "// .env file (never committed)\nDATABASE_URL=postgres://user:pass@host:5432/db\nAPI_KEY=sk-12345\n\n// Express server with secure cookies\nconst session = require('express-session');\napp.use(session({\n  secret: process.env.SESSION_SECRET,\n  cookie: { secure: true, httpOnly: true }\n}));",
    "practice": "Add a .gitignore entry for .env and any file that holds a secret.",
    "check": "What should you do if a secret is accidentally committed?",
    "answer": "Rotate the secret, remove it from the repository, and force a push to the remote."
   },
   {
    "title": "Dependency and API checks",
    "objective": "Compare the versions of a dependency before you add it, and check the change over time.",
    "example": "A course team adds a library to get a new feature. Team members review the dependency list, and the app checks the dependency list on every build.",
    "code": "// Compare versions before adding a dependency\n// Run a check in CI on every pull request",
    "practice": "Add a dependency to a project. Compare the versions before and after. Check the dependency list on every build.",
    "check": "What should you do when a dependency has a known vulnerability?",
    "answer": "Upgrade to a fixed version, or switch to an alternative that is maintained."
   },
   {
    "title": "OWASP Top 10",
    "objective": "Understand the OWASP Top 10 vulnerabilities. How to prevent them.",
    "example": "OWASP Top 10 lists the most critical web application security risks. SQL injection, XSS, CSRF, etc.",
    "code": "// OWASP Top 10 (2021)\n// A01:2021 - Broken Access Control\n// A02:2021 - Cryptographic Failures\n// A03:2021 - Injection\n// A04:2021 - Insecure Design\n// A05:2021 - Security Misconfiguration\n// A06:2021 - Vulnerable and Outdated Components\n// A07:2021 - Identification and Authentication Failures\n// A08:2021 - Software and Data Integrity Failures\n// A09:2021 - Security Logging and Monitoring Failures\n// A10:2021 - Server-Side Request Forgery (SSRF)",
    "practice": "Research one OWASP vulnerability. How would you prevent it in your application?",
    "check": "Use OWASP Top 10 as a reference. Implement security controls based on the top risks.",
    "answer": "Use OWASP Top 10 as a reference. Implement security controls based on the top risks."
   },
   {
    "title": "Authentication Flow",
    "objective": "Implement authentication in a web application. Use sessions and JWT.",
    "example": "Authentication verifies identity. Sessions store user state. JWT (JSON Web Tokens) are stateless.",
    "code": "// JWT token structure: header.payload.signature\n//\n// Example payload\n// {\n//   \"sub\": \"user-42\",\n//   \"role\": \"student\",\n//   \"exp\": 1767225600\n// }\n\nconst token = jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '15m' });\nconst claims = jwt.verify(token, SECRET); // throws if tampered or expired",
    "sub": "1234567890",
    "practice": "Sketch the login flow: credentials in, token out, token checked on each request. Where does the token expire?",
    "check": "Why keep access tokens short-lived?",
    "answer": "A stolen short-lived token stops working quickly, which limits the damage."
   },
   {
    "title": "XSS Prevention",
    "objective": "Prevent Cross-Site Scripting (XSS) attacks. Sanitize user input.",
    "example": "XSS allows attackers to inject client-side scripts. Sanitize input and escape output.",
    "code": "// XSS Prevention: Escape output\n// Never trust user input\nfunction escapeHtml(str) {\n  const div = document.createElement('div');\n  div.textContent = str;\n  return div.innerHTML;\n}\n\n// Sanitize input\nfunction sanitizeInput(input) {\n  const div = document.createElement('div');\n  div.textContent = input;\n  return div.innerText;\n}",
    "practice": "Write a function that sanitizes user input. How would you test it?",
    "check": "Use a sanitization library. Escape output. Validate input on the server side.",
    "answer": "Use a sanitization library. Escape output. Validate input on the server side."
   },
   {
    "title": "CSRF Protection",
    "objective": "Protect against Cross-Site Request Forgery (CSRF) attacks.",
    "example": "CSRF tricks users into submitting requests. Use CSRF tokens to prevent it.",
    "code": "// Generate a token and store it in the session\nconst csrfToken = crypto.randomBytes(32).toString('hex');\nreq.session.csrfToken = csrfToken;\n\n// Send it in the form\n// <input type=\"hidden\" name=\"csrfToken\" value=\"...\">\n\n// Check it on submit\nif (req.body.csrfToken !== req.session.csrfToken) {\n  return res.status(403).send('Invalid CSRF token');\n}",
    "practice": "Add a CSRF token to a form that changes data. What happens if an attacker page submits the form without it?",
    "check": "Which requests need CSRF protection?",
    "answer": "Any request that changes state (POST, PUT, DELETE) and is authenticated by a cookie."
   },
   {
    "title": "Encryption",
    "objective": "Use encryption to protect data. Understand symmetric and asymmetric encryption.",
    "example": "Encryption converts plaintext to ciphertext. Symmetric encryption uses the same key. Asymmetric uses public/private keys.",
    "code": "// Symmetric encryption\nconst crypto = require('crypto');\nconst algorithm = 'aes-256-cbc';\nconst key = crypto.scryptSync('password', 'salt', 32);\nconst iv = crypto.randomBytes(16);\nconst cipher = crypto.createCipher(algorithm, key, iv);\nlet encrypted = cipher.update('secret', 'utf8', 'hex');\nencrypted += cipher.final('hex');",
    "practice": "Write a function that encrypts data. How would you decrypt it?",
    "check": "Use crypto module for encryption. Use a secure algorithm. Test encryption and decryption.",
    "answer": "Use crypto module for encryption. Use a secure algorithm. Test encryption and decryption."
   }
  ]
 },
 {
  "id": "project-management",
  "title": "Project management",
  "cat": "Team",
  "code": "4 · TEAM",
  "desc": "Run a small study with a task list, peer review, and a readable history.",
  "outcome": "Split a task into small pieces, review a change in a short review, and push a clear history.",
  "sourceUrl": "https://react.dev/learn",
  "sourceLabel": "Course Desk · Project Management",
  "example": "A task list has five items. A pair of students works on one, writes a test, and merges. The history shows the task, the review, and the lesson learned.",
  "exercise": "Pick one task from a list, do it, and make a one-paragraph summary. List what you did and what you learned.",
  "quiz": "What is the first step in planning a small project?",
  "quizChoices": [
   "List the tasks and pick one",
   "Assign all tasks at once",
   "Skip the list and start coding"
  ],
  "answer": 0,
  "lessons": [
   {
    "title": "Task splitting and descriptions",
    "objective": "Break a goal into small tasks that are independent and testable.",
    "example": "A course rubric is in one place. A new course uses the same rubric, and prs follow the same review rules.",
    "code": "// One task: one clear outcome\n// Small units: review and test each one\n// List the tasks and pick one until you have no tasks left",
    "practice": "Split one task into at least three smaller tasks. Mark each as done or blocked.",
    "check": "How do you know a task is too large?",
    "answer": "If it takes more than a day and involves design, write, or a review, split it into smaller units."
   },
   {
    "title": "Review with a reader and a reviewer",
    "objective": "Use short PRs and clear feedback to ship better changes.",
    "example": "A learner adds a method to a course. One other person reviews it. The writer answers questions, fixes a small bug, and merges.",
    "code": "// PR checklist:\n// - [ ] Test covers the new behavior\n// - [ ] No breaking changes\n// - [ ] Docs updated\n// - [ ] Reviewed by a peer",
    "practice": "Open a PR with a clear description. Set a timer and ask for a review within the time frame.",
    "check": "What should you do if the reviewer asks for a large change?",
    "answer": "Discuss it, then split it into smaller units. You review and test each one before you merge it."
   },
   {
    "title": "History, review proof, and lesson log",
    "objective": "Keep the project history clear so the next person can see what was done and why.",
    "example": "The project notes show the task list, the reviewers, and the next steps. The code has a clear history of commits and a few sentences per commit.",
    "code": "// History is a record of what happened, not a list of what was designed\n// Keep it concise and honest",
    "practice": "Write a short note for each commit that says what changed and why.",
    "check": "What should you do if a commit does not describe the change?",
    "answer": "Add a follow-up commit that describes the change. Keep it small, honest, and easy to search."
   },
   {
    "title": "Project Estimation",
    "objective": "Estimate project effort. Use story points and velocity.",
    "example": "Story points estimate effort. Velocity is the average points done per sprint. Use planning poker.",
    "code": "// Story Points Estimation\n// \n// 1 point: Trivial task (< 1 hour)\n// 2 points: Simple task (1-2 hours)\n// 3 points: Moderate task (2-4 hours)\n// 5 points: Complex task (4-8 hours)\n// 8 points: Major task (8+ hours)\n//\n// Velocity = average points completed per sprint",
    "practice": "Estimate a project using story points. What assumptions did you make?",
    "check": "Use story points for estimation. Track velocity over sprints. Adjust as needed.",
    "answer": "Use story points for estimation. Track velocity over sprints. Adjust as needed."
   },
   {
    "title": "Risk Management",
    "objective": "Identify and manage project risks.",
    "example": "Risk management identifies, assesses, and mitigates risks. Use a risk matrix.",
    "code": "// Risk Matrix:\n// | Likelihood \\ Impact | Low | Medium | High |\n// |-------------------|-----|--------|------|\n// | High              | 3   | 6      | 9    |\n// | Medium            | 2   | 4      | 6    |\n// | Low               | 1   | 2      | 3    |\n//\n// Score > 6: High risk, plan mitigation",
    "practice": "Create a risk matrix for your project. What risks would you plan for?",
    "check": "Use a risk matrix to identify risks. Plan mitigation strategies. Review regularly.",
    "answer": "Use a risk matrix to identify risks. Plan mitigation strategies. Review regularly."
   },
   {
    "title": "Communication Plan",
    "objective": "Create a communication plan for your project.",
    "example": "A communication plan defines who communicates what, when, and how.",
    "code": "// Communication Plan:\n// Daily Standup: 15 min, all team members\n// Sprint Planning: 1 hour, per sprint\n// Retro: 30 min, per sprint\n// Status Report: Weekly, to stakeholders\n//\n// Tools: Slack, Jira, GitHub",
    "practice": "Write a communication plan for a project. What meetings would you schedule?",
    "check": "Create a communication plan. Schedule regular meetings. Use the right tools.",
    "answer": "Create a communication plan. Schedule regular meetings. Use the right tools."
   },
   {
    "title": "Retrospective Format",
    "objective": "Run effective retrospectives. Continuously improve team process.",
    "example": "A retrospective is a meeting where the team reflects on the sprint and identifies improvements.",
    "code": "// Retro Agenda:\n// 1. What went well? (Glad)\n// 2. What went wrong? (Sad)\n// 3. What could we improve? (Mad)\n// 4. Action items: What will we do differently next sprint?",
    "practice": "Run a retrospective for your team. What action items would you create?",
    "check": "Use a structured format for retrospectives. Create action items. Follow up on them.",
    "answer": "Use a structured format for retrospectives. Create action items. Follow up on them."
   }
  ]
 }
];
