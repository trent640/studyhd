/* Python, TypeScript and choosing more languages. */
(function (M, L) {

M.push({
  id: 'python', title: 'Python fundamentals', cat: 'Foundations', code: 'PY · LANGUAGES',
  desc: 'Learn Python, the second most requested internship language after Java, for scripting, data work and coding tests.',
  outcome: 'Write clean Python functions with lists, dicts, classes and tests, and solve assessment problems in it.',
  jobSkills: ['Coding proficiency in Python (Google, Intel, MongoDB, Red Hat)', 'Scripting and automation'],
  sourceUrl: 'https://docs.python.org/3/tutorial/', sourceLabel: 'The Python tutorial',
  example: 'A 15-line Python script reads a CSV of module results, finds students below 40%, and writes a report, a job that would take three times as much Java.',
  exercise: 'Rewrite three of your Java practice solutions in Python and compare length and readability.',
  quiz: 'What does len({"a": 1, "b": 2}) return?',
  quizChoices: ['2', '4', '1'], answer: 0,
  lessons: [
    L('Syntax, types and control flow',
      'Write Python with indentation-based blocks, dynamic types and f-strings.',
      'Python uses indentation instead of braces. Variables have no declared type, but values do.',
String.raw`def grade(score: int) -> str:
    if score >= 70:
        return "First"
    elif score >= 60:
        return "2:1"
    elif score >= 40:
        return "Pass"
    return "Fail"

for s in [82, 65, 38]:
    print(f"{s} -> {grade(s)}")`,
      'Write FizzBuzz in Python, then compare it with your Java version.',
      'What do the ": int" and "-> str" annotations do at runtime?',
      'Nothing; Python does not enforce them. They document intent and let tools such as mypy and your editor catch type errors.'),
    L('Lists, dicts, sets and comprehensions',
      'Use Python\'s built-in collections and comprehensions for concise data handling.',
      'Group words by first letter with a dict and a comprehension.',
String.raw`words = ["apple", "avocado", "banana", "blueberry", "cherry"]

lengths = [len(w) for w in words]                 # list comprehension
long_words = {w for w in words if len(w) > 6}     # set comprehension

by_letter = {}
for w in words:
    by_letter.setdefault(w[0], []).append(w)
# {'a': ['apple', 'avocado'], 'b': [...], 'c': ['cherry']}`,
      'Solve Two Sum in Python using a dict.',
      'Why is "x in my_set" faster than "x in my_list"?',
      'Sets are hash tables, so membership is O(1) on average. A list must be scanned, which is O(n).'),
    L('Functions, modules and errors',
      'Write reusable functions, import modules, and handle exceptions.',
      'A function parses a score and raises ValueError with a clear message for bad input.',
String.raw`def parse_score(text: str) -> int:
    try:
        value = int(text)
    except ValueError:
        raise ValueError(f"Not a number: {text!r}") from None
    if not 0 <= value <= 100:
        raise ValueError(f"Out of range: {value}")
    return value

if __name__ == "__main__":
    print(parse_score("72"))`,
      'Split your code into two files and import one function from the other.',
      'What does if __name__ == "__main__" do?',
      'It runs the block only when the file is executed directly, not when it is imported as a module.'),
    L('Classes in Python',
      'Write classes with __init__, methods and dataclasses, and compare them with Java classes.',
      'A dataclass generates __init__, __repr__ and __eq__ for simple data holders, like a Java record.',
String.raw`from dataclasses import dataclass, field

@dataclass
class Course:
    name: str
    lessons: list[str] = field(default_factory=list)

    def add_lesson(self, title: str) -> None:
        self.lessons.append(title)

    def lesson_order(self) -> list[str]:
        return list(self.lessons)     # a copy, not the internal list

c = Course("CS101")
c.add_lesson("Variables")`,
      'Translate the Java BankAccount class into Python, keeping the validation rules.',
      'Why use field(default_factory=list) instead of lessons: list = []?',
      'A plain [] default would be shared by every instance. default_factory creates a new list for each object.'),
    L('Testing with pytest',
      'Write and run tests with pytest, including parameterised tests.',
      'pytest discovers functions named test_* and uses plain assert statements.',
String.raw`# test_grades.py
import pytest
from grades import grade, parse_score

@pytest.mark.parametrize("score,expected", [(82, "First"), (65, "2:1"), (40, "Pass"), (39, "Fail")])
def test_grade(score, expected):
    assert grade(score) == expected

def test_parse_rejects_text():
    with pytest.raises(ValueError):
        parse_score("abc")`,
      'Add pytest tests for your Two Sum function, including an empty list.',
      'Why test the boundary values 40 and 39 specifically?',
      'Off-by-one bugs happen at boundaries (>= versus >). Testing both sides of each threshold catches them.'),
    L('Scripting: files, JSON and HTTP',
      'Automate tasks: read and write files, parse JSON and call a REST API.',
      'A script calls an API, saves the JSON, and prints a summary.',
String.raw`import json
from pathlib import Path
import requests   # pip install requests

resp = requests.get("https://api.github.com/repos/python/cpython", timeout=10)
resp.raise_for_status()
data = resp.json()

Path("repo.json").write_text(json.dumps(data, indent=2))
print(data["full_name"], data["stargazers_count"])`,
      'Write a script that reads every .csv file in a folder and prints its row count.',
      'Why pass timeout= to requests.get?',
      'Without it, a request to an unresponsive server can hang forever. A timeout makes the failure visible and lets you retry or report it.'),
  ],
});

M.push({
  id: 'typescript', title: 'TypeScript', cat: 'Web', code: 'TS · LANGUAGES',
  desc: 'Add static types to JavaScript. TypeScript is the default for modern React and Node.js teams.',
  outcome: 'Type a React and API codebase so the compiler catches mistakes before users do.',
  jobSkills: ['JavaScript/TypeScript', 'Modern web frameworks'],
  sourceUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html', sourceLabel: 'TypeScript handbook',
  example: 'Renaming a field from title to name in an API type makes the compiler list every component that still uses title.',
  exercise: 'Convert your React front end to TypeScript. Type the API responses and every component\'s props.',
  quiz: 'When are TypeScript types checked?',
  quizChoices: ['At compile time; they are removed from the JavaScript output', 'At runtime in the browser', 'Only in unit tests'], answer: 0,
  lessons: [
    L('Types and inference',
      'Annotate variables and functions, and let TypeScript infer the rest.',
      'A typo in a property name becomes a compile error instead of undefined at runtime.',
String.raw`let count = 0;                 // inferred as number
const title: string = "Dune";

function average(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

average([70, 80]);   // ok
average("70, 80");  // compile error`,
      'Run npx tsc --init in a project and fix every error in one existing JavaScript file.',
      'Should you annotate every variable?',
      'No. Let inference handle obvious cases; annotate function parameters, return types of public functions, and data from outside (APIs, JSON).'),
    L('Interfaces and type aliases',
      'Describe the shape of objects, including optional and read-only fields.',
      'A Book interface documents exactly what the API returns.',
String.raw`interface Book {
  readonly id: number;
  title: string;
  author: string;
  isbn?: string;          // optional
}

type BookSummary = Pick<Book, "id" | "title">;

function label(b: Book): string {
  return b.isbn ? b.title + " (" + b.isbn + ")" : b.title;
}`,
      'Write interfaces for every response of your REST API.',
      'What is the difference between interface and type?',
      'Both describe shapes. Interfaces can be extended and merged; type aliases can also name unions, tuples and mapped types. Teams usually pick one style for objects.'),
    L('Union types and narrowing',
      'Model values that can be one of several shapes, and narrow them safely.',
      'A request state is loading, success with data, or error with a message; the compiler forces you to handle each.',
String.raw`type RequestState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function render(state: RequestState<Book[]>): string {
  switch (state.status) {
    case "loading": return "Loading…";
    case "success": return state.data.length + " books";
    case "error":   return "Error: " + state.message;
  }
}`,
      'Add an "empty" state and see where the compiler asks you to handle it.',
      'What does narrowing mean?',
      'Checking a value (typeof, a status field, instanceof) so TypeScript knows its more specific type inside that branch.'),
    L('Generics',
      'Write reusable functions and types that keep type information.',
      'A typed fetch helper returns Promise<T>, so callers get the correct type back.',
String.raw`async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json() as Promise<T>;
}

const books = await getJson<Book[]>("/api/books");
books[0].title;   // typed as string`,
      'Write a generic first<T>(items: T[]): T | undefined function.',
      'Does "as Promise<T>" check that the server really sent T?',
      'No. It is a promise to the compiler. Validate untrusted data at runtime (for example with zod) if correctness matters.'),
    L('TypeScript with React',
      'Type component props, state and events.',
      'Props are typed with an interface, and event handlers get the right event type.',
String.raw`interface BookCardProps {
  book: Book;
  onSelect: (id: number) => void;
}

function BookCard({ book, onSelect }: BookCardProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <article>
      <h3>{book.title}</h3>
      <button onClick={() => onSelect(book.id)}>Select</button>
      <button onClick={() => setOpen(o => !o)}>{open ? "Less" : "More"}</button>
      {open && <p>{book.author}</p>}
    </article>
  );
}`,
      'Create a Vite React TypeScript project (npm create vite@latest) and type one form.',
      'Why is a typed onSelect prop useful?',
      'Every parent must pass a function with the right signature, so mismatched IDs or missing handlers fail at compile time.'),
  ],
});

M.push({
  id: 'more-languages', title: 'Choosing your next language', cat: 'Foundations', code: 'LANG · LANGUAGES',
  desc: 'See how C#, C++, Go and Kotlin compare with the Java and Python you already know, and which Irish employers use them.',
  outcome: 'Read basic code in C#, C++, Go and Kotlin, and choose a next language that fits the roles you apply for.',
  jobSkills: ['.NET and C# (gradireland employer survey)', 'C++ (Google, Intel, Qualcomm)', 'Go (MongoDB, Red Hat)'],
  sourceUrl: 'https://learn.microsoft.com/en-us/dotnet/csharp/', sourceLabel: 'Microsoft Learn · C#',
  example: 'The same "sum of evens" function looks almost identical in Java, C# and Kotlin; C++ and Go differ more in memory and error handling.',
  exercise: 'Pick one language from this module that appears in three job posts you like, and solve two practice challenges in it.',
  quiz: 'Which language is closest to Java in syntax and runs on .NET?',
  quizChoices: ['C#', 'Go', 'Python'], answer: 0,
  lessons: [
    L('C# and .NET',
      'Read C#, the main language of the .NET platform used in many Irish enterprise and fintech teams.',
      'C# looks like Java with properties, LINQ and async/await built in.',
String.raw`public record Student(string Name, int Score);

public static class Report
{
    public static IEnumerable<string> Passed(IEnumerable<Student> students) =>
        students.Where(s => s.Score >= 40)
                .OrderByDescending(s => s.Score)
                .Select(s => s.Name);
}`,
      'Install the .NET SDK and run dotnet new console. Port your FizzBuzz.',
      'What is LINQ closest to in Java?',
      'The Stream API: Where is filter, Select is map, OrderBy is sorted.'),
    L('C++',
      'Understand what makes C++ different: manual memory control, value semantics and the STL.',
      'Embedded, networking and performance-critical teams (Intel, Qualcomm, Arista) use C++.',
String.raw`#include <iostream>
#include <unordered_map>
#include <vector>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}`,
      'Solve Two Sum in C++ and compile it with g++ -std=c++17 -Wall.',
      'Why pass the vector as const std::vector<int>&?',
      'A reference avoids copying the whole vector, and const promises the function will not modify it.'),
    L('Go',
      'Read Go, a small language for cloud services and tools, with explicit error values and goroutines.',
      'Go returns errors as values instead of throwing exceptions.',
String.raw`func parseScore(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("not a number: %q", s)
    }
    if n < 0 || n > 100 {
        return 0, fmt.Errorf("out of range: %d", n)
    }
    return n, nil
}`,
      'Follow the Tour of Go (go.dev/tour) for one hour.',
      'How does Go handle errors differently from Java?',
      'Functions return an error value alongside the result, and callers check it explicitly with if err != nil, instead of using try/catch.'),
    L('Kotlin',
      'Read Kotlin, which runs on the JVM, works with any Java library and is the default for Android.',
      'Kotlin removes much of Java\'s boilerplate and makes null safety part of the type system.',
String.raw`data class Student(val name: String, val score: Int)

fun passed(students: List<Student>): List<String> =
    students.filter { it.score >= 40 }
            .sortedByDescending { it.score }
            .map { it.name }

val email: String? = null       // may be null
println(email?.length ?: 0)     // safe call + default`,
      'Convert one Java class from your project to Kotlin using IntelliJ\'s converter, then read the result.',
      'What does String? mean in Kotlin?',
      'A String that may be null. The compiler makes you handle the null case before using it.'),
    L('How to pick and learn a new language',
      'Choose languages from real job posts and learn them through problems you have already solved.',
      'Most Irish internship posts accept any one of Java, Python, C++ or JavaScript. Depth in one plus reading ability in others beats shallow knowledge of six.',
String.raw`A plan for a new language (2 weeks)
1. Syntax tour (official tutorial)          2–3 hours
2. Re-solve 5 practice challenges            1 hour each
3. Port one small project + its tests       a weekend
4. Read one real open-source repo           1 hour
5. Add it to your CV only after step 3`,
      'Collect 10 Irish internship posts and tally the languages they ask for. Pick your next language from the tally.',
      'Why re-solve problems you already know in a new language?',
      'You already understand the algorithm, so all your attention goes to the new syntax, standard library and idioms.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
