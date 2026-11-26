# Study Desk

A calm, structured computer science study app for learners with **ADHD, autism or both**. It teaches Java, Spring and Spring Boot, HTML, CSS, React, Tailwind CSS, JavaScript and MySQL, plus compatible languages employers ask for. The content is checked against what Irish software internship posts require.

It uses plain HTML, CSS and JavaScript (no build step) with a small Node server for accounts and the forum.

## What's inside

- **37 modules and 242 short steps.** Every step takes 5–15 minutes and always has the same layout: Goal → Example → Code → Try it → Check yourself.
- **The brief's core modules:** Algorithms; Database Development and Management (MySQL); Data Analysis; Introduction to Software Engineering; Object-Oriented Programming (Java); Security for Software Developers; Software Testing; Software Project Management; Web Patterns; Cloud Frameworks (Spring Boot); Frontend (React, HTML, CSS, Tailwind CSS); Backend (Java, Spring, Spring Boot).
- **Also covered:** data structures, Git, coding assessments, REST APIs, Python, TypeScript, Linux/Docker/cloud, teamwork and interviews, Spring AI, and a full cybersecurity and bug bounty certification.
- **8 certifications** (freeCodeCamp-style) and **3 job paths:** software engineering internship, Java backend and AI developer, and bug bounty hunter.
- **Captioned lectures** with full transcripts, speed control and optional narration (3 OOP lectures, plus Java, Spring and React lectures). A lecture can also play a recorded video with WebVTT captions.
- **Final quizzes** with instant feedback and a score.
- **A real code editor** (CodeMirror, with syntax highlighting, bracket matching and keyboard shortcuts) on every challenge. Your code is **run against automated tests**, not compared with a stored answer, so any correct solution passes:
  - **JavaScript** runs in a time-limited Web Worker in the browser.
  - **HTML/CSS** renders in a sandboxed live preview and is checked in the page.
  - **SQL** runs in a real SQLite database (sql.js, in a Web Worker) seeded with the challenge's tables; the result rows are compared.
  - **Java** is compiled with `javac` and run on the server (logged-in members, see *Java runner* below). Compile errors and your `System.out` output are shown.
- **30 coding challenges:** 19 JavaScript (17 of them also solvable in Java), 3 HTML/CSS, 4 Java-only (bank account, gradebook, min-heap, validation) and 4 SQL. Each has hints and a reference solution that you can reveal.
- **Java "predict the output" checks**, which can now also be run for real.
- **12 portfolio projects** written as user stories, each with a CV bullet. Seven have **automated checks**: linked challenges that test the project's core logic, which must pass before the project can be marked done.
- **A roadmap** that combines three influences:
  - W3Schools: a topic menu, big Previous/Next buttons and "Try it Yourself"
  - freeCodeCamp: certification blocks and numbered step rows
  - roadmap.sh: a visual graph with certification checkpoints
- **Further reading** on most modules: verified links to W3Schools tutorials and freeCodeCamp certifications.

## Designed for ADHD and autistic learners

- The same predictable layout on every page, with one clear "next step" button and an energy check ("low / some / lots of energy").
- **Tasks** page and a "Today" panel for small, specific to-dos (any lesson step can be added).
- **Pomodoro timer** (⏱): 15, 25 or 45-minute focus sessions followed by a 5-minute break, with a daily count.
- **Points and badges** that are never taken away, and can be hidden.
- **Comfort settings** (⚙):
  - Simple or detailed view (simple shows one lesson part at a time)
  - Text size, line spacing and reduced motion
  - Fonts: Inter, Atkinson Hyperlegible, Lexend or OpenDyslexic
  - Light, dark or high-contrast theme, plus calmer colours
  - Break reminders, a small daily goal (no streaks) and time estimates on or off
- Lesson pages also have read aloud, focus reading (hides navigation) and keyboard shortcuts.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: next step, today's tasks, energy check, progress, paths and certifications |
| `learn.html` | Certifications → modules → numbered steps, lectures, quizzes and projects (`?path=` for a job path) |
| `lesson.html?m=<module>&i=<step>` | One step at a time; `&review=1` for the module review and final quiz |
| `lecture.html?m=<module>&l=<n>` | Captioned lecture with transcript |
| `roadmap.html` | Roadmap (`?path=` for a job path, `?m=` for one module) |
| `practice.html` | Challenges; `?c=<id>` opens the editor, preview and tests |
| `projects.html` | Projects; `?p=<id>` for the user-story checklist |
| `tasks.html` | Task list |
| `interview.html` | Technical, Java and Spring, AI with Spring Boot, and STAR questions |
| `career.html` | Requirements with sources, CV tips, 12-week plan, job links |
| `community.html` | Moderated forum with replies, anonymous posts and guidelines |
| `notes.html` | Private notes |

Course content is in `js/content/`, the app is in `js/app.js`, styles in `css/styles.css`, and `server.js` is the Node server (no dependencies). After adding a page or content file, regenerate the page shells with `python3 tools/build-pages.py`.

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
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Enable the admin (moderator) account. The password must be at least 12 characters. Leave both empty to disable it. |
| `PORT`, `HOST` | Where the server listens (default `127.0.0.1:8000`). |
| `DATA_DIR` | Where accounts and forum posts are saved (default `./data`, ignored by Git). |
| `COOKIE_SECURE` | Set to `1` when the site is served over HTTPS. |
| `TRUST_PROXY` | Set to `1` behind a reverse proxy, so rate limiting sees real client addresses. |
| `CODE_RUNNER` | Who may run Java: `auto` (default: members when the sandbox is available, otherwise the admin only), `off`, or `all` (members even without the sandbox — not recommended on a public server). |

## Java runner

Java challenges are compiled and run by the server with the JDK (`javac` and `java` must be on the `PATH`; without them the Java tabs explain that Java is unavailable and JavaScript/SQL still work).

On Linux each run is sandboxed: it gets its own user, PID, mount and network namespaces (`unshare`), with no network, a read-only view of the host, the project folder, `data/`, the home directory and `/tmp` hidden, and a private 32 MB scratch folder. It has limits on CPU (10 s), memory, file size (10 MB), processes and threads, and wall-clock time, and all its processes are killed at the end. If the server runs as root, runs drop to the `nobody` user. If the sandbox cannot be set up, the run is refused rather than run unprotected. Runs need a login, one at a time per account, and are rate limited (15 a minute per account). Code is limited to 48 KB. The sandbox needs `unshare`, `prlimit` and (as root) `setpriv` from util-linux.

Settings can also be given as environment variables, which take priority over `.env`. On a hosting service, use its secret or environment settings instead of a file.

## Accounts, forum and data

- Members sign up and log in through the server. Passwords are hashed with scrypt and stored in `data/users.json`.
- The admin password is only read from the server settings and never written to disk. To change it, change the setting and restart the server.
- Members can change their password by clicking their name in the top bar; this signs out their other devices.
- Sessions use an `HttpOnly`, `SameSite=Strict` cookie and last 7 days. Restarting the server signs everyone out.
- **Forum** posts and replies are stored in `data/posts.json`:
  - Posting needs an account and agreement to the community guidelines.
  - Posts can be anonymous. Moderators can still see the author.
  - A post reported by three learners is hidden until the admin restores or deletes it.
- Study progress, notes, tasks and settings are kept in each browser's localStorage.
- Without the server (for example, opening the files directly), the site works for guests, the forum is saved in the browser only, and login is unavailable.

## Third-party code

Vendored, unmodified, in `js/vendor/` and `fonts/`, each with its licence file: CodeMirror 5.65 (MIT), sql.js 1.17 (MIT) and OpenDyslexic (SIL OFL). Nothing is loaded from a CDN except Google Fonts.

## Tests

```bash
npm install
npm test
```

- `tests/content.test.js` checks every module, lesson, certification, job path, project and further-reading link. It also runs every JavaScript challenge's reference solution and starter against its tests.
- `tests/app.test.js` starts the server with a temporary data folder and random admin settings. It then drives every page and feature in Chromium with Playwright, including the forum moderation flow, lectures, Pomodoro (with a fake clock), settings, the roadmap and the API's security behaviour.
- `tests/server.test.js` checks the server's security rules (unusual usernames, malformed cookies, headers, registration and login limits, forum report rules) and the runner: validation, the `CODE_RUNNER` policy, the sandbox (no project files, no network, timeouts), and every Java and SQL challenge's reference solution passing and starter failing with the real `javac`/`java` and SQLite.
