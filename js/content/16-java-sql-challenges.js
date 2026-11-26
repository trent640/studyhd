/* Java versions of challenges (compiled and run on the Study Desk server), Java-only challenges that check
   project code, SQL challenges (run in the browser with SQLite), and the automated checks for projects.

   Java tests: each test is the body of a method returning Object; the result is printed with show() and compared
   as text with `expected` (arrays and lists print like [1, 2, 3]). */
(function (C, P) {
  const byId = (id) => C.find((c) => c.id === id);
  const java = (id, data) => { const c = byId(id); if (c) Object.assign(c, data); };
  const sol = (body) => 'import java.util.*;\n\nclass Solution {\n' + body + '\n}\n';

  java('fizzbuzz', {
    javaStarter: sol('    static List<String> fizzBuzz(int n) {\n        // your code here\n        return new ArrayList<>();\n    }'),
    javaSolution: sol('    static List<String> fizzBuzz(int n) {\n        List<String> out = new ArrayList<>();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) out.add("FizzBuzz");\n            else if (i % 3 == 0) out.add("Fizz");\n            else if (i % 5 == 0) out.add("Buzz");\n            else out.add(String.valueOf(i));\n        }\n        return out;\n    }'),
    javaTests: [
      { name: 'fizzBuzz(1)', code: 'return Solution.fizzBuzz(1);', expected: '[1]' },
      { name: 'fizzBuzz(5)', code: 'return Solution.fizzBuzz(5);', expected: '[1, 2, Fizz, 4, Buzz]' },
      { name: 'fizzBuzz(15) ends with FizzBuzz', code: 'List<String> r = Solution.fizzBuzz(15); return r.get(14);', expected: 'FizzBuzz' },
      { name: 'fizzBuzz(0) is empty', code: 'return Solution.fizzBuzz(0);', expected: '[]' },
    ],
  });
  java('palindrome', {
    javaStarter: sol('    static boolean isPalindrome(String s) {\n        // your code here\n        return false;\n    }'),
    javaSolution: sol('    static boolean isPalindrome(String s) {\n        int i = 0, j = s.length() - 1;\n        while (i < j) {\n            if (!Character.isLetterOrDigit(s.charAt(i))) { i++; continue; }\n            if (!Character.isLetterOrDigit(s.charAt(j))) { j--; continue; }\n            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;\n            i++; j--;\n        }\n        return true;\n    }'),
    javaTests: [
      { name: '"A man, a plan, a canal: Panama"', code: 'return Solution.isPalindrome("A man, a plan, a canal: Panama");', expected: 'true' },
      { name: '"race a car"', code: 'return Solution.isPalindrome("race a car");', expected: 'false' },
      { name: 'empty string', code: 'return Solution.isPalindrome("");', expected: 'true' },
      { name: '"0P"', code: 'return Solution.isPalindrome("0P");', expected: 'false' },
    ],
  });
  java('two-sum', {
    javaStarter: sol('    static int[] twoSum(int[] nums, int target) {\n        // your code here\n        return new int[0];\n    }'),
    javaSolution: sol('    static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            Integer j = seen.get(target - nums[i]);\n            if (j != null) return new int[] { j, i };\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }'),
    javaTests: [
      { name: 'twoSum([2,7,11,15], 9)', code: 'return Solution.twoSum(new int[] {2, 7, 11, 15}, 9);', expected: '[0, 1]' },
      { name: 'twoSum([3,2,4], 6)', code: 'return Solution.twoSum(new int[] {3, 2, 4}, 6);', expected: '[1, 2]' },
      { name: 'twoSum([3,3], 6)', code: 'return Solution.twoSum(new int[] {3, 3}, 6);', expected: '[0, 1]' },
      { name: 'negative numbers', code: 'return Solution.twoSum(new int[] {-1, -2, -3, -4, -5}, -8);', expected: '[2, 4]' },
    ],
  });
  java('valid-parentheses', {
    javaStarter: sol('    static boolean isValid(String s) {\n        // your code here\n        return false;\n    }'),
    javaSolution: sol('    static boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') stack.push(\')\');\n            else if (c == \'[\') stack.push(\']\');\n            else if (c == \'{\') stack.push(\'}\');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }'),
    javaTests: [
      { name: '"()[]{}"', code: 'return Solution.isValid("()[]{}");', expected: 'true' },
      { name: '"(]"', code: 'return Solution.isValid("(]");', expected: 'false' },
      { name: '"([)]"', code: 'return Solution.isValid("([)]");', expected: 'false' },
      { name: '"{[]}"', code: 'return Solution.isValid("{[]}");', expected: 'true' },
      { name: '"(("', code: 'return Solution.isValid("((");', expected: 'false' },
    ],
  });
  java('anagram', {
    javaStarter: sol('    static boolean isAnagram(String s, String t) {\n        // your code here\n        return false;\n    }'),
    javaSolution: sol('    static boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - \'a\']++;\n        for (char c : t.toCharArray()) if (--count[c - \'a\'] < 0) return false;\n        return true;\n    }'),
    javaTests: [
      { name: 'listen / silent', code: 'return Solution.isAnagram("listen", "silent");', expected: 'true' },
      { name: 'rat / car', code: 'return Solution.isAnagram("rat", "car");', expected: 'false' },
      { name: 'different lengths', code: 'return Solution.isAnagram("a", "ab");', expected: 'false' },
      { name: 'aacc / ccac', code: 'return Solution.isAnagram("aacc", "ccac");', expected: 'false' },
    ],
  });
  java('binary-search', {
    javaStarter: sol('    static int search(int[] nums, int target) {\n        // your code here\n        return -2;\n    }'),
    javaSolution: sol('    static int search(int[] nums, int target) {\n        int lo = 0, hi = nums.length - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n        }\n        return -1;\n    }'),
    javaTests: [
      { name: 'found', code: 'return Solution.search(new int[] {-1, 0, 3, 5, 9, 12}, 9);', expected: '4' },
      { name: 'not found', code: 'return Solution.search(new int[] {-1, 0, 3, 5, 9, 12}, 2);', expected: '-1' },
      { name: 'empty array', code: 'return Solution.search(new int[] {}, 1);', expected: '-1' },
      { name: 'last element', code: 'return Solution.search(new int[] {1, 3}, 3);', expected: '1' },
    ],
  });
  java('max-subarray', {
    javaStarter: sol('    static int maxSubArray(int[] nums) {\n        // your code here\n        return 0;\n    }'),
    javaSolution: sol('    static int maxSubArray(int[] nums) {\n        int best = nums[0], cur = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            cur = Math.max(nums[i], cur + nums[i]);\n            best = Math.max(best, cur);\n        }\n        return best;\n    }'),
    javaTests: [
      { name: '[-2,1,-3,4,-1,2,1,-5,4]', code: 'return Solution.maxSubArray(new int[] {-2, 1, -3, 4, -1, 2, 1, -5, 4});', expected: '6' },
      { name: '[1]', code: 'return Solution.maxSubArray(new int[] {1});', expected: '1' },
      { name: 'all negative', code: 'return Solution.maxSubArray(new int[] {-3, -1, -2});', expected: '-1' },
    ],
  });
  java('climb-stairs', {
    javaStarter: sol('    static long climbStairs(int n) {\n        // your code here\n        return 0;\n    }'),
    javaSolution: sol('    static long climbStairs(int n) {\n        long a = 1, b = 1;\n        for (int i = 2; i <= n; i++) { long c = a + b; a = b; b = c; }\n        return b;\n    }'),
    javaTests: [
      { name: 'n = 2', code: 'return Solution.climbStairs(2);', expected: '2' },
      { name: 'n = 5', code: 'return Solution.climbStairs(5);', expected: '8' },
      { name: 'n = 45 (must be fast)', code: 'return Solution.climbStairs(45);', expected: '1836311903' },
    ],
  });
  java('merge-intervals', {
    javaStarter: sol('    static int[][] merge(int[][] intervals) {\n        // your code here\n        return intervals;\n    }'),
    javaSolution: sol('    static int[][] merge(int[][] intervals) {\n        int[][] sorted = intervals.clone();\n        Arrays.sort(sorted, Comparator.comparingInt(iv -> iv[0]));\n        List<int[]> out = new ArrayList<>();\n        for (int[] iv : sorted) {\n            if (!out.isEmpty() && iv[0] <= out.get(out.size() - 1)[1]) {\n                int[] last = out.get(out.size() - 1);\n                last[1] = Math.max(last[1], iv[1]);\n            } else out.add(new int[] { iv[0], iv[1] });\n        }\n        return out.toArray(new int[0][]);\n    }'),
    javaTests: [
      { name: 'overlapping', code: 'return Solution.merge(new int[][] {{1, 3}, {2, 6}, {8, 10}, {15, 18}});', expected: '[[1, 6], [8, 10], [15, 18]]' },
      { name: 'touching', code: 'return Solution.merge(new int[][] {{1, 4}, {4, 5}});', expected: '[[1, 5]]' },
      { name: 'unsorted input', code: 'return Solution.merge(new int[][] {{4, 7}, {1, 4}});', expected: '[[1, 7]]' },
      { name: 'contained', code: 'return Solution.merge(new int[][] {{1, 10}, {2, 3}});', expected: '[[1, 10]]' },
    ],
  });
  java('longest-substring', {
    javaStarter: sol('    static int lengthOfLongestSubstring(String s) {\n        // your code here\n        return 0;\n    }'),
    javaSolution: sol('    static int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> last = new HashMap<>();\n        int best = 0, start = 0;\n        for (int end = 0; end < s.length(); end++) {\n            char c = s.charAt(end);\n            if (last.containsKey(c) && last.get(c) >= start) start = last.get(c) + 1;\n            last.put(c, end);\n            best = Math.max(best, end - start + 1);\n        }\n        return best;\n    }'),
    javaTests: [
      { name: '"abcabcbb"', code: 'return Solution.lengthOfLongestSubstring("abcabcbb");', expected: '3' },
      { name: '"bbbbb"', code: 'return Solution.lengthOfLongestSubstring("bbbbb");', expected: '1' },
      { name: '"abba"', code: 'return Solution.lengthOfLongestSubstring("abba");', expected: '2' },
      { name: 'empty', code: 'return Solution.lengthOfLongestSubstring("");', expected: '0' },
    ],
  });
  java('escape-html', {
    javaStarter: sol('    static String escapeHtml(String input) {\n        // your code here\n        return input;\n    }'),
    javaSolution: sol('    static String escapeHtml(String input) {\n        StringBuilder sb = new StringBuilder();\n        for (char c : input.toCharArray()) {\n            switch (c) {\n                case \'&\' -> sb.append("&amp;");\n                case \'<\' -> sb.append("&lt;");\n                case \'>\' -> sb.append("&gt;");\n                case \'"\' -> sb.append("&quot;");\n                case \'\\\'\' -> sb.append("&#39;");\n                default -> sb.append(c);\n            }\n        }\n        return sb.toString();\n    }'),
    javaTests: [
      { name: 'tags', code: 'return Solution.escapeHtml("<b>hi</b>");', expected: '&lt;b&gt;hi&lt;/b&gt;' },
      { name: 'ampersand first', code: 'return Solution.escapeHtml("a<b&c");', expected: 'a&lt;b&amp;c' },
      { name: 'quotes', code: 'return Solution.escapeHtml("\\"it\'s\\"");', expected: '&quot;it&#39;s&quot;' },
      { name: 'plain text unchanged', code: 'return Solution.escapeHtml("safe text");', expected: 'safe text' },
    ],
  });
  java('strong-password', {
    javaStarter: sol('    static boolean isStrong(String p) {\n        // your code here\n        return false;\n    }'),
    javaSolution: sol('    static boolean isStrong(String p) {\n        return p.length() >= 12\n            && p.chars().anyMatch(Character::isLowerCase)\n            && p.chars().anyMatch(Character::isUpperCase)\n            && p.chars().anyMatch(Character::isDigit)\n            && p.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch));\n    }'),
    javaTests: [
      { name: 'strong', code: 'return Solution.isStrong("Str0ng!Passw0rd");', expected: 'true' },
      { name: 'too short', code: 'return Solution.isStrong("Short1!");', expected: 'false' },
      { name: 'no digit', code: 'return Solution.isStrong("NoDigitsHere!!");', expected: 'false' },
      { name: 'no symbol', code: 'return Solution.isStrong("NoSymbol1234ABCd");', expected: 'false' },
    ],
  });
  java('cosine-similarity', {
    javaStarter: sol('    static double cosineSimilarity(double[] a, double[] b) {\n        // your code here\n        return 0;\n    }'),
    javaSolution: sol('    static double cosineSimilarity(double[] a, double[] b) {\n        double dot = 0, na = 0, nb = 0;\n        for (int i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }\n        if (na == 0 || nb == 0) return 0;\n        return Math.round(dot / (Math.sqrt(na) * Math.sqrt(nb)) * 10000) / 10000.0;\n    }'),
    javaTests: [
      { name: 'same direction', code: 'return Solution.cosineSimilarity(new double[] {1, 2, 3}, new double[] {2, 4, 6});', expected: '1.0' },
      { name: 'perpendicular', code: 'return Solution.cosineSimilarity(new double[] {1, 0}, new double[] {0, 1});', expected: '0.0' },
      { name: '[1,2] and [2,1]', code: 'return Solution.cosineSimilarity(new double[] {1, 2}, new double[] {2, 1});', expected: '0.8' },
      { name: 'zero vector', code: 'return Solution.cosineSimilarity(new double[] {0, 0}, new double[] {1, 1});', expected: '0.0' },
    ],
  });

  /* ---------- Java-only challenges that check project code ---------- */
  C.push(
    {
      id: 'bank-account', kind: 'java', title: 'Encapsulation: a BankAccount class', level: 'Easy', minutes: 20, pattern: 'Classes (Java)', module: 'oop', fn: 'BankAccount',
      prompt: 'Write a class BankAccount with a constructor taking the owner\'s name, deposit(long cents), withdraw(long cents) and getBalanceCents(). Keep the balance private. deposit must throw IllegalArgumentException for amounts of 0 or less; withdraw must throw IllegalStateException if there is not enough money.',
      examples: ['BankAccount a = new BankAccount("Sosa"); a.deposit(500); a.getBalanceCents() → 500'],
      hint: 'Check the rule first, then change the field. Throwing an exception stops the method before the balance changes.',
      complexity: 'Each method is O(1). The point is that the rules live inside the class.',
      javaStarter: 'class BankAccount {\n    // fields here\n\n    BankAccount(String owner) {\n    }\n\n    void deposit(long cents) {\n    }\n\n    void withdraw(long cents) {\n    }\n\n    long getBalanceCents() {\n        return -1;\n    }\n}\n',
      javaSolution: 'class BankAccount {\n    private final String owner;\n    private long balanceCents;\n\n    BankAccount(String owner) { this.owner = owner; }\n\n    void deposit(long cents) {\n        if (cents <= 0) throw new IllegalArgumentException("Deposit must be positive");\n        balanceCents += cents;\n    }\n\n    void withdraw(long cents) {\n        if (cents > balanceCents) throw new IllegalStateException("Insufficient funds");\n        balanceCents -= cents;\n    }\n\n    long getBalanceCents() { return balanceCents; }\n}\n',
      javaTests: [
        { name: 'a new account has 0', code: 'return new BankAccount("Sosa").getBalanceCents();', expected: '0' },
        { name: 'deposit adds money', code: 'BankAccount a = new BankAccount("Sosa"); a.deposit(500); a.deposit(250); return a.getBalanceCents();', expected: '750' },
        { name: 'withdraw takes money', code: 'BankAccount a = new BankAccount("Sosa"); a.deposit(500); a.withdraw(200); return a.getBalanceCents();', expected: '300' },
        { name: 'deposit of 0 throws IllegalArgumentException', code: 'try { new BankAccount("x").deposit(0); return "no exception"; } catch (IllegalArgumentException e) { return "IllegalArgumentException"; }', expected: 'IllegalArgumentException' },
        { name: 'overdraft throws IllegalStateException and keeps the balance', code: 'BankAccount a = new BankAccount("x"); a.deposit(100); try { a.withdraw(101); return "no exception"; } catch (IllegalStateException e) { return "kept " + a.getBalanceCents(); }', expected: 'kept 100' },
        { name: 'the balance field is private', code: 'return Arrays.stream(BankAccount.class.getDeclaredFields()).allMatch(f -> java.lang.reflect.Modifier.isPrivate(f.getModifiers()));', expected: 'true' },
      ],
    },
    {
      id: 'gradebook-core', kind: 'java', title: 'Gradebook: parse scores and grade bands', level: 'Easy', minutes: 25, pattern: 'Validation (Java)', module: 'java-fundamentals', fn: 'Gradebook',
      prompt: 'The core of the Gradebook CLI project. In class Gradebook write: parseScore(String text) returning the int score, throwing IllegalArgumentException if it is not a whole number from 0 to 100 (spaces around it are fine); band(int score) returning "First" (70+), "2:1" (60–69), "Pass" (40–59) or "Fail"; and average(List<Integer> scores) returning the average rounded to 1 decimal place, or 0.0 for an empty list.',
      examples: ['Gradebook.parseScore(" 72 ") → 72', 'Gradebook.band(65) → "2:1"', 'Gradebook.average(List.of(70, 81)) → 75.5'],
      hint: 'Use Integer.parseInt on the trimmed text inside a try/catch for NumberFormatException, then check the range.',
      complexity: 'parseScore and band are O(1); average is O(n).',
      javaStarter: 'import java.util.*;\n\nclass Gradebook {\n    static int parseScore(String text) {\n        return 0;\n    }\n\n    static String band(int score) {\n        return "";\n    }\n\n    static double average(List<Integer> scores) {\n        return 0;\n    }\n}\n',
      javaSolution: 'import java.util.*;\n\nclass Gradebook {\n    static int parseScore(String text) {\n        int value;\n        try {\n            value = Integer.parseInt(text.trim());\n        } catch (NumberFormatException e) {\n            throw new IllegalArgumentException("Not a number: " + text);\n        }\n        if (value < 0 || value > 100) throw new IllegalArgumentException("Out of range: " + value);\n        return value;\n    }\n\n    static String band(int score) {\n        if (score >= 70) return "First";\n        if (score >= 60) return "2:1";\n        if (score >= 40) return "Pass";\n        return "Fail";\n    }\n\n    static double average(List<Integer> scores) {\n        if (scores.isEmpty()) return 0.0;\n        double sum = 0;\n        for (int s : scores) sum += s;\n        return Math.round(sum / scores.size() * 10) / 10.0;\n    }\n}\n',
      javaTests: [
        { name: 'parses a padded number', code: 'return Gradebook.parseScore(" 72 ");', expected: '72' },
        { name: 'rejects text', code: 'try { Gradebook.parseScore("abc"); return "accepted"; } catch (IllegalArgumentException e) { return "rejected"; }', expected: 'rejected' },
        { name: 'rejects 101', code: 'try { Gradebook.parseScore("101"); return "accepted"; } catch (IllegalArgumentException e) { return "rejected"; }', expected: 'rejected' },
        { name: 'bands at the boundaries', code: 'return List.of(Gradebook.band(70), Gradebook.band(69), Gradebook.band(40), Gradebook.band(39));', expected: '[First, 2:1, Pass, Fail]' },
        { name: 'average rounds to 1 decimal', code: 'return Gradebook.average(List.of(70, 81, 66));', expected: '72.3' },
        { name: 'average of an empty list', code: 'return Gradebook.average(List.of());', expected: '0.0' },
      ],
    },
    {
      id: 'min-heap', kind: 'java', title: 'Data structures library: a min-heap', level: 'Medium', minutes: 35, pattern: 'Heap (Java)', module: 'data-structures', fn: 'MinHeap',
      prompt: 'Part of the Data Structures Library project. Implement class MinHeap for ints using an array or ArrayList (not java.util.PriorityQueue): offer(int), poll() (removes and returns the smallest; throws NoSuchElementException when empty), peek() (returns the smallest without removing; throws when empty) and size().',
      examples: ['offer 5, 1, 3 → poll() = 1, poll() = 3, poll() = 5'],
      hint: 'Store the heap in an ArrayList. offer: add at the end and swap upwards while smaller than the parent ((i - 1) / 2). poll: move the last item to index 0 and swap downwards with the smaller child.',
      complexity: 'offer and poll are O(log n); peek and size are O(1).',
      javaStarter: 'import java.util.*;\n\nclass MinHeap {\n    private final List<Integer> data = new ArrayList<>();\n\n    void offer(int value) {\n    }\n\n    int poll() {\n        return 0;\n    }\n\n    int peek() {\n        return 0;\n    }\n\n    int size() {\n        return 0;\n    }\n}\n',
      javaSolution: 'import java.util.*;\n\nclass MinHeap {\n    private final List<Integer> data = new ArrayList<>();\n\n    void offer(int value) {\n        data.add(value);\n        int i = data.size() - 1;\n        while (i > 0) {\n            int parent = (i - 1) / 2;\n            if (data.get(parent) <= data.get(i)) break;\n            Collections.swap(data, parent, i);\n            i = parent;\n        }\n    }\n\n    int poll() {\n        int top = peek();\n        int last = data.remove(data.size() - 1);\n        if (!data.isEmpty()) {\n            data.set(0, last);\n            int i = 0;\n            while (true) {\n                int l = 2 * i + 1, r = l + 1, smallest = i;\n                if (l < data.size() && data.get(l) < data.get(smallest)) smallest = l;\n                if (r < data.size() && data.get(r) < data.get(smallest)) smallest = r;\n                if (smallest == i) break;\n                Collections.swap(data, i, smallest);\n                i = smallest;\n            }\n        }\n        return top;\n    }\n\n    int peek() {\n        if (data.isEmpty()) throw new NoSuchElementException("Heap is empty");\n        return data.get(0);\n    }\n\n    int size() { return data.size(); }\n}\n',
      javaTests: [
        { name: 'polls in sorted order', code: 'MinHeap h = new MinHeap(); for (int x : new int[] {5, 1, 8, 3, 9, 2}) h.offer(x); List<Integer> out = new ArrayList<>(); while (h.size() > 0) out.add(h.poll()); return out;', expected: '[1, 2, 3, 5, 8, 9]' },
        { name: 'peek does not remove', code: 'MinHeap h = new MinHeap(); h.offer(4); h.offer(2); return h.peek() + " " + h.size();', expected: '2 2' },
        { name: 'handles duplicates', code: 'MinHeap h = new MinHeap(); h.offer(3); h.offer(3); h.offer(1); return h.poll() + "," + h.poll() + "," + h.poll();', expected: '1,3,3' },
        { name: 'poll on empty throws NoSuchElementException', code: 'try { new MinHeap().poll(); return "no exception"; } catch (NoSuchElementException e) { return "NoSuchElementException"; }', expected: 'NoSuchElementException' },
        { name: 'does not use PriorityQueue', code: 'return Arrays.stream(MinHeap.class.getDeclaredFields()).noneMatch(f -> f.getType() == PriorityQueue.class);', expected: 'true' },
        { name: 'is fast for 100,000 items', code: 'MinHeap h = new MinHeap(); for (int i = 100000; i > 0; i--) h.offer(i); return h.poll();', expected: '1' },
      ],
    },
    {
      id: 'task-validation', kind: 'java', title: 'Task API: validation and ownership', level: 'Easy', minutes: 25, pattern: 'Validation and access control (Java)', module: 'backend-spring', fn: 'TaskRules',
      prompt: 'The rules behind the Task Tracker API, written without Spring so they can be tested directly. In class TaskRules write validate(String title, String status) returning a Map of field → error message (empty when valid): title is required and at most 100 characters (after trimming); status must be "TODO", "DOING" or "DONE". Then canEdit(String owner, String user, boolean isAdmin) returning true only for the owner or an admin.',
      examples: ['TaskRules.validate("", "TODO") → {title=Title is required}', 'TaskRules.canEdit("ana", "ben", false) → false'],
      hint: 'Use a LinkedHashMap so errors keep their order. Null titles count as missing.',
      complexity: 'O(1) per check. In Spring this logic would sit in a service and be called by the controller.',
      javaStarter: 'import java.util.*;\n\nclass TaskRules {\n    static Map<String, String> validate(String title, String status) {\n        return new LinkedHashMap<>();\n    }\n\n    static boolean canEdit(String owner, String user, boolean isAdmin) {\n        return true;\n    }\n}\n',
      javaSolution: 'import java.util.*;\n\nclass TaskRules {\n    private static final Set<String> STATUSES = Set.of("TODO", "DOING", "DONE");\n\n    static Map<String, String> validate(String title, String status) {\n        Map<String, String> errors = new LinkedHashMap<>();\n        String t = title == null ? "" : title.trim();\n        if (t.isEmpty()) errors.put("title", "Title is required");\n        else if (t.length() > 100) errors.put("title", "Title must be at most 100 characters");\n        if (status == null || !STATUSES.contains(status)) errors.put("status", "Status must be TODO, DOING or DONE");\n        return errors;\n    }\n\n    static boolean canEdit(String owner, String user, boolean isAdmin) {\n        return isAdmin || (owner != null && owner.equals(user));\n    }\n}\n',
      javaTests: [
        { name: 'a valid task has no errors', code: 'return TaskRules.validate("Write tests", "TODO");', expected: '{}' },
        { name: 'blank title', code: 'return TaskRules.validate("   ", "DONE").get("title");', expected: 'Title is required' },
        { name: 'null title', code: 'return TaskRules.validate(null, "DONE").containsKey("title");', expected: 'true' },
        { name: 'title too long', code: 'return TaskRules.validate("x".repeat(101), "DONE").containsKey("title");', expected: 'true' },
        { name: 'bad status', code: 'return TaskRules.validate("ok", "LATER").keySet();', expected: '[status]' },
        { name: 'only the owner or an admin can edit', code: 'return List.of(TaskRules.canEdit("ana", "ana", false), TaskRules.canEdit("ana", "ben", false), TaskRules.canEdit("ana", "ben", true));', expected: '[true, false, true]' },
      ],
    }
  );

  /* ---------- SQL challenges (SQLite in the browser; the SQL is standard and works in MySQL too) ---------- */
  const LIBRARY = [
    'CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL);',
    'CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL);',
    'CREATE TABLE loans (id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL, member_id INTEGER NOT NULL, due_day INTEGER NOT NULL, returned INTEGER NOT NULL DEFAULT 0);',
    "INSERT INTO members VALUES (1,'Aoife','aoife@example.ie'),(2,'Ben','ben@example.ie'),(3,'Ciara','ciara@example.ie'),(4,'Dev','dev@example.ie');",
    "INSERT INTO books VALUES (1,'Dune'),(2,'Emma'),(3,'Ulysses'),(4,'Dracula');",
    'INSERT INTO loans VALUES (1,1,1,10,1),(2,2,1,12,0),(3,3,2,5,0),(4,4,1,20,0),(5,1,2,25,0),(6,2,3,8,1);',
  ].join('\n');
  const COURSE = [
    'CREATE TABLE modules (id INTEGER PRIMARY KEY, title TEXT NOT NULL);',
    'CREATE TABLE lessons (id INTEGER PRIMARY KEY, module_id INTEGER NOT NULL, title TEXT NOT NULL);',
    "CREATE TABLE progress (learner_id INTEGER NOT NULL, lesson_id INTEGER NOT NULL, status TEXT NOT NULL, PRIMARY KEY (learner_id, lesson_id));",
    "INSERT INTO modules VALUES (1,'OOP'),(2,'SQL'),(3,'Testing');",
    "INSERT INTO lessons VALUES (1,1,'Classes'),(2,1,'Interfaces'),(3,2,'SELECT'),(4,2,'JOIN'),(5,2,'GROUP BY'),(6,3,'JUnit');",
    "INSERT INTO progress VALUES (1,1,'done'),(1,2,'done'),(1,3,'learning'),(2,1,'done'),(2,3,'done'),(2,4,'done');",
  ].join('\n');
  C.push(
    {
      id: 'sql-overdue', kind: 'sql', title: 'SQL: overdue loans', level: 'Warm-up', minutes: 10, pattern: 'SELECT, WHERE, ORDER BY', module: 'databases', fn: 'SQL query',
      prompt: 'Today is day 15. List the id and due_day of every loan that is not returned (returned = 0) and whose due_day is before 15, ordered by due_day (earliest first).',
      examples: ['Result columns: id | due_day'],
      schema: LIBRARY, ordered: true,
      expected: { columns: ['id', 'due_day'], rows: [[3, 5], [2, 12]] },
      starter: '-- Tables: members(id, name, email), books(id, title),\n--         loans(id, book_id, member_id, due_day, returned)\nSELECT *\nFROM loans;\n',
      solution: 'SELECT id, due_day\nFROM loans\nWHERE returned = 0 AND due_day < 15\nORDER BY due_day;',
      hint: 'Combine both conditions with AND, and sort with ORDER BY due_day.',
      complexity: 'An index on (returned, due_day) helps when the table is large.',
    },
    {
      id: 'sql-never-borrowed', kind: 'sql', title: 'SQL: members who never borrowed', level: 'Easy', minutes: 15, pattern: 'LEFT JOIN … IS NULL', module: 'mysql', fn: 'SQL query',
      prompt: 'Return the name of every member who has no loans at all.',
      examples: ['Result column: name'],
      schema: LIBRARY, ordered: false,
      expected: { columns: ['name'], rows: [['Dev']] },
      starter: 'SELECT m.name\nFROM members m;\n',
      solution: 'SELECT m.name\nFROM members m\nLEFT JOIN loans l ON l.member_id = m.id\nWHERE l.id IS NULL;',
      hint: 'A LEFT JOIN keeps members with no matching loan; their loan columns are NULL.',
      complexity: 'Index loans.member_id so the join is fast.',
    },
    {
      id: 'sql-busy-members', kind: 'sql', title: 'SQL: members with more than one loan', level: 'Easy', minutes: 15, pattern: 'GROUP BY, HAVING, JOIN', module: 'databases', fn: 'SQL query',
      prompt: 'Return each member\'s name and their number of loans (as loan_count), but only for members with more than one loan, highest count first.',
      examples: ['Result columns: name | loan_count'],
      schema: LIBRARY, ordered: true,
      expected: { columns: ['name', 'loan_count'], rows: [['Aoife', 3], ['Ben', 2]] },
      starter: 'SELECT m.name, COUNT(*) AS loan_count\nFROM members m\nJOIN loans l ON l.member_id = m.id;\n',
      solution: 'SELECT m.name, COUNT(*) AS loan_count\nFROM members m\nJOIN loans l ON l.member_id = m.id\nGROUP BY m.id, m.name\nHAVING COUNT(*) > 1\nORDER BY loan_count DESC;',
      hint: 'GROUP BY the member, then filter the groups with HAVING COUNT(*) > 1.',
      complexity: 'HAVING filters after grouping; WHERE filters rows before.',
    },
    {
      id: 'sql-module-completion', kind: 'sql', title: 'SQL: lessons completed per module', level: 'Medium', minutes: 25, pattern: 'LEFT JOIN + conditional COUNT', module: 'mysql', fn: 'SQL query',
      prompt: 'For every module (including ones nobody has started), return the module title and done_count: the number of progress rows with status \'done\' for that module\'s lessons. Order by title.',
      examples: ['Result columns: title | done_count'],
      schema: COURSE, ordered: true,
      expected: { columns: ['title', 'done_count'], rows: [['OOP', 3], ['SQL', 2], ['Testing', 0]] },
      starter: 'SELECT m.title, COUNT(*) AS done_count\nFROM modules m\nJOIN lessons l ON l.module_id = m.id\nJOIN progress p ON p.lesson_id = l.id\nGROUP BY m.id, m.title;\n',
      solution: "SELECT m.title, COUNT(p.lesson_id) AS done_count\nFROM modules m\nLEFT JOIN lessons l ON l.module_id = m.id\nLEFT JOIN progress p ON p.lesson_id = l.id AND p.status = 'done'\nGROUP BY m.id, m.title\nORDER BY m.title;",
      hint: "Use LEFT JOINs so modules with no progress still appear, put the status = 'done' condition in the ON clause, and COUNT a progress column (COUNT(*) would count the NULL row).",
      complexity: 'COUNT(column) ignores NULLs, which is what makes this work.',
    }
  );

  /* ---------- Automated checks for projects ---------- */
  const checks = {
    'gradebook-cli': ['gradebook-core', 'bank-account'],
    'dsa-library': ['min-heap', 'valid-parentheses', 'two-sum'],
    'task-api': ['task-validation', 'escape-html', 'strong-password'],
    'task-ui': ['accessible-form', 'progress-reducer', 'flex-cards'],
    'mysql-schema': ['sql-never-borrowed', 'sql-busy-members', 'sql-module-completion'],
    'data-report': ['sql-overdue', 'sql-busy-members'],
    'study-assistant': ['cosine-similarity', 'chunk-text'],
  };
  for (const [pid, ids] of Object.entries(checks)) { const p = P.find((x) => x.id === pid); if (p) p.checks = ids; }
})(window.SD_CHALLENGES, window.SD_PROJECTS);
