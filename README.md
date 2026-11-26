# Study Desk

A calm, structured computer science study app for **ADHD and autistic learners**. Its content is shaped by what Irish software engineering internship posts ask for. It uses plain HTML, CSS and JavaScript with no build step.

- **18 modules, 121 short steps.** Each step takes 5–15 minutes and always has the same layout: Goal → Example → Code → Try it → Check yourself.
- **6 certifications** (freeCodeCamp-style): Programming Foundations, Data Structures and Algorithms, Back-End Development with Java, Front-End Development, Software Engineering Practice, Data and AI.
- **8 portfolio projects** written as user stories, each with a CV bullet.
- **13 coding challenges** in the style of HackerRank and Codility. They run in the browser with a pass/fail result for each test, and include hints and JavaScript and Java reference solutions.
- **A roadmap view** (roadmap.sh-style) of the whole path.

## Languages taught

Java (main language), JavaScript and React, HTML and CSS, SQL, Python, PHP and Bash. TypeScript is added because it pairs with JavaScript and React. A "Choosing your next language" module introduces C#, C++, Go and Kotlin, which Irish employers also list.

## Comfort settings (⚙ in the top bar)

- Text size
- Extra-readable font (Atkinson Hyperlegible)
- Relaxed line spacing
- Light or dark theme, and calm (lower-intensity) colours
- Reduce motion
- Hide time estimates
- Break reminders (off, 25, 45 or 60 minutes) with a 5-minute break timer
- A small daily goal, with no streaks to lose

Lesson pages also have read aloud, focus reading (hides navigation) and keyboard shortcuts.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: next step, daily goal, certifications, module roadmaps |
| `learn.html` | Certifications → modules → numbered steps, plus projects |
| `lesson.html?m=<module>&i=<step>` | One step at a time; `&review=1` for the module quiz and summary |
| `roadmap.html` | Visual roadmap; `?m=<module>` for one module |
| `practice.html` | Challenge list; `?c=<id>` opens the editor and tests |
| `projects.html` | Projects; `?p=<id>` for the user-story checklist |
| `interview.html` | Technical and STAR behavioural prompts, optional timer |
| `career.html` | Irish internship requirements (with sources), 12-week plan, job links |
| `community.html`, `notes.html` | Local discussions and private notes |

Course content is in `js/content/`. The app is in `js/app.js` and the styles are in `css/styles.css`.

## Run

```bash
npm start
```

Then open http://localhost:8000. Use `localhost` or HTTPS, because password hashing needs a secure context.

## Accounts and data

Any logged-in user can change their password by clicking their name in the top bar.

All data (accounts, progress, notes, discussions) is stored in the browser's localStorage. It stays on one device and is not a real server-side login.

## Tests

```bash
npm install
npm test
```

- `tests/content.test.js` checks that every lesson is complete, that each check is a real question, and that all references are consistent. It also runs every challenge solution against its tests.
- `tests/app.test.js` drives every page in Chromium with Playwright.
