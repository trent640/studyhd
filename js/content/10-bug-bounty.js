/* Security path, part 3: API/mobile/cloud surface, then the bug bounty career:
   methodology, report writing, triage, and turning it into a job. */
(function (M, L) {

M.push({
  id: 'api-mobile-cloud', title: 'API, mobile and cloud testing', cat: 'Security', code: 'SEC 08 · WEB HACKING', ethics: true,
  desc: 'Extend testing to REST and GraphQL APIs, mobile app back ends, and common cloud misconfigurations, where much modern attack surface lives.',
  outcome: 'Test an API for the OWASP API Top 10 issues, pull endpoints from a mobile app, and recognise exposed cloud storage.',
  jobSkills: ['OWASP API Security Top 10', 'Mobile app testing basics', 'Cloud misconfiguration awareness'],
  sourceUrl: 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/', sourceLabel: 'OWASP API Security Top 10',
  example: 'A mobile banking app talks to /api/v2/accounts. Proxying the app reveals the API has no object-level authorisation, so account numbers can be swapped: the API version of an IDOR.',
  exercise: 'Proxy a lab mobile app or a REST API through Burp. Document its endpoints, auth model, and test one object for broken object-level authorisation.',
  quiz: 'The number one risk in the OWASP API Security Top 10 is…',
  quizChoices: ['Broken object-level authorisation (BOLA/IDOR)', 'Missing security headers', 'Slow responses'], answer: 0,
  lessons: [
    L('REST APIs as attack surface',
      'Apply access-control and injection testing to JSON APIs, which often expose more than the web UI.',
      'APIs frequently return more fields than the UI shows and skip the authorisation checks the web app performs, so the same IDOR and injection tests pay off.',
String.raw`API-specific checks
- object-level auth: can role A read object owned by role B? (BOLA)
- function-level auth: can a user call admin-only endpoints?
- excessive data: does the JSON include fields the UI hides?
- mass assignment: does PATCH accept fields like "isAdmin"?
- old versions: /api/v1 still live and less protected than /api/v2?
Read any Swagger/OpenAPI doc the program exposes.`,
      'Find an OpenAPI/Swagger page in a lab API and list every endpoint and its required role.',
      'Why does an API often expose more data than the website that uses it?',
      'The server sends the full object and relies on the client to display a subset, so the API response may contain fields the UI hides.'),
    L('GraphQL testing',
      'Understand GraphQL\'s single endpoint, introspection, and its authorisation pitfalls.',
      'A GraphQL endpoint with introspection enabled lists its whole schema; authorisation must be checked on each field, so a single missing check leaks data.',
String.raw`GraphQL basics for testing
- one endpoint, usually /graphql, methods POST (sometimes GET)
- introspection query reveals the full schema if left enabled
- each query/mutation/field needs its own authorisation check
- deeply nested queries can cause denial of service (if allowed)
Check: can a low-priv user query or mutate data they should not?
Fix: per-field authorisation, disable introspection in production,
depth/complexity limits.`,
      'In a lab GraphQL API, run an introspection query and map the types and fields a normal user can reach.',
      'Why is "the endpoint requires a login" not enough authorisation for GraphQL?',
      'Being authenticated is not being authorised. Each field still needs an ownership/role check, or any logged-in user can read restricted data.'),
    L('Mobile app back ends',
      'Extract the API a mobile app uses and test it like any other API, within scope.',
      'Proxying a mobile app (or reading its unpacked resources) reveals base URLs, API keys and endpoints that the app talks to.',
String.raw`Getting a mobile app's API (only apps/programs in scope)
- route the device/emulator through Burp; trust its CA in the lab
- unpack the app package and search strings for "http", "api", "key"
- note hardcoded secrets, endpoints, and the auth scheme
Then test the API as usual: BOLA, function-level auth, injection.
Note: certificate pinning may require a lab device you control;
never bypass protections on apps you are not authorised to test.`,
      'In a lab app, list the back-end endpoints the app calls and any secrets hardcoded in it.',
      'Why is a secret key hardcoded in a mobile app effectively public?',
      'Anyone can download and unpack the app and read it, so a hardcoded secret should be treated as exposed.'),
    L('Cloud misconfigurations',
      'Recognise the common cloud mistakes that appear in bug bounty scope.',
      'A public cloud storage bucket listing files, or a leaked metadata endpoint reachable via SSRF, are frequent high-impact findings.',
String.raw`Common, high-impact cloud issues
- object storage (S3/GCS/Azure Blob) set to public read/list
- backups, logs or source accidentally exposed
- SSRF reaching the cloud metadata service for credentials
- overly broad IAM permissions on an exposed service
Report the exposure and its impact; do not download data beyond the
minimum proof, and never alter or delete anything.`,
      'In a lab, identify a misconfigured public bucket and prove access by listing (not downloading) its contents.',
      'If you find a public bucket of customer files, what is the right proof to include?',
      'Evidence that it is publicly listable (e.g. one redacted filename or the listing response), not a download of the files.'),
    L('Rate limits, WAFs and being a good guest',
      'Work within defences: respect rate limits, recognise WAFs, and avoid causing harm.',
      'A sudden block or CAPTCHAs mean a WAF is reacting. The right response is to slow down and test by hand, not to hammer harder.',
String.raw`Be the researcher programs want back
- stay under the stated rate limit; serialise tools
- identify yourself with the required header
- if you trigger a block, stop and slow down
- never test payment or destructive flows against production
- report availability concerns; never cause an outage to prove one`,
      'Configure your tools to a program\'s rate limit and add its required identifying header.',
      'Why is "evading the WAF aggressively" often the wrong move in a bug bounty?',
      'It can cause load, trip alarms, and break program rules. The goal is a verified bug with minimal impact, not a fight with defences.'),
  ],
});

M.push({
  id: 'bug-bounty-practice', title: 'Bug bounty: methodology and reporting', cat: 'Security', code: 'SEC 09 · CAREER', ethics: true,
  desc: 'Turn skills into results: choose programs, hunt with a repeatable method, write reports that get paid, handle triage and duplicates, and stay motivated.',
  outcome: 'Run a full hunt on a practice target and write a professional report with clear steps, impact and remediation.',
  jobSkills: ['Vulnerability report writing', 'Working with triage teams', 'Self-directed methodology'],
  sourceUrl: 'https://www.intigriti.com/researchers/blog/hacking-tools/writing-effective-bug-bounty-reports', sourceLabel: 'Intigriti · Writing effective reports',
  example: 'Two hunters find the same IDOR. The one whose report has a clear title, exact steps, a redacted proof and the impact spelled out is triaged in minutes and paid; the vague one is marked "need more info".',
  exercise: 'Write a full vulnerability report for a bug you found in a lab, using the template in this module. Have a peer try to reproduce it from your report alone.',
  quiz: 'What most often decides whether a valid bug is paid quickly?',
  quizChoices: ['A clear report: title, exact steps, proof and impact', 'How rare the payload is', 'How many requests you sent'], answer: 0,
  lessons: [
    L('Choose the right programs',
      'Pick targets that fit your skill and give you the best chance of a first valid bug.',
      'Newer programs, wide scopes and less-polished assets have more undiscovered bugs than a mature program that thousands have already tested.',
String.raw`Beginner-friendly signals
- recently launched programs or newly added scope
- wide/wildcard scope with many assets
- VDPs (no pay) to build confidence and reputation first
- clear, generous policies and fast response times
Platforms: HackerOne, Bugcrowd, Intigriti, YesWeHack.
Match the target's tech to what you know (web, API, mobile).`,
      'Shortlist three programs that fit your current skills and say why each suits you.',
      'Why might a brand-new program be easier for a beginner than a famous one?',
      'Fewer researchers have tested it, so more straightforward bugs are still unfound.'),
    L('A repeatable hunting methodology',
      'Follow a consistent process so progress does not depend on luck or mood.',
      'Recon, then map features and roles, then test one vulnerability class across the whole app before moving on. A checklist reduces the effort of deciding what to do next.',
String.raw`A simple loop
1. Recon and update the scope/asset list
2. Map features and roles; pick ONE target area
3. Test one class at a time (access control, then injection, ...)
4. Log every interesting response immediately
5. Confirm, assess impact, write it up
6. End the session with the next single action written down
Depth on one area beats shallow passes over everything.`,
      'Run this loop for one session on a lab target and keep a session log.',
      'Why focus on one vulnerability class at a time instead of trying everything at once?',
      'It keeps attention and notes organised, so you test thoroughly and do not lose track of what you have covered.'),
    L('Judging impact and severity',
      'Rate findings realistically with CVSS and the program\'s own priorities.',
      'An IDOR exposing every user\'s personal data is high or critical; the same pattern exposing only public data may be low or informative.',
String.raw`Ask for each finding
- what can an attacker actually do, as which role?
- what data or function is exposed, and whose?
- is user interaction or a rare precondition needed?
Score with CVSS, but defer to the program's severity table and
examples. Overstating severity hurts your reputation with triage.`,
      'Score two of your lab findings with CVSS and compare them to a program\'s severity examples.',
      'Why does consistently overstating severity hurt you?',
      'Triagers lower it anyway and trust your future reports less; accurate ratings build a good reputation.'),
    L('Write a report that gets paid',
      'Use a clear structure so a triager can reproduce and rate the bug fast.',
      'The report leads with a precise title and the impact, then gives numbered steps anyone can follow, a redacted proof, and the fix.',
String.raw`Report template
Title:    <vuln type> in <feature> allows <impact> (<asset>)
Summary:  one or two sentences: what and why it matters
Steps to reproduce:
  1. Log in as test user A (email ...)
  2. Send: <exact request, method, path, body>
  3. Observe: <exact response proving the issue>
Impact:   who is affected and what an attacker gains
Proof:    redacted screenshot / request-response (minimal data)
Remediation: the specific fix (e.g. server-side ownership check)
Notes:    affected URLs, preconditions, CVSS vector`,
      'Write a report with this template for a lab bug and remove every ambiguous step.',
      'Why put exact requests and responses in the steps rather than a general description?',
      'Triagers reproduce from the report; exact detail lets them confirm it quickly without asking for more information.'),
    L('Triage, duplicates and communication',
      'Work professionally with triage teams and handle the common outcomes.',
      'Before submitting, you check the program\'s disclosed reports for the same issue. If marked duplicate or informative, you respond politely and move on.',
String.raw`Outcomes and how to handle them
Triaged/Accepted  answer questions quickly, stay professional
Need more info     add the exact missing step, do not argue
Duplicate          someone reported it first; it happens, move on
Informative/N/A    low or no impact; learn the program's bar
Reduce duplicates: search disclosed reports; report promptly;
be specific so near-misses are distinguished.
Never: be rude, threaten disclosure, or demand a bounty.`,
      'Read five disclosed reports on a platform and note what made each clear or unclear.',
      'What should you do if your report is closed as a duplicate?',
      'Accept it politely and move on; duplicates are normal. Reputation comes from professionalism as much as from findings.'),
    L('Disclosure, reputation and staying motivated',
      'Build a reputation over time and protect your wellbeing in a slow, competitive field.',
      'Early results are rare. Hunters who keep a learning log, publish allowed write-ups, and set small session goals last long enough to succeed.',
String.raw`Sustainable hunting
- expect a slow start; celebrate first valid bug, not first payout
- keep a log of what you learned each session, not just bugs found
- publish write-ups only with permission (coordinated disclosure)
- set small, time-boxed goals; take breaks; avoid burnout
- revisit a target after it ships new features
A VDP "thanks" and a clear write-up are real portfolio items.`,
      'Set three small weekly goals (e.g. "finish two Academy topics; one full report") and review them.',
      'Why can a disclosed, permission-granted write-up be as valuable to your career as a bounty?',
      'It is public proof of skill that employers and programs can read, which helps build reputation and open opportunities.'),
  ],
});

M.push({
  id: 'security-career', title: 'From hunter to a security career', cat: 'Security', code: 'SEC 10 · CAREER', ethics: true,
  desc: 'Turn bug bounty and lab work into a job: certifications, a portfolio, CTFs, Irish and remote roles, and the application path for security.',
  outcome: 'Build a security portfolio and a plan toward a junior security role or sustained bug bounty income.',
  jobSkills: ['Certifications (OSCP, CREST, PNPT, Security+)', 'Portfolio and write-ups', 'CTF experience'],
  sourceUrl: 'https://portswigger.net/web-security/certification', sourceLabel: 'PortSwigger · BSCP certification',
  example: 'A candidate applies to a Dublin junior penetration tester role with a GitHub of write-ups, a few disclosed bugs, the BSCP certificate and a Hack The Box profile: concrete proof instead of just a CV line.',
  exercise: 'Draft a 6-month plan: which certification to target, how many Academy topics and CTF boxes per month, and your first five programs. Put it in your notes.',
  quiz: 'Which qualification is most often named in Irish penetration-testing job posts?',
  quizChoices: ['OSCP', 'A PhD', 'A driving licence'], answer: 0,
  lessons: [
    L('The security career map',
      'See the roles bug bounty skills lead to and what each involves.',
      'Web skills transfer to application security, penetration testing, and bug bounty as a full-time or side income; each values hands-on proof.',
String.raw`Roles these skills open
- Bug bounty hunter (self-employed; income varies)
- Penetration tester / junior pentester (consultancy)
- Application security engineer (in-house, builds + breaks)
- Security analyst / SOC (detection and response)
- Red teamer (advanced, adversary simulation)
Ireland has pentest consultancies, big-tech security teams, finance,
and remote-first roles across the EU.`,
      'Pick the role that appeals most and list the three skills from this path it relies on.',
      'How does bug bounty experience help when applying for a penetration tester role?',
      'It is verifiable hands-on evidence of finding and reporting real vulnerabilities, which is exactly what the job requires.'),
    L('Certifications that matter',
      'Choose certifications by the role and by what Irish employers list.',
      'Irish junior pentest posts commonly accept OSCP (and CREST/OSWP); BSCP and PNPT are strong, hands-on web/pentest proofs; Security+ suits broader or defensive roles.',
String.raw`Practical, widely recognised
BSCP   PortSwigger web testing; pairs with the Academy
OSCP   hands-on network/host pentest; named in many IE posts
PNPT   practical pentest with a report and debrief
CREST  recognised across UK/IE consultancies
Security+  vendor-neutral fundamentals (defensive/broad roles)
Start with free study (Academy, TryHackMe) and a lab before paying
for an exam.`,
      'Match each certification above to a role from the previous lesson.',
      'Why do employers value a practical exam like OSCP or BSCP over a multiple-choice one?',
      'It proves you can actually find and exploit issues under time pressure, not just recall facts.'),
    L('Build a security portfolio',
      'Show, do not tell: write-ups, tools, CTF profiles and disclosed reports.',
      'A tidy GitHub with lab write-ups and a small tool, plus a Hack The Box or TryHackMe profile, gives a recruiter concrete evidence.',
String.raw`Portfolio pieces (only what you are allowed to publish)
- write-ups of retired CTF boxes and Academy topics
- disclosed bug reports (with program permission)
- a small tool or script you built (well-documented)
- a blog explaining a vulnerability class clearly
- CTF/platform profiles (HTB, TryHackMe, platform reputation)
Keep everything legal and within disclosure rules.`,
      'Publish one lab write-up (using only material you are permitted to share) and link it from your CV.',
      'Why only publish write-ups you have permission to share?',
      'Disclosing details of a real target without permission breaks coordinated disclosure and can be illegal; retired labs and your own systems are always safe to write about.'),
    L('CTFs and continuous practice',
      'Use capture-the-flag events and platforms to keep skills sharp and meet the community.',
      'CTFs are legal, built to be hacked, and cover web, crypto, reversing and more. Regular practice keeps you current with new techniques.',
String.raw`Where to practise (all legal)
- picoCTF (beginner), CTFtime for live events
- Hack The Box, TryHackMe (guided + challenge boxes)
- PortSwigger Web Security Academy (free, web-focused)
Join a community (local OWASP chapter, Discords) to learn faster
and hear about opportunities.`,
      'Enter one beginner CTF or finish one TryHackMe path this month and write up what you learned.',
      'Why are CTF platforms a safe place to try advanced techniques?',
      'They are deliberately built and authorised for attack, so anything within the platform is legal to test.'),
    L('Apply for security roles in Ireland',
      'Present bug bounty and lab work effectively in applications.',
      'A Dublin junior pentest post may ask for 1–2 years of practical experience or equivalent hands-on work; a portfolio of labs, CTFs and disclosed bugs can stand in for a first job.',
String.raw`CV bullet (what + how + proof)
"Reported 4 valid web vulnerabilities (IDOR, stored XSS) across public
 bug bounty programs; BSCP certified; write-ups and tooling on GitHub;
 top 5% on TryHackMe."
Where to look
- gradireland, LinkedIn, IrishJobs.ie; Irish consultancies
  (e.g. security firms) and big-tech security teams in Dublin
- remote EU roles; ask about reasonable accommodations in assessments`,
      'Write one security CV bullet using your real lab and (if any) disclosed results.',
      'How can you show readiness for a junior role without previous employment in security?',
      'With a portfolio: disclosed bugs, CTF rankings, write-ups, a certification and a documented home lab all demonstrate hands-on ability.'),
    L('Ethics, wellbeing and the long game',
      'Stay legal, avoid burnout, and keep growing across a long career.',
      'The field rewards patience and integrity. Staying strictly within scope and law, and pacing yourself, is what makes a career sustainable.',
String.raw`Lasting principles
- only ever test what you are authorised to test
- report honestly; never sit on or sell a serious bug
- pace yourself: time-box sessions, take breaks, track small wins
- keep learning: one new technique or write-up a week
- help others: mentoring and sharing build reputation and community
Your reputation for being skilled AND trustworthy is your real asset.`,
      'Write your own one-paragraph code of conduct for security work and keep it in your notes.',
      'Why is a reputation for trustworthiness as important as technical skill in this field?',
      'Companies grant access and pay based on trust; one unethical act can end a career, while a trusted researcher is given more scope and opportunities.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
