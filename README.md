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

Course content is in `js/content/`. The app is in `js/app.js`, the styles are in `css/styles.css`, and `server.js` is a small Node server (no dependencies) that serves the site and handles accounts.

## Run

Requires Node.js 18 or newer.

1. Copy `.env.example` to `.env` and fill in your settings. Git ignores `.env`, so these never reach the repository.
2. Start the server:

```bash
npm start
```

Then open http://localhost:8000.

## Server settings

| Setting | Purpose |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Enable the admin account. The password must be at least 12 characters. Leave both empty to disable it. |
| `PORT`, `HOST` | Where the server listens (default `127.0.0.1:8000`). |
| `DATA_DIR` | Where member accounts are saved (default `./data`, ignored by Git). |
| `COOKIE_SECURE` | Set to `1` when the site is served over HTTPS. |
| `TRUST_PROXY` | Set to `1` behind a reverse proxy, so rate limiting sees real client addresses. |

Settings can also be given as environment variables, which take priority over `.env`. On a hosting service, use its secret or environment settings instead of a file.

## Accounts and data

- Members sign up and log in through the server. Passwords are hashed with scrypt and stored in `data/users.json`.
- The admin password is only read from the server settings and is never written to disk. To change it, change the setting and restart the server.
- Members can change their password by clicking their name in the top bar; this signs out their other devices.
- Sessions use an `HttpOnly`, `SameSite=Strict` cookie and last 7 days. Restarting the server signs everyone out.
- Study progress, notes and discussions are still kept in each browser's localStorage.
- Without the server (for example, opening the files directly), the site works for guests and login is unavailable.

## Tests

```bash
npm install
npm test
```

- `tests/content.test.js` checks that every lesson is complete, that each check is a real question, and that all references are consistent. It also runs every challenge solution against its tests.
- `tests/app.test.js` starts the server with a temporary data folder and randomly generated admin settings, then drives every page in Chromium with Playwright. It also checks the API's security behaviour.
