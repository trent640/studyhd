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
- **22 coding challenges** with automated tests and instant feedback:
  - JavaScript (HackerRank-style)
  - HTML/CSS with a live preview
  - React logic
  - AI concepts used with Spring AI
  - Each has hints and reference solutions (Java where relevant)
- **Java "predict the output" checks**, because Java code can't run in the browser.
- **12 portfolio projects** written as user stories, each with a CV bullet.
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

## Tests

```bash
npm install
npm test
```

- `tests/content.test.js` checks every module, lesson, certification, job path, project and further-reading link. It also runs every JavaScript challenge's reference solution against its tests.
- `tests/app.test.js` starts the server with a temporary data folder and random admin settings. It then drives every page and feature in Chromium with Playwright, including the forum moderation flow, lectures, Pomodoro (with a fake clock), settings, the roadmap and the API's security behaviour.
