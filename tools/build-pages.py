import os
# Regenerates the HTML page shells (one per page) with the shared head, CSP and scripts.
# Run after adding a page or a content file:  python3 tools/build-pages.py
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pages = [
    ('index.html', 'home', 'Study Desk · Computer science, one step at a time', 'A calm, structured computer science study app for learners with ADHD, autism or both.'),
    ('learn.html', 'learn', 'Learn · Study Desk', 'Certifications made of short, numbered steps.'),
    ('lesson.html', 'lesson', 'Lesson · Study Desk', 'One short study step: goal, example, code, try it, check yourself.'),
    ('roadmap.html', 'roadmap', 'Roadmap · Study Desk', 'The full computer science path as a visual roadmap.'),
    ('practice.html', 'practice', 'Practice · Study Desk', 'Assessment-style coding challenges with tests, hints and reference solutions.'),
    ('projects.html', 'projects', 'Projects · Study Desk', 'Portfolio projects described as user stories.'),
    ('interview.html', 'interview', 'Interview prep · Study Desk', 'Technical and behavioural interview practice.'),
    ('community.html', 'community', 'Community · Study Desk', 'Start a focused discussion about a topic or exercise.'),
    ('career.html', 'career', 'Career · Study Desk', 'What Irish software internship posts ask for, a 12-week plan and job links.'),
    ('notes.html', 'notes', 'Notes · Study Desk', 'Your private study notes.'),
    ('tasks.html', 'tasks', 'Tasks · Study Desk', 'Your study task list.'),
    ('lecture.html', 'lecture', 'Lecture · Study Desk', 'A short lecture with captions and a transcript.'),
]
import glob
content = sorted(glob.glob(os.path.join(root, 'js', 'content', '*.js')))
scripts = ['js/content/' + os.path.basename(c) for c in content] + ['js/app.js']
# The code editor (CodeMirror, MIT licence) is only loaded on the practice page.
editor_js = ['js/vendor/codemirror/' + f for f in ['codemirror.js', 'addon-matchbrackets.js', 'addon-closebrackets.js', 'mode-javascript.js', 'mode-clike.js', 'mode-sql.js', 'mode-xml.js', 'mode-css.js', 'mode-htmlmixed.js']]
extra = {'practice': {'css': ['js/vendor/codemirror/codemirror.css'], 'js': editor_js}}
tpl = '''<!doctype html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; {script_csp}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@400;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
{extra_css}<link rel="stylesheet" href="css/styles.css">
</head>
<body data-page="{page}"{dark}>
<main id="app" tabindex="-1"><noscript><p style="padding:24px">Study Desk needs JavaScript enabled.</p></noscript></main>
{scripts}
</body>
</html>
'''
for fn, page, title, desc in pages:
    with open(os.path.join(root, fn), 'w') as f:
        ex = extra.get(page, {})
        # Only the practice page runs learner code, so only it may use eval, WebAssembly and blob: workers.
        script_csp = "script-src 'self' blob: 'unsafe-eval' 'wasm-unsafe-eval'; worker-src blob:" if page == 'practice' else "script-src 'self'; worker-src 'none'"
        f.write(tpl.format(title=title, desc=desc, page=page, dark='', script_csp=script_csp,
                           extra_css=''.join('<link rel="stylesheet" href="%s">\n' % c for c in ex.get('css', [])),
                           scripts='\n'.join('<script src="%s"></script>' % s for s in ex.get('js', []) + scripts)))
print('written', len(pages))
