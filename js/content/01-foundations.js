/* Foundations: Java fundamentals, OOP, data structures. */
(function (M, L) {

M.push({
  id: 'java-fundamentals', title: 'Java fundamentals', cat: 'Foundations', code: '01 · FOUNDATIONS',
  desc: 'Write correct, readable Java: types, control flow, methods, strings, collections, exceptions and streams.',
  outcome: 'Solve small problems in Java using the standard library, and explain what each line does.',
  jobSkills: ['Coding proficiency in Java, Python, C++ or JavaScript', 'Object-oriented programming language fluency'],
  sourceUrl: 'https://dev.java/learn/', sourceLabel: 'Dev.java · Learn Java',
  example: 'A grade calculator reads scores into a List<Integer>, rejects invalid values with an exception, and prints the average with a stream.',
  exercise: 'Write a Java program that reads words from a sentence, counts each word with a HashMap, and prints the three most frequent words.',
  quiz: 'Which comparison checks whether two Java String objects contain the same text?',
  quizChoices: ['a.equals(b)', 'a == b', 'a.compareTo(b) == 1'], answer: 0,
  lessons: [
    L('Types, variables and control flow',
      'Choose the right primitive or reference type and control the program with if, switch and loops.',
      'A loop totals the even numbers from 1 to 10. int holds whole numbers; long is needed once totals can exceed about 2.1 billion.',
String.raw`public class Totals {
    public static void main(String[] args) {
        int total = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                total += i;
            }
        }
        System.out.println("Sum of evens: " + total); // 30
    }
}`,
      'Change the loop to print FizzBuzz for 1 to 15: multiples of 3 print Fizz, of 5 print Buzz, of both print FizzBuzz.',
      'What happens when an int goes past Integer.MAX_VALUE?',
      'It overflows silently and wraps around to a negative number. Use long, or Math.addExact to throw on overflow.'),
    L('Methods, parameters and return values',
      'Split logic into small methods with clear inputs and outputs, and understand pass-by-value.',
      'isPalindrome takes a String and returns a boolean. It does one job and is easy to test.',
String.raw`static boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++;
        right--;
    }
    return true;
}`,
      'Write a method maxOf(int[] values) that throws IllegalArgumentException for an empty array.',
      'Java passes an object reference into a method. If the method reassigns the parameter, does the caller see the new object?',
      'No. Java is always pass-by-value: the reference is copied. Changing the object\'s fields is visible to the caller, but reassigning the parameter is not.'),
    L('Strings and StringBuilder',
      'Work with immutable Strings and build text efficiently.',
      'Reversing words in a sentence: split on whitespace, then join in reverse order with StringBuilder.',
String.raw`static String reverseWords(String sentence) {
    String[] words = sentence.trim().split("\\s+");
    StringBuilder sb = new StringBuilder();
    for (int i = words.length - 1; i >= 0; i--) {
        sb.append(words[i]);
        if (i > 0) sb.append(' ');
    }
    return sb.toString();
}`,
      'Write a method that returns true when two strings are anagrams. Ignore case and spaces.',
      'Why is s = s + c inside a loop slow for long strings?',
      'Strings are immutable, so each + creates a new String and copies the old text: O(n²) overall. StringBuilder appends in amortised O(1).'),
    L('Arrays and the Collections framework',
      'Pick between arrays, ArrayList, HashMap, HashSet and ArrayDeque based on the operations you need.',
      'A word counter uses HashMap<String, Integer> and merge() to count each word in one pass.',
String.raw`Map<String, Integer> counts = new HashMap<>();
for (String word : text.toLowerCase().split("\\W+")) {
    if (!word.isEmpty()) {
        counts.merge(word, 1, Integer::sum);
    }
}
List<String> unique = new ArrayList<>(counts.keySet());
Collections.sort(unique);`,
      'Store the words in a TreeMap instead. What changes about iteration order and lookup cost?',
      'When would you use a HashSet instead of an ArrayList?',
      'When you need fast membership checks (average O(1) contains) and duplicates are not allowed. ArrayList.contains is O(n).'),
    L('Exceptions and error handling',
      'Throw exceptions for invalid input, catch them where you can recover, and clean up with try-with-resources.',
      'Reading a file with try-with-resources closes the reader even if parsing throws.',
String.raw`static List<Integer> readScores(Path path) throws IOException {
    List<Integer> scores = new ArrayList<>();
    try (BufferedReader reader = Files.newBufferedReader(path)) {
        String line;
        while ((line = reader.readLine()) != null) {
            int score = Integer.parseInt(line.trim());
            if (score < 0 || score > 100) {
                throw new IllegalArgumentException("Score out of range: " + score);
            }
            scores.add(score);
        }
    }
    return scores;
}`,
      'Catch NumberFormatException in the caller and report the bad line number instead of crashing.',
      'What is the difference between a checked and an unchecked exception?',
      'Checked exceptions (like IOException) must be declared or caught; the compiler enforces it. Unchecked exceptions extend RuntimeException (like IllegalArgumentException) and usually signal programming errors.'),
    L('Generics, lambdas and streams',
      'Write type-safe code with generics and transform collections with lambdas and the Stream API.',
      'Filter passing students and sort them by score, highest first, in one readable pipeline.',
String.raw`record Student(String name, int score) {}

List<String> passed = students.stream()
    .filter(s -> s.score() >= 40)
    .sorted(Comparator.comparingInt(Student::score).reversed())
    .map(Student::name)
    .toList();`,
      'Use Collectors.groupingBy to group students into grade bands (A, B, C, F).',
      'Is a stream pipeline run when you call filter()?',
      'No. Intermediate operations like filter and map are lazy; nothing runs until a terminal operation such as toList, count or forEach.'),
    L('Java and Python side by side',
      'Read and write the same logic in Python, the other language most Irish internship posts list.',
      'Counting words: Java needs explicit types; Python uses dynamic typing and a Counter.',
String.raw`# Python
from collections import Counter

def top_words(text, k=3):
    words = text.lower().split()
    return [w for w, _ in Counter(words).most_common(k)]

// Java
static List<String> topWords(String text, int k) {
    Map<String, Long> counts = Arrays.stream(text.toLowerCase().split("\\s+"))
        .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
    return counts.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .limit(k).map(Map.Entry::getKey).toList();
}`,
      'Translate your FizzBuzz and isPalindrome methods into Python.',
      'Which Python built-in type matches Java\'s HashMap?',
      'dict. A Python set matches HashSet, and a list matches ArrayList.'),
  ],
});

M.push({
  id: 'oop', title: 'Object-oriented design', cat: 'Foundations', code: '02 · FOUNDATIONS',
  desc: 'Model a system as collaborating objects with clear responsibilities, then apply SOLID and common patterns.',
  outcome: 'Break a problem into classes, justify each responsibility, and write code that is easy to test and change.',
  jobSkills: ['Object-oriented design and software design principles', 'Software design (MongoDB, Google)'],
  sourceUrl: 'https://dev.java/learn/oop/', sourceLabel: 'Dev.java · OOP concepts',
  example: 'A library system has Book, Member and Loan classes. Loan knows its due date; Member knows its loans; neither needs to know how fines are stored.',
  exercise: 'Design a parking garage: list the classes, their fields and methods, and which class decides whether a car can park.',
  quiz: 'What makes a good class?',
  quizChoices: ['One clear responsibility and low coupling', 'Many public fields so other classes can change it', 'As much behaviour as possible in one place'], answer: 0,
  lessons: [
    L('Classes, objects and encapsulation',
      'Define a class with private state and public methods that protect its rules.',
      'A BankAccount keeps balance private. Deposits and withdrawals go through methods that reject invalid amounts.',
String.raw`public class BankAccount {
    private final String owner;
    private long balanceCents;

    public BankAccount(String owner) { this.owner = owner; }

    public void deposit(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("Deposit must be positive");
        balanceCents += cents;
    }

    public void withdraw(long cents) {
        if (cents > balanceCents) throw new IllegalStateException("Insufficient funds");
        balanceCents -= cents;
    }

    public long getBalanceCents() { return balanceCents; }
}`,
      'Add a transfer(BankAccount to, long cents) method. Which object should check the balance?',
      'Why store money as long cents instead of double euros?',
      'Floating-point numbers cannot represent most decimal fractions exactly (0.1 + 0.2 != 0.3), so rounding errors creep into money. Integers in cents, or BigDecimal, are exact.'),
    L('Inheritance, interfaces and polymorphism',
      'Use interfaces to define behaviour and let different classes provide it.',
      'A Shape interface has area(). Circle and Rectangle implement it, and code that sums areas never checks the concrete type.',
String.raw`interface Shape { double area(); }

record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
}
record Rectangle(double w, double h) implements Shape {
    public double area() { return w * h; }
}

static double totalArea(List<Shape> shapes) {
    return shapes.stream().mapToDouble(Shape::area).sum();
}`,
      'Add a Triangle shape without changing totalArea. Which SOLID principle does that show?',
      'What is polymorphism in one sentence?',
      'Calling the same method on different objects runs each object\'s own implementation, so callers depend on the interface, not the concrete class.'),
    L('Composition over inheritance',
      'Build behaviour by combining objects instead of deep class hierarchies.',
      'A Car has an Engine rather than extending it. Swapping a PetrolEngine for an ElectricEngine needs no new Car subclass.',
String.raw`interface Engine { String start(); }
class PetrolEngine implements Engine { public String start() { return "Vroom"; } }
class ElectricEngine implements Engine { public String start() { return "Hum"; } }

class Car {
    private final Engine engine;
    Car(Engine engine) { this.engine = engine; }
    String start() { return engine.start(); }
}`,
      'Model a Duck that can fly or not fly. Do it once with inheritance and once with a FlyBehaviour field. Which is easier to extend?',
      'When is inheritance the right choice?',
      'When there is a genuine is-a relationship and the subclass can be used anywhere the parent is expected without surprises (the Liskov substitution principle).'),
    L('Dependency injection and testability',
      'Pass dependencies in through the constructor so you can replace them in tests.',
      'An OrderService gets a PaymentGateway in its constructor. Tests pass a fake gateway, so no real card is charged.',
String.raw`interface PaymentGateway { boolean charge(String customerId, long cents); }

class OrderService {
    private final PaymentGateway payments;
    OrderService(PaymentGateway payments) { this.payments = payments; }

    boolean placeOrder(String customerId, long cents) {
        return payments.charge(customerId, cents);
    }
}

// In a test
PaymentGateway fake = (id, cents) -> true;
assertTrue(new OrderService(fake).placeOrder("c1", 500));`,
      'Write a fake gateway that always declines and test that placeOrder returns false.',
      'What does Spring\'s dependency injection container do for you?',
      'It creates objects (beans) and wires their constructor dependencies automatically, so classes never construct their own collaborators.'),
    L('SOLID principles',
      'Apply the five SOLID principles to keep classes small and changes local.',
      'A ReportService that queries data, formats a PDF and emails it has three reasons to change. Splitting it gives each class one job.',
String.raw`// S: one reason to change
class ReportData   { List<Row> load(LocalDate month) { /* query */ return List.of(); } }
class PdfFormatter { byte[] format(List<Row> rows) { /* render */ return new byte[0]; } }
class ReportMailer { void send(byte[] pdf, String to) { /* email */ } }

// D: depend on abstractions
interface Formatter { byte[] format(List<Row> rows); }`,
      'Find a class in your own project with more than one responsibility and sketch how you would split it.',
      'What does the Open-Closed principle say?',
      'Classes should be open for extension but closed for modification: add new behaviour with new code (for example, a new interface implementation) instead of editing tested code.'),
    L('Common design patterns',
      'Recognise Strategy, Factory, Observer and Builder, and know the problem each one solves.',
      'Strategy: a checkout picks a DiscountStrategy at runtime. Adding a student discount means adding one class.',
String.raw`interface DiscountStrategy { long apply(long cents); }
class NoDiscount implements DiscountStrategy { public long apply(long c) { return c; } }
class StudentDiscount implements DiscountStrategy { public long apply(long c) { return c * 90 / 100; } }

class Checkout {
    private final DiscountStrategy discount;
    Checkout(DiscountStrategy discount) { this.discount = discount; }
    long total(long cents) { return discount.apply(cents); }
}`,
      'Use the Builder pattern for a Pizza class with optional toppings. Why is it clearer than a constructor with eight parameters?',
      'Which pattern lets many objects react when one object changes?',
      'Observer: subscribers register with a subject and are notified on change. Event listeners in JavaScript and Spring application events use it.'),
    L('Designing from requirements',
      'Turn a written requirement into classes, relationships and a UML-style sketch, as asked in design interviews.',
      'Requirement: "Members borrow up to 3 books for 14 days." Nouns become candidates (Member, Book, Loan); verbs become methods (borrow, return); rules become checks.',
String.raw`Member 1 ── * Loan * ── 1 Book

class Member {
    List<Loan> activeLoans();
    boolean canBorrow() { return activeLoans().size() < 3; }
}
class Loan {
    Book book; Member member; LocalDate due;
    boolean isOverdue(LocalDate today) { return today.isAfter(due); }
}`,
      'Extend the design so overdue books charge a fine of 20c per day. Which class owns the calculation?',
      'Why pick nouns and verbs from the requirement?',
      'It is a quick way to find candidate classes (nouns) and responsibilities (verbs). You then merge, rename or drop candidates that do not carry real behaviour.'),
  ],
});

M.push({
  id: 'data-structures', title: 'Data structures', cat: 'Foundations', code: '03 · FOUNDATIONS',
  desc: 'Know how arrays, hash maps, stacks, queues, linked lists, trees, heaps and graphs work, and what each operation costs.',
  outcome: 'Pick the right data structure for a problem and state the Big-O cost of its key operations.',
  jobSkills: ['Experience with data structures and algorithms', 'Solid understanding of algorithms and data structures (Intel)'],
  sourceUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html', sourceLabel: 'java.util API reference',
  example: 'An autocomplete box keeps recent searches in a LinkedHashMap (fast lookup, insertion order) and suggests words from a trie.',
  exercise: 'For each scenario, pick a structure and give the cost: undo history, task scheduler by priority, checking whether a username exists, and shortest route between two stations.',
  quiz: 'What is the average time to look up a key in a hash map?',
  quizChoices: ['O(1)', 'O(log n)', 'O(n)'], answer: 0,
  lessons: [
    L('Big-O notation',
      'Describe how running time and memory grow with input size, and compare O(1), O(log n), O(n), O(n log n) and O(n²).',
      'Checking every pair in a list of 10,000 items is about 50 million comparisons (O(n²)). Sorting first, then scanning once, is O(n log n) and far faster.',
String.raw`// O(n²): compare every pair
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
        if (a[i] == a[j]) return true;

// O(n) time, O(n) space: remember what you have seen
Set<Integer> seen = new HashSet<>();
for (int x : a) if (!seen.add(x)) return true;
return false;`,
      'State the time and space complexity of each loop you wrote in the Java fundamentals module.',
      'Why do we drop constants, so O(2n) becomes O(n)?',
      'Big-O describes growth as n gets large. Constant factors depend on hardware and implementation, and they do not change which algorithm wins for large inputs.'),
    L('Arrays and dynamic arrays',
      'Use index access in O(1) and understand why inserting in the middle costs O(n).',
      'ArrayList stores elements in an array and doubles its capacity when full, so add() at the end is amortised O(1).',
String.raw`int[] scores = {72, 85, 91};
int first = scores[0];          // O(1) access

List<Integer> list = new ArrayList<>();
list.add(10);                   // amortised O(1)
list.add(0, 5);                 // O(n): shifts every element
list.remove(Integer.valueOf(10)); // O(n): search then shift`,
      'Implement a method that rotates an array right by k steps in O(n) time and O(1) extra space.',
      'Why is add() at the end of an ArrayList "amortised" O(1) rather than always O(1)?',
      'Occasionally the array is full and must be copied to a bigger one (O(n)), but doubling makes those copies rare, so the average cost per add stays constant.'),
    L('Hash maps and hash sets',
      'Use hashing for fast lookups, and know what happens on collisions.',
      'Two Sum: store each number\'s index in a map, then for each number check whether target - number is already there. One pass, O(n).',
String.raw`static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> indexOf = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        Integer j = indexOf.get(target - nums[i]);
        if (j != null) return new int[] { j, i };
        indexOf.put(nums[i], i);
    }
    return new int[0];
}`,
      'Solve the Two Sum challenge in the practice lab, then group a list of words into anagram groups using a map.',
      'If you override equals() in a class used as a HashMap key, what else must you override?',
      'hashCode(). Equal objects must have equal hash codes, otherwise the map looks in the wrong bucket and cannot find the key.'),
    L('Stacks and queues',
      'Use a stack (last in, first out) and a queue (first in, first out), and know where each appears.',
      'Valid parentheses: push each opening bracket and pop when a closing bracket arrives. A mismatch or a leftover bracket means invalid.',
String.raw`static boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        switch (c) {
            case '(' -> stack.push(')');
            case '[' -> stack.push(']');
            case '{' -> stack.push('}');
            default -> {
                if (stack.isEmpty() || stack.pop() != c) return false;
            }
        }
    }
    return stack.isEmpty();
}`,
      'Implement a queue using two stacks. What is the amortised cost of dequeue?',
      'Which Java class should you use for a stack, and why not java.util.Stack?',
      'ArrayDeque. Stack is a legacy synchronised class built on Vector; ArrayDeque is faster and the documented replacement.'),
    L('Linked lists',
      'Traverse, insert and reverse a singly linked list, and compare it with an array.',
      'Reversing a list in place walks once and flips each next pointer, using three variables.',
String.raw`class Node { int val; Node next; Node(int v) { val = v; } }

static Node reverse(Node head) {
    Node prev = null, curr = head;
    while (curr != null) {
        Node next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      'Detect a cycle in a linked list using a slow and a fast pointer (Floyd\'s algorithm).',
      'When is a linked list better than an array?',
      'When you insert or remove often at known positions (O(1) once you hold the node), such as an LRU cache. Arrays win for index access and cache-friendly scanning.'),
    L('Trees and binary search trees',
      'Traverse trees recursively and use a BST for ordered data with O(log n) operations when balanced.',
      'In-order traversal of a BST visits values in sorted order.',
String.raw`class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

static void inOrder(TreeNode node, List<Integer> out) {
    if (node == null) return;
    inOrder(node.left, out);
    out.add(node.val);
    inOrder(node.right, out);
}

static int height(TreeNode node) {
    return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
}`,
      'Write isValidBST(root) that checks every node is within a (min, max) range.',
      'What is the worst-case lookup time in an unbalanced BST, and when does it happen?',
      'O(n). Inserting already-sorted values makes the tree a straight line, like a linked list. Balanced trees (red-black, as in TreeMap) keep it O(log n).'),
    L('Heaps and priority queues',
      'Use a heap to always get the smallest (or largest) item in O(log n).',
      'Top K frequent words: count with a map, then keep a min-heap of size k so the heap never grows past k.',
String.raw`static List<String> topK(Map<String, Integer> counts, int k) {
    PriorityQueue<Map.Entry<String, Integer>> heap =
        new PriorityQueue<>(Map.Entry.comparingByValue());
    for (var e : counts.entrySet()) {
        heap.offer(e);
        if (heap.size() > k) heap.poll(); // drop the smallest
    }
    List<String> result = new ArrayList<>();
    while (!heap.isEmpty()) result.add(0, heap.poll().getKey());
    return result;
}`,
      'Merge k sorted lists into one sorted list using a priority queue.',
      'Why keep a min-heap of size k instead of sorting all n items?',
      'Sorting costs O(n log n). A size-k heap costs O(n log k), which is much smaller when k is small, and uses only O(k) extra memory.'),
    L('Graphs',
      'Represent a graph with an adjacency list and know when a problem is secretly a graph problem.',
      'Course prerequisites form a directed graph. If it has a cycle, no valid study order exists.',
String.raw`Map<String, List<String>> graph = new HashMap<>();
void addEdge(String from, String to) {
    graph.computeIfAbsent(from, k -> new ArrayList<>()).add(to);
    graph.computeIfAbsent(to, k -> new ArrayList<>());
}

// Grid problems are graphs too: each cell links to its 4 neighbours
int[][] DIRS = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };`,
      'Model a city\'s train network as a graph. Which structure stores it, and how many edges does each station have?',
      'Adjacency list or adjacency matrix: which suits a sparse graph?',
      'An adjacency list. It uses O(V + E) memory, while a matrix always uses O(V²) even when most pairs are not connected.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
