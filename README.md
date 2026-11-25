# Study Desk

A roadmap-style computer science study site: 12 modules, 93 lessons, practice, interview prep, career resources, notes and a local community board. Plain HTML/CSS/JS — no build step.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: module roadmaps grid, progress summary |
| `roadmap.html` | Full path roadmap; `roadmap.html?m=<module-id>` for one module |
| `practice.html` | Quizzes, an in-browser code challenge, mini projects |
| `interview.html` | Interview prompts and a 15-minute timer |
| `community.html` | Local discussion board |
| `career.html` | Internship checklists, 12-week plan, job links |
| `notes.html` | Personal notes |

Shared navigation, the lesson drawer and the login/password dialogs are added by `js/app.js`. Lesson content lives in `js/modules.js`.

## Run

```bash
npm start
```

Then open http://localhost:8000. Use `localhost` or HTTPS: password hashing needs a secure context.

## Admin account

On first load the site creates an `admin` account with the password `Password`. After logging in with it you must choose a new password before continuing. Any logged-in user can change their password by clicking their name in the top bar.

All data (accounts, progress, notes, discussions) is stored in the browser's localStorage, so it is per-device and not a real server-side login.

## Tests

```bash
npm test
```

Runs end-to-end tests in Chromium with Playwright (`tests/app.test.js`).
