/* Security path, part 2: recon and the main web vulnerability classes.
   Each lesson teaches how a flaw works, how to recognise it in your own lab,
   its impact, and the fix to recommend in a report. */
(function (M, L) {

M.push({
  id: 'recon', title: 'Reconnaissance and attack surface mapping', cat: 'Security', code: 'SEC 05 · WEB HACKING', ethics: true,
  desc: 'Map what a program exposes (subdomains, live hosts, endpoints, technologies) using passive sources and rate-limited tools, always inside scope.',
  outcome: 'Turn a program scope into a prioritised, in-scope list of assets worth testing by hand.',
  jobSkills: ['Reconnaissance methodology', 'Scripting and automation', 'Respecting scope and rate limits'],
  sourceUrl: 'https://owasp.org/www-project-web-security-testing-guide/', sourceLabel: 'OWASP Web Security Testing Guide',
  example: 'Certificate transparency lists a forgotten staging host covered by a *.example.ie scope. It runs an older build with verbose errors, so it is a good place to begin, inside scope.',
  exercise: 'For a public program with a wildcard scope, write a recon note: in-scope subdomains, live hosts, technologies, and your top five targets with reasons. Use passive sources and polite rate limits only.',
  quiz: 'Recon finds api-old.example.ie, but the policy lists only www.example.ie in scope. What do you do?',
  quizChoices: ['Do not test it; ask the program whether it can be added to scope', 'Test it quietly, it is the same company', 'Test it but do not report it'], answer: 0,
  lessons: [
    L('Read the program like a contract',
      'Extract scope, exclusions, rules and rewards before any recon.',
      'A policy puts *.example.ie in scope, excludes a third-party-hosted blog, and lists self-XSS and missing headers as not eligible.',
String.raw`Record before you start
Scope          *.example.ie, api.example.ie, the Android app
Out of scope   blog.example.ie (third party), *.cdn.example.ie
Not eligible   self-XSS, missing headers, rate limits on public pages
Rules          max 5 req/s; add header X-Bug-Bounty: <yourname>
Test accounts  register with the program's email alias`,
      'Fill this template in for two programs and decide which suits a beginner.',
      'Why read the "not eligible" list first?',
      'It stops you spending hours on bug classes the program will close as informative.'),
    L('Passive subdomain discovery',
      'Find subdomains from public data without sending traffic to the target.',
      'Certificate transparency logs record every certificate issued for a domain, which usually reveals staging and internal subdomains.',
String.raw`# Certificate transparency (passive, no traffic to the target)
curl -s "https://crt.sh/?q=%25.example.ie&output=json" \
  | jq -r '.[].name_value' | tr 'A-Z' 'a-z' \
  | sed 's/^\*\.//' | sort -u > subs.txt

# Always remove out-of-scope hosts before any active step
grep -vf out-of-scope.txt subs.txt > in-scope-subs.txt`,
      'Build an in-scope subdomain list for a wildcard program from passive sources only.',
      'Why prefer passive sources at the start?',
      'They send nothing to the target, so they cannot break rules or add load, and they often surface forgotten assets.'),
    L('Live hosts and technology fingerprinting',
      'Check which in-scope hosts respond and identify their stack, politely.',
      'A rate-limited probe reports status codes, page titles and technologies, which flags neglected hosts such as "Staging" or an old framework version.',
String.raw`# Match the program's rate limit (here: 5 requests/second)
httpx -l in-scope-subs.txt -rl 5 -title -status-code -tech-detect -o live.txt

Worth a closer look
- titles like Staging, Admin, Swagger UI, Grafana
- 401/403 pages (something protected exists there)
- old framework or server versions`,
      'Probe your in-scope list with a rate limit and pick three less-maintained hosts.',
      'Why can a 403 response be interesting?',
      'It shows a protected resource exists; access control is sometimes weaker on other paths, methods or hosts, which you then check by hand, in scope.'),
    L('Endpoint and parameter discovery',
      'Find routes and parameters through the app\'s own JavaScript and gentle, in-scope crawling.',
      'The front-end JavaScript bundle usually references API routes the visible UI never links to.',
String.raw`Low-noise sources first
- Burp/browser: crawl by using every feature as each role
- Read JS bundles (DevTools Sources, Ctrl+Shift+F) for "/api/", "admin", "key"
- Parse the sitemap and robots.txt

Keep a parameters list from what you actually see:
grep -oE '[?&][a-z_]+=' urls.txt | sort -u`,
      'List five API endpoints in your lab app that its UI never links to.',
      'Why prefer reading the app\'s own JavaScript over large wordlist fuzzing?',
      'It is accurate and quiet: you find real endpoints the app uses, without flooding the target with guesses.'),
    L('Prioritise what to test',
      'Rank the attack surface so your manual effort goes where bugs are most likely and most valuable.',
      'An old staging host with a file upload and an admin area outranks a static marketing page for testing.',
String.raw`Score each target (high / medium / low)
+ handles money, personal data, or auth
+ looks old, forgotten or recently changed
+ has rich features: uploads, imports, exports, admin, integrations
+ multiple roles / multi-tenant (tenant A vs tenant B)
- static content, third-party widgets, well-trodden core pages`,
      'Rank your recon list into a top five with one reason each.',
      'Why do multi-tenant apps often reward access-control testing?',
      'They must separate each customer\'s data; a single missing check can expose one tenant\'s data to another.'),
  ],
});

M.push({
  id: 'web-vulns-injection', title: 'Injection and XSS', cat: 'Security', code: 'SEC 06 · WEB HACKING', ethics: true,
  desc: 'Understand SQL injection, cross-site scripting and command/template injection: how each works, how to spot it in your lab, its impact, and the fix.',
  outcome: 'Recognise injection points, demonstrate them safely in a lab, judge impact, and recommend the correct remediation.',
  jobSkills: ['OWASP Top 10: Injection and XSS', 'Manual testing beyond scanners', 'Clear remediation advice'],
  sourceUrl: 'https://portswigger.net/web-security', sourceLabel: 'PortSwigger Web Security Academy',
  example: 'A search box reflects your input into the page. In a lab, a harmless payload like <b>test</b> rendering as bold text shows the output is not encoded: the root of reflected XSS.',
  exercise: 'In PortSwigger\'s free labs, solve one SQL injection and one reflected XSS lab. For each, write the cause, a safe proof, the impact, and the one-line fix.',
  quiz: 'What is the primary fix for SQL injection?',
  quizChoices: ['Parameterised queries (prepared statements)', 'Hiding database error messages', 'Removing quotes from input'], answer: 0,
  lessons: [
    L('Why injection happens',
      'See the single root cause: untrusted input mixed into a command or markup that a parser then executes.',
      'When a value is pasted straight into SQL, HTML or a shell command, the parser cannot tell the developer\'s code from the attacker\'s data.',
String.raw`The pattern behind every injection
  trusted template  +  untrusted input  ->  one string  ->  parser runs it

SQL   "...WHERE name = '" + input + "'"        -> SQL injection
HTML  element.innerHTML = input                -> XSS
Shell "ping " + input                          -> command injection
Fix everywhere: keep data OUT of the code. Use parameters/APIs that
separate the two, and encode for the output context.`,
      'For each example above, point to exactly where data crosses into code.',
      'Why does separating data from code stop injection at the root?',
      'The parser is given the code and the data separately, so attacker input is always treated as a value, never as commands or markup.'),
    L('SQL injection: recognise and prove safely',
      'Detect SQL injection by behaviour and prove it with the least intrusive evidence.',
      'In a lab, a single quote causing a 500 error, and a logically-true vs logically-false condition changing results, indicate the input reaches the query.',
String.raw`Signs (in your own lab or an authorised program)
- a quote changes the response or causes an error
- "... AND 1=1" vs "... AND 1=2" give different results
- small time differences on a conditional delay (blind)

Prove impact with the MINIMUM
- read a harmless value (e.g. the database version), not real user data
- never run UPDATE/DELETE/DROP against a live target
- stop as soon as the issue is demonstrated

Fix: parameterised queries / ORM bindings; least-privilege DB user.`,
      'Solve one PortSwigger SQLi lab, proving it by retrieving the database version only.',
      'Why demonstrate SQLi by reading the version string rather than dumping the users table?',
      'It proves the vulnerability while touching no personal data, which respects the rules and the law.'),
    L('Cross-site scripting (XSS)',
      'Tell reflected, stored and DOM XSS apart and understand the real-world impact.',
      'Stored XSS in a comment runs for every visitor; reflected XSS runs only for someone who follows a crafted link; DOM XSS happens entirely in the browser\'s JavaScript.',
String.raw`Type        Where the input lands                 Who is affected
Reflected   echoed back in the response           a user who clicks a link
Stored      saved, shown to others later          many users
DOM         written into the DOM by client JS     depends on the sink

Safe lab proof: show that text is parsed as HTML (e.g. an element
appears, or a benign popup fires in a lab). Report the injection
point and sink, not a payload aimed at real users.
Fix: encode output for its context; a strong Content-Security-Policy;
frameworks that escape by default.`,
      'Solve one reflected and one stored XSS lab, and note the exact sink in each.',
      'Why is stored XSS usually rated higher than reflected XSS?',
      'Stored XSS runs automatically for everyone who views the page, so it needs no social engineering and affects more users.'),
    L('Context and output encoding',
      'Understand why the fix depends on where the data is placed.',
      'The same value needs different encoding in HTML text, an HTML attribute, a URL or inside JavaScript. Encoding for the wrong context leaves a hole.',
String.raw`Where the data goes          Correct handling
HTML text node               HTML-encode (< > & ")
HTML attribute               attribute-encode + quote the attribute
URL / query parameter        URL-encode
Inside a <script> / JS       JavaScript-encode (prefer: don't do this)
CSS                          CSS-encode (prefer: avoid)

Rule: validate input, but ENCODE on output for the exact context.`,
      'In your lab, find one value shown in two different contexts and describe the right encoding for each.',
      'Why is "just strip < and >" an unreliable fix for XSS?',
      'Different contexts need different encoding, and attackers use other characters and encodings. Context-aware output encoding fixes the real cause.'),
    L('Command and template injection',
      'Recognise where user input can reach a shell or a server-side template engine.',
      'A "ping host" tool that passes input to a shell, or a page that renders user input through a template, can let input become server-side code.',
String.raw`Command injection red flags
- features that run system tools: ping, nslookup, image/PDF conversion
Server-side template injection red flags
- user input appears inside a server-rendered template
- a math expression in a name field is evaluated (e.g. shows 49 for 7*7)

Prove in a lab with a harmless, reversible check. Do not run
destructive commands or touch files outside the lab.
Fix: avoid shelling out; use safe APIs and libraries; never put user
input into template source; sandbox template engines.`,
      'In a deliberately vulnerable lab, identify one command-injection and one SSTI sink and the safe check that reveals each.',
      'Why is passing user input to a system shell dangerous even for a "simple" ping feature?',
      'Shell metacharacters let input add extra commands. Using a safe library call instead of a shell removes the risk.'),
    L('Beyond the scanner',
      'Use automated scanners as a starting point, then verify and extend findings by hand.',
      'A scanner flags a "possible" injection; a human confirms it is real, rules out false positives, and judges true impact before reporting.',
String.raw`Why manual work matters (and employers ask for it)
- scanners produce false positives and miss logic/context bugs
- triagers reject unverified scanner output
- impact needs human judgement (what data, which users, what role)

Workflow: scanner/intruder finds candidates -> you reproduce by hand
in Repeater -> confirm -> assess impact -> write it up.`,
      'Take one scanner finding in your lab, reproduce it manually, and decide whether it is real and what its impact is.',
      'Why do bug bounty triage teams reject raw scanner output?',
      'It is often wrong or low-impact. A verified, manually reproduced report with clear impact is what earns a reward.'),
  ],
});

M.push({
  id: 'web-vulns-access', title: 'Authentication and access control flaws', cat: 'Security', code: 'SEC 07 · WEB HACKING', ethics: true,
  desc: 'Find the highest-value web bugs: broken access control (IDOR, privilege escalation), authentication weaknesses, SSRF and business logic flaws.',
  outcome: 'Test for access-control and logic bugs methodically with multiple accounts, and explain their impact clearly.',
  jobSkills: ['OWASP A01 Broken Access Control', 'SSRF and business logic testing', 'Multi-account/multi-tenant testing'],
  sourceUrl: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/', sourceLabel: 'OWASP · Broken Access Control',
  example: 'Logged in as user A, changing /api/invoices/1001 to /api/invoices/1002 returns user B\'s invoice. That is an IDOR, the most common and often most rewarded bug class.',
  exercise: 'In PortSwigger\'s access-control labs, solve one IDOR and one privilege-escalation lab. Record the exact request that proves each, with two test accounts.',
  quiz: 'The surest way to test for broken access control is to…',
  quizChoices: ['Repeat another user\'s request using your own low-privileged account', 'Scan for missing security headers', 'Check the TLS certificate'], answer: 0,
  lessons: [
    L('Broken access control and IDOR',
      'Test whether one user can reach another user\'s data or actions by changing identifiers.',
      'With two test accounts, you capture a request as user B, then replay it from user A\'s session. If A gets B\'s data, access control is broken.',
String.raw`Method (two of your own test accounts: A and B)
1. As B, do an action: GET /api/orders/5531
2. In Repeater, resend it using A's session cookie/token
3. If A sees B's order -> IDOR (horizontal access control)
Variations: numeric IDs, UUIDs leaked elsewhere, filenames, exports.
Fix: check ownership on the server for every object, every request.`,
      'In a lab, prove an IDOR with two accounts and record the single request that demonstrates it.',
      'Why test with two accounts you control rather than guessing other users\' IDs blindly?',
      'You prove the flaw using only your own data, which avoids accessing real people\'s information and stays within the rules.'),
    L('Privilege escalation',
      'Check whether a low-privileged user can perform admin actions (vertical access control).',
      'A normal user sends the admin-only request POST /api/users/42/role with {"role":"admin"}; if the server does not check the caller\'s role, they escalate.',
String.raw`Look for
- admin endpoints reachable without an admin check
- role or permission values the client can set (cookie, JWT claim, field)
- "force browsing": going straight to /admin without a link
- mass assignment: adding "isAdmin": true to a profile update
Fix: enforce role checks on the server; never trust client-side role.`,
      'In a lab, escalate from user to admin by reaching a function the UI hides, and note the server\'s missing check.',
      'A JWT contains "role":"user". Why is editing it to "role":"admin" only a bug if the server accepts it?',
      'A correctly implemented server verifies the token signature and/or checks the role server-side, so a tampered token is rejected. It is only a vulnerability when the server trusts the unverified claim.'),
    L('Authentication weaknesses',
      'Assess login, session and recovery flows for common failures.',
      'User enumeration (different messages for valid vs invalid usernames), no rate limiting, weak password reset tokens and sessions that never expire are frequent findings.',
String.raw`Checklist (test with your own accounts)
- same response/time for valid and invalid usernames? (enumeration)
- rate limiting / lockout on login and reset?
- reset tokens: long, random, single-use, short-lived?
- does logout and password change invalidate old sessions?
- is MFA enforced where claimed, and not bypassable?
Fix: generic messages, rate limits, strong random tokens, proper
session invalidation.`,
      'In a lab, demonstrate username enumeration and describe the exact difference that leaks it.',
      'Why is a login that says "no such user" vs "wrong password" a security issue?',
      'It confirms which usernames exist, making password-guessing and phishing easier. A single generic message avoids the leak.'),
    L('Server-side request forgery (SSRF)',
      'Find features where the server fetches a URL you control, and understand the impact.',
      'An "import from URL" or webhook feature that fetches attacker-supplied addresses may be steered at internal systems the attacker cannot reach directly.',
String.raw`Where SSRF hides
- import-from-URL, webhooks, PDF/screenshot generators, link previews
Impact (why it is often critical)
- reach internal-only services and cloud metadata endpoints
- read internal responses, pivot deeper into the network
Prove safely: point it at a address you control and confirm the
server connects. Do not probe real internal infrastructure beyond
what proves the issue.
Fix: allowlist destinations, block internal ranges, no raw redirects.`,
      'In a lab, show that a URL-fetching feature connects to a server you control (e.g. a request logger).',
      'Why is SSRF frequently rated critical in cloud environments?',
      'It can reach internal metadata services and private systems from a trusted position, which may expose credentials or allow deeper access.'),
    L('Business logic flaws',
      'Find bugs where every request is valid but the sequence or values break the intended rules.',
      'Applying a single-use discount code twice, buying with a negative quantity, or skipping a payment step are logic flaws no scanner understands.',
String.raw`How to find them
- learn the intended workflow, then break its assumptions
- change order of steps; skip a step; repeat a step
- send values the UI prevents: negative, zero, huge, wrong currency
- race two requests that should not both succeed
Impact depends on the business (free goods, bypassed limits).
Fix: enforce every rule and state transition on the server.`,
      'In a lab or a shop you built, find one logic flaw (e.g. reusing a coupon) and describe the broken assumption.',
      'Why can scanners not find most business logic flaws?',
      'The requests are individually valid; only knowledge of the intended rules reveals that the outcome is wrong.'),
    L('Client-side and chaining',
      'Assess CSRF, clickjacking and how smaller issues combine into a serious one.',
      'An information leak plus an IDOR can become an account takeover: alone each is minor, chained they are critical.',
String.raw`Client-side checks
- CSRF: state-changing request with no token / SameSite protection?
- clickjacking: sensitive action framable (no frame-ancestors)?
Chaining example
  user enumeration -> weak reset token -> account takeover
Always report the full chain and its combined impact, with each step
reproducible.`,
      'Describe a realistic two-bug chain using issues from earlier lessons and its combined impact.',
      'Why can chaining low-severity bugs still deserve a high reward?',
      'Severity is about impact. Two minor issues that together allow account takeover have high real-world impact.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
