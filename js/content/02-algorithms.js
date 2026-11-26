/* Algorithms, coding assessment practice, Git. */
(function (M, L) {

M.push({
  id: 'algorithms', title: 'Algorithms', cat: 'Foundations', code: '04 · FOUNDATIONS',
  desc: 'Search, sort, recurse and traverse. Learn the patterns behind most internship coding questions.',
  outcome: 'Recognise which technique fits a problem, implement it, and explain its time and space complexity.',
  jobSkills: ['Data structures and algorithms through coursework, projects or competitions', 'Problem solving'],
  sourceUrl: 'https://algs4.cs.princeton.edu/home/', sourceLabel: 'Algorithms, 4th ed. · Princeton',
  example: 'Finding a name in a sorted list of 1,000,000 students takes at most 20 comparisons with binary search, against up to 1,000,000 with a linear scan.',
  exercise: 'Implement binary search, merge sort and BFS from memory in Java. Write three JUnit tests for each, including an empty input.',
  quiz: 'What is the time complexity of binary search on a sorted array?',
  quizChoices: ['O(log n)', 'O(n)', 'O(n log n)'], answer: 0,
  lessons: [
    L('Binary search',
      'Halve a sorted search space each step, and avoid the classic off-by-one and overflow bugs.',
      'Search for 23 in [2, 5, 8, 12, 16, 23, 38]: check 12, go right; check 23, found. Two comparisons.',
String.raw`static int binarySearch(int[] a, int target) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   // avoids int overflow of (lo + hi)
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
      'Change it to return the first index where a[i] >= target (lower bound). Test it with duplicates.',
      'Does binary search work on an unsorted array?',
      'No. It relies on order to discard half the range. On unsorted data you must scan (O(n)) or sort first (O(n log n)).'),
    L('Sorting: merge sort and quicksort',
      'Implement a divide-and-conquer sort and compare stability, worst case and memory.',
      'Merge sort splits the array, sorts each half and merges them: always O(n log n), stable, O(n) extra memory.',
String.raw`static int[] mergeSort(int[] a) {
    if (a.length <= 1) return a;
    int mid = a.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(a, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(a, mid, a.length));
    int[] out = new int[a.length];
    int i = 0, j = 0, k = 0;
    while (i < left.length && j < right.length)
        out[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    while (i < left.length) out[k++] = left[i++];
    while (j < right.length) out[k++] = right[j++];
    return out;
}`,
      'Sort a list of Student records by score, then by name, using Comparator.comparing(...).thenComparing(...).',
      'What is quicksort\'s worst case, and how do libraries avoid it?',
      'O(n²), when pivots are always the smallest or largest element (for example, sorted input with a first-element pivot). Random or median-of-three pivots make it unlikely; Java sorts primitives with dual-pivot quicksort and objects with TimSort.'),
    L('Two pointers and sliding window',
      'Solve array and string problems in one pass by moving two indices.',
      'Longest substring without repeating characters: grow the window on the right, shrink from the left when a character repeats.',
String.raw`static int longestUnique(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int best = 0, start = 0;
    for (int end = 0; end < s.length(); end++) {
        char c = s.charAt(end);
        if (last.containsKey(c) && last.get(c) >= start) {
            start = last.get(c) + 1;
        }
        last.put(c, end);
        best = Math.max(best, end - start + 1);
    }
    return best;
}`,
      'Given a sorted array, return true if any two numbers sum to a target using two pointers and O(1) extra space.',
      'When is the sliding window technique a good fit?',
      'When the question asks for the best contiguous subarray or substring under a condition, and you can update the answer incrementally as the window moves.'),
    L('Recursion and backtracking',
      'Write recursive solutions with a clear base case, and explore choices with backtracking.',
      'Generate all subsets of [1, 2, 3]: at each element, either include it or skip it.',
String.raw`static void subsets(int[] nums, int i, List<Integer> current, List<List<Integer>> out) {
    if (i == nums.length) {
        out.add(new ArrayList<>(current));
        return;
    }
    current.add(nums[i]);
    subsets(nums, i + 1, current, out);   // include nums[i]
    current.remove(current.size() - 1);
    subsets(nums, i + 1, current, out);   // skip nums[i]
}`,
      'Generate all permutations of a string. How many are there for n characters?',
      'What causes a StackOverflowError in recursive code?',
      'A missing or unreachable base case, or recursion that is simply too deep (for example, 100,000 levels). Convert deep recursion to a loop with an explicit stack.'),
    L('Breadth-first and depth-first search',
      'Traverse graphs and grids with BFS (queue) and DFS (stack or recursion), and use BFS for shortest paths in unweighted graphs.',
      'Number of islands: scan the grid; each time you find land, flood-fill it with BFS and count one island.',
String.raw`static int numIslands(char[][] grid) {
    int count = 0, rows = grid.length, cols = grid[0].length;
    int[][] dirs = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != '1') continue;
            count++;
            Deque<int[]> queue = new ArrayDeque<>();
            queue.add(new int[] { r, c });
            grid[r][c] = '0';
            while (!queue.isEmpty()) {
                int[] cell = queue.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                        grid[nr][nc] = '0';
                        queue.add(new int[] { nr, nc });
                    }
                }
            }
        }
    }
    return count;
}`,
      'Find the shortest number of moves from the top-left to the bottom-right of a grid with walls.',
      'Why does BFS find the shortest path in an unweighted graph but DFS does not?',
      'BFS visits nodes in order of distance from the start, so the first time it reaches the target is via the fewest edges. DFS may wander down a long path first.'),
    L('Dynamic programming',
      'Spot overlapping subproblems and solve them once with memoisation or a bottom-up table.',
      'Climbing stairs (1 or 2 steps at a time): ways(n) = ways(n-1) + ways(n-2). A table avoids exponential recomputation.',
String.raw`static long climbStairs(int n) {
    if (n <= 2) return n;
    long prev2 = 1, prev1 = 2;      // ways(1), ways(2)
    for (int i = 3; i <= n; i++) {
        long cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      'Solve coin change: the fewest coins (from 1c, 2c, 5c, 10c...) that make a given amount, or -1 if impossible.',
      'What is the difference between memoisation and tabulation?',
      'Memoisation is top-down: recursion plus a cache of results. Tabulation is bottom-up: fill a table from the smallest subproblems. Both compute each subproblem once.'),
    L('Greedy algorithms',
      'Make the locally best choice when you can prove it leads to a global optimum.',
      'Merge overlapping meeting intervals: sort by start time, then extend or close the current interval.',
String.raw`static int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, Comparator.comparingInt(iv -> iv[0]));
    List<int[]> out = new ArrayList<>();
    for (int[] iv : intervals) {
        if (out.isEmpty() || out.get(out.size() - 1)[1] < iv[0]) {
            out.add(iv);
        } else {
            out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], iv[1]);
        }
    }
    return out.toArray(new int[0][]);
}`,
      'Find the minimum number of meeting rooms needed for a list of meetings.',
      'Can you give an example where a greedy choice fails?',
      'Coin change with coins {1, 3, 4} for amount 6: greedy takes 4 + 1 + 1 (3 coins), but 3 + 3 (2 coins) is optimal. That problem needs dynamic programming.'),
  ],
});

M.push({
  id: 'coding-assessments', title: 'Coding assessments', cat: 'Career', code: '05 · INTERVIEW',
  desc: 'Prepare for the online assessments (HackerRank, Codility) and live coding rounds used by Irish tech employers.',
  outcome: 'Solve an easy and a medium problem in 70 minutes, with tests, while explaining your approach.',
  jobSkills: ['Online coding assessment (HackerRank) with one easy and one medium problem', 'Technical interview'],
  sourceUrl: 'https://www.hackerrank.com/domains/tutorials/10-days-of-javascript', sourceLabel: 'HackerRank · practice',
  example: 'A typical online assessment gives two problems in about 70–90 minutes, scored by hidden test cases. Partial credit comes from passing some tests, so a working brute force beats an unfinished clever solution.',
  exercise: 'Do three practice-lab challenges under a 25-minute timer each. After each, write the complexity and one edge case you missed.',
  quiz: 'You have 10 minutes left and an O(n²) solution that works. What should you do first?',
  quizChoices: ['Submit it so it passes the tests it can, then optimise if time remains', 'Delete it and start an O(n) solution', 'Stop and add comments'], answer: 0,
  lessons: [
    L('How online assessments work',
      'Know the format: timed problems, hidden test cases, partial scoring, sometimes SQL or multiple-choice questions.',
      'Reported Irish intern assessments (Microsoft, IBM, Udemy, Amazon) use HackerRank: one easy and one medium problem, sometimes a SQL question or short quizzes.',
String.raw`Before you start
- Read every problem first; do the easier one first
- Check input limits: n ≤ 10^3 allows O(n²); n ≤ 10^5 needs O(n log n) or better
- Use a language you are fast in (Java, Python, JavaScript)
- Know how to read input from STDIN in that language
- Run the sample tests, then add your own edge cases`,
      'Do one timed HackerRank "Easy" problem in Java and one in Python. Note which was faster for you.',
      'If n can be 100,000, is an O(n²) solution likely to pass?',
      'Probably not. 10^10 operations is far beyond the 1–2 seconds most judges allow. Aim for O(n log n) or O(n).'),
    L('A method for any problem',
      'Use a repeatable process: understand, match a pattern, plan, implement, review, evaluate.',
      'Interviewers score how you reach an answer, not only the answer. Saying the plan out loud lets them help you if you drift.',
String.raw`1. Understand  restate the problem, ask about input size and edge cases
2. Match       which pattern fits? hash map, two pointers, BFS, DP...
3. Plan        write steps in plain English or pseudocode
4. Implement   clear names, small helper methods
5. Review      trace a small example by hand
6. Evaluate    state time and space complexity, suggest improvements`,
      'Apply the six steps out loud to the Valid Parentheses challenge, recording yourself on your phone.',
      'What should you ask before coding a function that takes an array?',
      'Can it be empty or null? How large can it be? Can values be negative or repeated? Is it sorted? What should be returned when there is no answer?'),
    L('Pattern recognition cheat sheet',
      'Map common problem phrasings to the technique that usually solves them.',
      '"Find a pair that sums to X" suggests a hash map; "shortest path in a grid" suggests BFS; "number of ways" suggests dynamic programming.',
String.raw`Phrase in the problem             Try first
"pair / complement / seen before"  HashMap / HashSet
"sorted array", "find position"    Binary search, two pointers
"contiguous subarray / substring"  Sliding window, prefix sums
"brackets, undo, nearest greater"  Stack
"levels, shortest path, grid"      BFS
"all combinations / permutations"  Backtracking
"number of ways, min cost"         Dynamic programming
"top k, k-th largest"              Heap (PriorityQueue)
"intervals, schedule"              Sort, then greedy`,
      'Classify ten problems from the practice lab by pattern before solving them.',
      'A problem asks for the k-th largest element. Which structure gives O(n log k)?',
      'A min-heap of size k: push each element and pop when the heap exceeds k. The top of the heap is the answer.'),
    L('Edge cases and testing your own code',
      'Find bugs before the hidden tests do by checking boundaries.',
      'A sum-of-array function passes [1, 2, 3] but fails on [] and on values that overflow int.',
String.raw`Always try
- empty input, single element
- duplicates, all values equal
- negative numbers and zero
- maximum sizes (overflow? time limit?)
- already sorted / reverse sorted
- no valid answer exists`,
      'Write five edge-case tests for your Two Sum solution before running it.',
      'Your solution passes the sample tests but fails hidden ones. What do you check first?',
      'Edge cases (empty input, duplicates, negatives), integer overflow, and time limits on large inputs.'),
    L('Talking through complexity',
      'State time and space complexity confidently and justify it from the code.',
      '"The loop runs n times and each map lookup is O(1) on average, so time is O(n). The map can hold n entries, so space is O(n)."',
String.raw`for (...)                    // n iterations
    map.get(...)             //   O(1) average
=> O(n) time

sort(array)                  // O(n log n)
for (...) binarySearch(...)  // n × O(log n)
=> O(n log n) time`,
      'Explain the complexity of merge sort out loud in under one minute.',
      'Does recursion use extra space even with no new arrays?',
      'Yes. Each call adds a frame to the call stack, so recursion depth d uses O(d) space.'),
    L('Live coding with an interviewer',
      'Collaborate in a live round: think aloud, take hints, and test as you go.',
      'Microsoft Dublin interns describe a final round of behavioural and technical interviews with three interviewers. Clear communication counts as much as the code.',
String.raw`Do
- think aloud, even when stuck ("I'm considering a map because...")
- start with brute force, then improve
- write readable code; name things well
- test with an example before saying you are done
Don't
- code in silence for 10 minutes
- argue with a hint
- claim it works without tracing it`,
      'Do a mock interview with a friend using the interview prep timer. Swap roles afterwards.',
      'The interviewer gives you a hint you did not expect. What is the best response?',
      'Thank them, restate how the hint changes your approach, and adjust. Using hints well is a positive signal.'),
  ],
});

M.push({
  id: 'git', title: 'Git and GitHub', cat: 'Engineering', code: '06 · ENGINEERING',
  desc: 'Track changes, branch safely, resolve conflicts and collaborate through pull requests.',
  outcome: 'Use a feature-branch workflow with clear commits and pull requests that teammates can review.',
  jobSkills: ['Version control with Git', 'Peer code reviews', 'Collaborating in a team codebase'],
  sourceUrl: 'https://git-scm.com/book/en/v2', sourceLabel: 'Pro Git book',
  example: 'You create a branch for a bug fix, commit two small changes, push, open a pull request, address review comments and merge. Main stays deployable throughout.',
  exercise: 'Create a GitHub repository for a portfolio project with a README, a .gitignore and at least five meaningful commits made on feature branches through pull requests.',
  quiz: 'What does git pull do?',
  quizChoices: ['Fetches remote changes and merges them into your current branch', 'Uploads your commits to the remote', 'Deletes your local changes'], answer: 0,
  lessons: [
    L('Commits and the staging area',
      'Understand working directory, staging area and repository, and make small, focused commits.',
      'You fixed a bug and also renamed a variable. Stage and commit them separately so each commit tells one story.',
String.raw`git init
git status                 # what changed?
git add src/Grades.java     # stage one file
git commit -m "Fix average when list is empty"
git log --oneline          # history
git diff                   # unstaged changes
git diff --staged          # what will be committed`,
      'Make three commits in a new repository, then use git log --oneline and git show to inspect them.',
      'What is the staging area for?',
      'It lets you choose exactly which changes go into the next commit, so one working session can become several focused commits.'),
    L('Branches and merging',
      'Work on features in branches and merge them back without breaking main.',
      'A feature branch keeps half-finished work off main. When it is ready, it is merged after review.',
String.raw`git switch -c feature/search    # create and switch
# ...edit, add, commit...
git switch main
git pull                         # update main first
git merge feature/search
git branch -d feature/search`,
      'Create two branches that edit different files and merge both into main.',
      'What is a fast-forward merge?',
      'When main has no new commits since the branch was created, Git just moves the main pointer forward to the branch tip; no merge commit is needed.'),
    L('Resolving merge conflicts',
      'Read conflict markers, choose the right result, and finish the merge.',
      'Two branches changed the same line. Git stops and marks both versions; you edit the file to the correct final text.',
String.raw`<<<<<<< HEAD
int limit = 10;
=======
int limit = 25;
>>>>>>> feature/limits

# after editing the file to the correct value:
git add Config.java
git commit          # or: git merge --continue`,
      'Create a deliberate conflict between two branches and resolve it. Run the tests before committing.',
      'After resolving a conflict, what should you do before committing?',
      'Remove every conflict marker, build the project and run the tests, because a syntactically resolved file can still be logically wrong.'),
    L('Remotes, pull requests and code review',
      'Push branches, open a pull request with a clear description, and respond to review.',
      'A good PR is small, explains why, shows how it was tested, and links the issue it closes.',
String.raw`git push -u origin feature/search

PR description
## What
Adds search by title to the book list.
## Why
Closes #12: users could not find books quickly.
## How tested
- Unit tests for BookSearch (empty query, case-insensitive)
- Manually searched for "dune" in the UI`,
      'Open a PR on your portfolio repo, ask a classmate to review it, and resolve every comment.',
      'How should you respond to a review comment you disagree with?',
      'Explain your reasoning politely with evidence (a test, a doc link). If you still disagree, discuss it briefly or with the team; do not ignore the comment.'),
    L('Rebasing, undoing and recovering',
      'Keep history tidy with rebase, and undo mistakes safely.',
      'Your branch is behind main. Rebasing replays your commits on top of the latest main, giving a linear history.',
String.raw`git fetch origin
git rebase origin/main         # replay your commits on top

git restore file.txt           # discard unstaged edits
git restore --staged file.txt  # unstage
git commit --amend             # fix the last commit (before pushing)
git revert <sha>               # undo a pushed commit with a new commit
git reflog                     # find "lost" commits`,
      'Make a bad commit, push it, then undo it with git revert. Why not git reset on a shared branch?',
      'Why should you avoid rewriting history on a shared branch?',
      'Rewriting changes commit IDs. Teammates who already pulled the old commits get diverged histories and confusing conflicts. Use revert on shared branches.'),
    L('Good habits: .gitignore, secrets and messages',
      'Keep build output and secrets out of the repository, and write commit messages that explain why.',
      'A .env file with an API key was nearly committed. A .gitignore entry prevents it.',
String.raw`# .gitignore
target/
node_modules/
.env
*.log
.idea/

# Commit message
Fix overdue fine for loans returned on the due date

Fines were charged when returnDate == dueDate. Compare with
isAfter() so same-day returns are free. Adds a regression test.`,
      'Add a .gitignore to your project and check git status shows no build files.',
      'You committed and pushed an API key. Is deleting the file enough?',
      'No. The key is still in history and may already be copied. Revoke and rotate the key first, then remove it from history if needed.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
