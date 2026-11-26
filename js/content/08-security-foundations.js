/* Security path, part 1: ethics and law, principles, networking, tooling. */
(function (M, L) {

M.push({
  id: 'hacking-ethics', title: 'Ethics, law and rules of engagement', cat: 'Security', code: 'SEC 01 · FOUNDATIONS', ethics: true,
  desc: 'Learn what makes hacking ethical and legal: authorisation, scope, safe harbour, disclosure and handling data, under Irish and EU law.',
  outcome: 'Decide whether a test is allowed, stay inside scope, and set up a safe lab where you can practise anything.',
  jobSkills: ['Professional ethics and rules of engagement', 'Coordinated vulnerability disclosure', 'Home lab experience (named in junior pentest posts)'],
  sourceUrl: 'https://www.ncsc.gov.ie/pdfs/National-CVD-Guidelines-v1.pdf', sourceLabel: 'NCSC Ireland · CVD guidelines',
  example: 'A hunter notices a bug in their bank\'s app while paying a bill. The bank has no disclosure policy, so they do not test further; they report what they saw through the NCSC\'s coordination service.',
  exercise: 'Read the full policy of one public bug bounty program. Write down: what is in scope, what is out of scope, which tests are banned, and what to do if you find personal data.',
  quiz: 'When is it legal to test a website for vulnerabilities?',
  quizChoices: ['When you own it or have explicit permission, and only within the agreed scope', 'Whenever you do not cause any damage', 'Whenever the site is publicly accessible'], answer: 0,
  lessons: [
    L('What ethical hacking is',
      'Understand the difference between ethical hacking, penetration testing, red teaming and bug bounty hunting.',
      'A penetration tester is hired to test a client\'s app for two weeks under a contract. A bug bounty hunter tests any program that publicly invites testing and is paid per valid bug. Both are ethical because they have permission.',
String.raw`Activity              Permission comes from       Paid for
Penetration test      contract + scope document   time (days)
Red team exercise     contract with leadership    time
Bug bounty program    public program policy       each valid bug
Vulnerability         published disclosure        usually thanks,
disclosure (VDP)      policy                      sometimes swag
CTF / lab             the lab is built to be hacked  learning`,
      'Write one sentence for each activity above explaining who gives permission.',
      'What single thing turns "hacking" into "ethical hacking"?',
      'Permission. Ethical hackers only test systems they own or are explicitly authorised to test, and they stay within the agreed scope.'),
    L('The law in Ireland and the EU',
      'Know which Irish offences apply to unauthorised testing and why "I meant well" is not a defence.',
      'Ireland\'s Criminal Justice (Offences Relating to Information Systems) Act 2017 implements EU Directive 2013/40/EU. Section 2 makes it an offence to intentionally access an information system, or part of one, without lawful authority or reasonable excuse.',
String.raw`Criminal Justice (Offences Relating to Information Systems) Act 2017
s.2  accessing an information system without lawful authority
s.3  interfering with an information system (e.g. denial of service)
s.4  interfering with data without lawful authority
s.5  intercepting transmissions
s.6  using tools (software, passwords) to commit these offences
s.8  penalties: s.2 up to 12 months on summary conviction,
     up to 5 years on indictment

Other countries have similar laws: UK Computer Misuse Act 1990,
US Computer Fraud and Abuse Act.`,
      'Read sections 1–8 of the Act on irishstatutebook.ie and summarise each in one plain sentence.',
      'A published bug bounty policy says "we will not take legal action for good-faith research within scope". Does that cover testing a subdomain listed as out of scope?',
      'No. Safe harbour only covers testing within the published scope and rules. Out-of-scope testing is unauthorised access. This is not legal advice; when unsure, ask the program first.'),
    L('Scope and rules of engagement',
      'Read a program policy carefully: in-scope assets, out-of-scope assets, banned techniques and testing rules.',
      'A policy lists *.example.ie in scope, but excludes status.example.ie (a third-party service) and bans denial of service, social engineering and automated scanning above 5 requests per second.',
String.raw`Checklist before you send a single request
[ ] Asset is listed in scope (domain, app, API, mobile app)
[ ] Asset is not listed as out of scope or owned by a third party
[ ] Technique is allowed (no DoS, no phishing, no physical)
[ ] Rate limits respected; scanners configured to match
[ ] Use only your own test accounts (and the program's test accounts)
[ ] Required header or username format added (e.g. X-Bug-Bounty: yourname)
[ ] You know what to do if you reach personal data`,
      'Turn this checklist into a template in your notes and fill it in for one real program.',
      'You find that an in-scope site loads scripts from a third-party CDN with a vulnerability. Can you test the CDN?',
      'No, not unless the CDN itself is in scope or runs its own program. Report the risk to the in-scope target only if the policy allows that kind of finding, without attacking the third party.'),
    L('Coordinated vulnerability disclosure',
      'Report vulnerabilities privately, give the owner time to fix them, and publish only with permission.',
      'Ireland\'s NCSC publishes national CVD guidelines and runs its own CVD programme. It acknowledges reports within 3 business days and asks researchers not to disclose until a fix is deployed and it gives permission.',
String.raw`Coordinated disclosure timeline (typical)
Day 0     You report privately (program, security.txt or NCSC)
Day 1–3   Owner acknowledges
Day 3–90  Owner fixes; you answer questions; no public details
Fix live  You may ask to publish a write-up
Stuck?    In Ireland, the NCSC can act as a neutral coordinator

Find a contact:  https://example.ie/.well-known/security.txt`,
      'Check three Irish organisations\' websites for /.well-known/security.txt. Note which have one.',
      'What should you do if an organisation has no bug bounty or disclosure policy and you accidentally notice a serious flaw?',
      'Stop testing, do not try to confirm it further, and report what you observed through a coordinator such as the NCSC, which can contact the owner neutrally.'),
    L('Handling data and staying safe',
      'Follow the "stop rule": minimise access to personal data, never keep it, and protect your own setup.',
      'While testing an IDOR, a hunter sees another customer\'s address. They stop, record only the minimum proof (the request and a redacted screenshot), report immediately and delete any local copies.',
String.raw`If you reach personal, financial or health data
1. Stop: do not access more records than needed to prove the issue
2. Prove with the minimum: one record, redacted
3. Report immediately, flag it as urgent
4. Delete local copies securely after reporting
5. Never download databases, pivot further, or share data

Protect yourself
- Separate browser profile and test accounts for hacking
- Password manager and MFA on platform accounts
- Keep reports and notes encrypted`,
      'Create a dedicated browser profile and test email address for security work.',
      'Why prove impact with one redacted record instead of dumping the database?',
      'It proves the vulnerability while harming as few people as possible, respects GDPR, and keeps you within almost every program\'s rules. Mass data access can turn a reward into a legal problem.'),
    L('Build a safe hacking lab',
      'Run deliberately vulnerable apps on your own machine so you can practise any technique legally.',
      'OWASP Juice Shop and DVWA run in Docker on localhost. PortSwigger\'s Web Security Academy hosts free labs online that you are allowed to attack.',
String.raw`# Run OWASP Juice Shop locally (only reachable from your machine)
docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop

# Run DVWA locally
docker run --rm -p 127.0.0.1:8080:80 vulnerables/web-dvwa

Legal practice platforms
- PortSwigger Web Security Academy  (free web labs)
- OWASP Juice Shop, DVWA            (local)
- TryHackMe, Hack The Box           (guided and CTF labs)
- picoCTF                           (beginner CTFs)`,
      'Start Juice Shop and find its score board page. Keep a lab journal of every challenge you solve.',
      'Why bind the lab to 127.0.0.1 instead of 0.0.0.0?',
      'So the vulnerable app is only reachable from your own machine. Binding to all interfaces could expose it to others on your network.'),
  ],
});

M.push({
  id: 'security-principles', title: 'Security principles and threat modelling', cat: 'Security', code: 'SEC 02 · FOUNDATIONS', ethics: true,
  desc: 'Think like an attacker and a defender: the CIA triad, threat models, attack surface, defence in depth, vulnerability databases and cryptography basics.',
  outcome: 'Threat-model a small app, name the likely attacks, and explain hashing, encryption and encoding correctly.',
  jobSkills: ['Threat modelling', 'Understanding of CVE, CWE and CVSS', 'Security fundamentals'],
  sourceUrl: 'https://owasp.org/www-community/Threat_Modeling', sourceLabel: 'OWASP · Threat modelling',
  example: 'Before testing a food-delivery app, a hunter lists its assets (payments, addresses, driver locations), entry points (web, mobile API, partner API) and trust boundaries. That map tells them where bugs pay most.',
  exercise: 'Threat-model your Task Tracker API with STRIDE. List at least one threat for each letter and the control that stops it.',
  quiz: 'Base64 is a form of…',
  quizChoices: ['Encoding: anyone can reverse it, no key needed', 'Encryption: it needs a key to reverse', 'Hashing: it cannot be reversed'], answer: 0,
  lessons: [
    L('Confidentiality, integrity and availability',
      'Classify any security problem by what it breaks: confidentiality, integrity or availability.',
      'Reading someone else\'s invoices breaks confidentiality; changing an order price breaks integrity; crashing the checkout breaks availability.',
String.raw`C  Confidentiality   only the right people can read data
I  Integrity         data and actions cannot be changed improperly
A  Availability      the system works when needed

Plus
Authentication   who are you?
Authorisation    what may you do?
Accountability   can we trace who did what? (logs)`,
      'Take five vulnerabilities from the OWASP Top 10 and say which CIA property each breaks.',
      'Why is denial of service usually banned in bug bounty programs even though it is a real availability problem?',
      'Testing it harms real users and the business. Programs ban it so researchers do not cause outages; the risk is handled by other means.'),
    L('Threat modelling with STRIDE',
      'Systematically list threats to each part of a system before testing or building it.',
      'For a login endpoint: Spoofing (credential stuffing), Tampering (changing the user ID in a token), Repudiation (no audit log), Information disclosure (user enumeration), DoS (no rate limit), Elevation of privilege (role in a client-side cookie).',
String.raw`S  Spoofing                  pretending to be someone else
T  Tampering                 modifying data or requests
R  Repudiation               denying an action (missing logs)
I  Information disclosure    leaking data
D  Denial of service         making it unavailable
E  Elevation of privilege    gaining rights you should not have

Steps: draw the data flow -> mark trust boundaries -> apply STRIDE
to each element -> rank by impact and likelihood`,
      'Draw a data-flow diagram of a web shop (browser, API, database, payment provider) and mark the trust boundaries.',
      'What is a trust boundary?',
      'A point where data passes between parts with different trust levels, such as from the browser to the server. Input crossing it must be validated.'),
    L('Attack surface',
      'Identify everything an attacker can reach: endpoints, parameters, files, roles and integrations.',
      'A "simple" profile page has an attack surface of the GET and PUT endpoints, every field, the avatar upload, the export-to-PDF feature and the admin view of profiles.',
String.raw`Attack surface checklist for a feature
- Endpoints and HTTP methods (including hidden or old ones)
- Every parameter: path, query, body, headers, cookies
- File uploads and downloads
- Roles: anonymous, user, admin, other tenant
- Integrations: webhooks, OAuth, payment, email, PDF generators
- Client code: JavaScript bundles, mobile apps`,
      'Map the attack surface of one feature in Juice Shop using your browser\'s Network tab.',
      'Why do features like "export to PDF" or "import from URL" often hide serious bugs?',
      'They make the server process attacker-controlled content or fetch attacker-chosen URLs, which can lead to SSRF, file disclosure or injection, and they get less testing than core features.'),
    L('Defence in depth and least privilege',
      'Know the defensive principles so you can explain impact and suggest good fixes in reports.',
      'An XSS bug is less damaging when the session cookie is HttpOnly and a Content-Security-Policy blocks inline scripts: layers of defence limit impact.',
String.raw`Principles to cite in your remediation advice
Least privilege        give each user/service only what it needs
Defence in depth       several independent layers of protection
Secure defaults        safe out of the box
Fail securely          errors deny access, never grant it
Validate input, encode output
Don't trust the client every check must also happen on the server`,
      'For each principle, find one example in an application you use.',
      'A bug is only exploitable because the client hides an admin button. Which principle was violated?',
      'Don\'t trust the client: authorisation must be enforced on the server, not by hiding UI elements.'),
    L('CVE, CWE and CVSS',
      'Use the standard vocabulary for vulnerabilities and score severity.',
      'CVE-2021-44228 (Log4Shell) is an instance of CWE-917 (expression language injection) and was scored CVSS 10.0.',
String.raw`CVE   a specific vulnerability in a specific product (CVE-2021-44228)
CWE   a category of weakness (CWE-79 = cross-site scripting)
CVSS  severity score 0.0–10.0 from a vector string

CVSS v3.1 vector example (stored XSS, low-priv user, affects others)
CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N  -> 5.4 Medium

AV attack vector  AC complexity  PR privileges  UI user interaction
S scope  C/I/A impact`,
      'Use the FIRST CVSS calculator to score an IDOR that lets any user read every other user\'s invoices.',
      'What is the difference between a CVE and a CWE?',
      'A CVE identifies one specific vulnerability in a product; a CWE names the general type of weakness that many CVEs share.'),
    L('Cryptography essentials',
      'Tell encoding, hashing and encryption apart, and recognise common crypto mistakes.',
      'A token that looks random is just Base64 of {"user":42}. Decoding it and changing the number would be a serious bug if the server trusts it without a signature.',
String.raw`Encoding    reversible, no key      Base64, URL encoding, hex
Hashing     one-way, fixed length   SHA-256 (integrity), bcrypt/argon2 (passwords)
Encryption  reversible with a key   AES (symmetric), RSA (asymmetric)
Signing     proves who made it      HMAC, RSA/ECDSA signatures (JWT)

Red flags in tests
- "encrypted" values that are just Base64
- MD5/SHA-1 for passwords, or no salt
- secrets or keys in JavaScript bundles
- tokens that are predictable (incrementing, timestamps)`,
      'Decode three cookies or tokens from your lab apps with CyberChef and identify which are encoded, signed or encrypted.',
      'Why is a fast hash like SHA-256 a bad choice for storing passwords?',
      'Attackers can compute billions of guesses per second. Slow, salted algorithms like bcrypt or Argon2 make offline guessing far more expensive.'),
  ],
});

M.push({
  id: 'networking-security', title: 'Networking for security', cat: 'Security', code: 'SEC 03 · FOUNDATIONS', ethics: true,
  desc: 'Understand how data moves: TCP/IP, ports, DNS, HTTP and TLS, then observe and scan your own lab with Wireshark and Nmap.',
  outcome: 'Read raw HTTP requests, explain DNS and TLS, and scan your lab network safely with Nmap.',
  jobSkills: ['Networking fundamentals', 'Hands-on experience with Nmap and Wireshark (junior pentest posts)'],
  sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', sourceLabel: 'MDN · HTTP',
  example: 'A hunter notices a subdomain CNAME pointing to a deleted cloud bucket. Knowing how DNS works lets them recognise a subdomain takeover risk and report it.',
  exercise: 'Capture your own browser\'s traffic to your lab app with Wireshark, then explain the DNS lookup, TCP handshake and HTTP request you see.',
  quiz: 'Which port does HTTPS use by default?',
  quizChoices: ['443', '80', '22'], answer: 0,
  lessons: [
    L('Layers, IP addresses and ports',
      'Know the TCP/IP layers and how IP addresses and ports identify services.',
      'An address like 203.0.113.10:443 means "the service listening on port 443 at that IP", usually a web server using TLS.',
String.raw`Layer         Examples
Application   HTTP, DNS, SSH, SMTP
Transport     TCP (reliable), UDP (fast, no guarantee)
Internet      IP addresses, routing
Link          Ethernet, Wi-Fi

Common ports
21 FTP   22 SSH   25 SMTP   53 DNS   80 HTTP   443 HTTPS
3306 MySQL   5432 PostgreSQL   6379 Redis   8080 alt HTTP`,
      'List the open ports on your own computer with "ss -tulpn" (Linux) or "netstat -an".',
      'Why is an exposed database port like 6379 (Redis) on the internet a serious finding?',
      'Databases are meant to be private. Exposed ones may allow unauthenticated access to data or even code execution.'),
    L('DNS for hunters',
      'Understand record types and how DNS misconfigurations become vulnerabilities.',
      'shop.example.ie has a CNAME to example-shop.someplatform.app, but the platform account was deleted. Whoever claims that name controls the subdomain: a subdomain takeover.',
String.raw`dig example.ie A          # IPv4 address
dig example.ie AAAA       # IPv6 address
dig example.ie MX         # mail servers
dig example.ie TXT        # SPF, verification records
dig www.example.ie CNAME  # alias to another name
dig example.ie NS         # authoritative name servers`,
      'Use dig on your own domain or a well-known domain and explain every record type you get back.',
      'What makes a dangling CNAME dangerous?',
      'It points to a resource that no longer exists. If an attacker can register that resource, they serve content on the victim\'s subdomain and may steal cookies or phish users.'),
    L('HTTP in depth',
      'Read and write raw HTTP requests and responses, including headers, cookies and status codes.',
      'In a proxy, every click becomes a raw request you can inspect, change and resend.',
String.raw`POST /api/orders HTTP/1.1
Host: shop.example.ie
Cookie: session=8f3a...; theme=dark
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"productId": 17, "quantity": 2, "price": 19.99}

HTTP/1.1 201 Created
Set-Cookie: cart=...; HttpOnly; Secure; SameSite=Lax
Content-Type: application/json

{"orderId": 5531, "total": 39.98}`,
      'Spot the parameter in this request that the server should never trust. How would you test it in your lab?',
      'Why should the server ignore a price sent by the client?',
      'The client is fully controlled by the user. Prices must come from the server\'s own data, otherwise a user can change the price in the request.'),
    L('TLS and certificates',
      'Understand what TLS protects, and how certificates reveal infrastructure.',
      'Certificate transparency logs (crt.sh) list every certificate issued for a domain, which often reveals subdomains such as staging or internal tools.',
String.raw`TLS gives
- Encryption: others on the network cannot read traffic
- Integrity: traffic cannot be changed in transit
- Server authentication: the certificate proves the domain

openssl s_client -connect example.ie:443 -servername example.ie
# Shows the certificate chain, issuer, validity and SANs

Certificate transparency search: https://crt.sh/?q=%25.example.ie`,
      'Look up your college or a large Irish company on crt.sh and count the distinct subdomains in its certificates.',
      'Does HTTPS mean a website is safe from XSS or SQL injection?',
      'No. TLS protects data in transit; it does nothing about vulnerabilities in the application itself.'),
    L('Observing traffic with Wireshark',
      'Capture and filter packets on your own machine to understand protocols.',
      'Filtering a capture with "http" or "dns" shows the conversation between your browser and the lab app step by step.',
String.raw`Useful Wireshark display filters
dns                          DNS queries and answers
tcp.flags.syn == 1           connection starts (handshakes)
http                         plain HTTP (lab only)
http.request.method == "POST"
ip.addr == 127.0.0.1
tls.handshake.type == 1      TLS Client Hello (see SNI)

Only capture on networks and devices you own or are allowed to monitor.`,
      'Capture a login to your local DVWA over plain HTTP and find the password in the capture. Why does this show the need for HTTPS?',
      'Why is capturing traffic on a shared café Wi-Fi network not acceptable practice?',
      'Intercepting other people\'s communications without authorisation is an offence (section 5 of the 2017 Act) and an invasion of privacy.'),
    L('Scanning your lab with Nmap',
      'Discover hosts, open ports and service versions on networks you are authorised to scan.',
      'Scanning the Docker lab shows which services are exposed and their versions, the first step of any infrastructure test.',
String.raw`# Only scan hosts you own or are explicitly allowed to scan
nmap -sV 127.0.0.1                 # versions of open ports on localhost
nmap -sV -p 1-10000 192.168.56.10  # your lab VM
nmap -sC -sV -oN lab-scan.txt 192.168.56.10   # default scripts, save output

-sV  detect service versions
-sC  run safe default scripts
-oN  save normal output to a file`,
      'Scan your lab VM, then research one discovered service version for known CVEs.',
      'Most bug bounty programs restrict or ban port scanning. Why?',
      'Large scans create noise and load, can trigger alarms and may touch infrastructure that is out of scope or owned by third parties.'),
  ],
});

M.push({
  id: 'security-tooling', title: 'Linux, scripting and Burp Suite', cat: 'Security', code: 'SEC 04 · FOUNDATIONS', ethics: true,
  desc: 'Set up the hunter\'s toolkit: Linux, Bash and Python for automation, Burp Suite as your proxy, browser devtools and an evidence-first note system.',
  outcome: 'Intercept, modify and replay requests with Burp, automate small tasks with Python, and keep organised evidence.',
  jobSkills: ['Burp Suite', 'Scripting in Python, Bash or PowerShell (pentest posts)', 'Linux'],
  sourceUrl: 'https://portswigger.net/burp/documentation/desktop/getting-started', sourceLabel: 'PortSwigger · Burp Suite docs',
  example: 'A hunter proxies a shopping app through Burp, sends the checkout request to Repeater, changes the quantity to -1, and sees the total go negative: a business logic bug found in minutes.',
  exercise: 'Configure Burp Suite Community with a separate browser, intercept a request to Juice Shop, modify it in Repeater, and save the request and response as evidence.',
  quiz: 'What does Burp Repeater let you do?',
  quizChoices: ['Edit and resend a single request as many times as you like', 'Scan the whole internet', 'Crack password hashes'], answer: 0,
  lessons: [
    L('Linux for security work',
      'Use Linux comfortably: files, users, permissions, processes and logs.',
      'Most targets and tools run on Linux. Reading permissions explains why a misconfigured file can be read by the wrong user.',
String.raw`id; whoami                  # who am I, which groups?
ls -l /etc/passwd /etc/shadow
# -rw-r--r-- root root /etc/passwd   (world-readable, no hashes)
# -rw-r----- root shadow /etc/shadow (password hashes, protected)
find / -perm -4000 -type f 2>/dev/null   # SUID programs (lab audit)
sudo -l                     # what may I run as root?
journalctl -u nginx --since today        # service logs`,
      'In a lab VM, list SUID programs and look one up on GTFOBins to understand why misconfigured SUID binaries are risky.',
      'Why are password hashes stored in /etc/shadow instead of /etc/passwd?',
      '/etc/passwd must be readable by everyone for normal operation. Moving hashes to a root-only file stops ordinary users from copying and cracking them.'),
    L('Bash for handling recon data',
      'Filter, sort and combine large text outputs quickly.',
      'Recon produces thousands of URLs. A few piped commands reduce them to unique, in-scope, interesting ones.',
String.raw`sort -u urls.txt > unique.txt                       # de-duplicate
grep -E '\.(js)(\?|$)' unique.txt > js-files.txt     # JavaScript files
grep -E '[?&](id|user|account|order)=' unique.txt    # interesting params
grep -vf out-of-scope.txt unique.txt > in-scope.txt  # drop excluded hosts
cut -d/ -f3 in-scope.txt | sort | uniq -c | sort -rn | head   # top hosts
wc -l in-scope.txt`,
      'Take a list of URLs from your lab crawl and extract every unique parameter name.',
      'Why filter out out-of-scope hosts before running any tool?',
      'So no tool ever sends traffic to systems you are not authorised to test, even by accident.'),
    L('Python for security testing',
      'Write small, polite scripts with requests to test ideas in your lab.',
      'A script checks whether order IDs 1–20 return data for the logged-in test user, an automated IDOR check against your own lab.',
String.raw`import time
import requests

BASE = "http://127.0.0.1:3000"     # your lab only
session = requests.Session()
session.headers["Authorization"] = "Bearer <your test user token>"

for order_id in range(1, 21):
    r = session.get(f"{BASE}/rest/basket/{order_id}", timeout=10)
    print(order_id, r.status_code, len(r.content))
    time.sleep(0.5)                 # stay polite: respect rate limits`,
      'Extend the script to flag responses whose owner is not your test user.',
      'Why add a delay and a timeout to testing scripts?',
      'The delay keeps you under rate limits and avoids harming the service; the timeout stops the script hanging on a slow response.'),
    L('Burp Suite: proxy and history',
      'Route a browser through Burp and use the HTTP history as your map of the app.',
      'Burp\'s built-in Chromium browser is already configured. Every request appears in Proxy › HTTP history, where you can filter and annotate.',
String.raw`Setup (Burp Suite Community)
1. Proxy › Intercept › Open browser   (pre-configured Chromium)
2. Target › Scope: add only in-scope hosts
3. Proxy › HTTP history › Filter: "Show only in-scope items"
4. Browse every feature as each test user
5. Highlight and comment interesting requests

Shortcuts: Ctrl+R send to Repeater, Ctrl+I send to Intruder`,
      'Browse all of Juice Shop with Burp running and highlight the five requests you think are most interesting.',
      'Why set a target scope in Burp?',
      'It hides out-of-scope noise and helps prevent you accidentally sending tests to hosts you are not allowed to test.'),
    L('Burp Repeater and Intruder',
      'Modify and resend requests by hand, and run small, rate-limited parameter tests.',
      'Repeater is for careful manual testing of one request. Intruder sends many variations; in Community edition it is throttled, which is a good reminder to stay gentle.',
String.raw`Repeater workflow
- Change one thing at a time (ID, role, method, header)
- Compare responses: status, length, content
- Name tabs clearly: "IDOR order 5531 as user B"

Intruder (lab or programs that allow it)
- Mark one position: /api/orders/§5531§
- Payload: numbers 5520–5540
- Resource pool: 1–2 concurrent requests, delay 500 ms`,
      'In PortSwigger\'s free access-control labs, use Repeater to solve one lab without Intruder.',
      'What is the risk of running Intruder at full speed against a live program?',
      'It may break rate limits or the program\'s rules, cause outages for real users, get your IP blocked and get you removed from the program.'),
    L('Browser devtools for hunters',
      'Use the browser\'s built-in tools to inspect the DOM, storage, JavaScript and network.',
      'Searching the Sources panel for "api/" in minified JavaScript often reveals endpoints the UI never shows.',
String.raw`Elements   inspect hidden inputs and disabled buttons
Console    run JS in the page context (lab), read errors
Sources    search all JS files (Ctrl+Shift+F) for "api", "admin", "key"
Network    filter Fetch/XHR, copy as cURL, see timings
Application cookies (HttpOnly? Secure?), localStorage tokens,
           service workers`,
      'Find three API endpoints in Juice Shop\'s JavaScript that you have not reached through the UI.',
      'A token is stored in localStorage instead of an HttpOnly cookie. Why does that matter if the site has an XSS bug?',
      'JavaScript can read localStorage, so XSS could steal the token directly. HttpOnly cookies cannot be read by scripts.'),
    L('Notes and evidence',
      'Keep notes that make reports fast and reproducible, and suit how you work.',
      'Each target gets a folder: scope, recon output, interesting requests, and one file per potential bug with exact steps. Small checklists reduce the mental load of remembering where you were.',
String.raw`target-example/
  00-scope.md          in/out of scope, rules, rate limits
  01-recon/            subdomains.txt, urls.txt, js-endpoints.txt
  02-map.md            features, roles, interesting parameters
  bugs/
    2026-03-02-idor-invoices.md   steps, requests, responses, impact
  session-log.md       date, what I tested, where to resume next time

Tip: end every session by writing the next single action
("Resume: test PUT /api/invoices/{id} as user B").`,
      'Create this structure for your lab and use it for one full session.',
      'Why write down the next action at the end of each session?',
      'It makes restarting easy and lowers the effort to get going again, which helps with focus and avoids repeating work.'),
  ],
});

})(window.SD_MODULES, window.SD_LESSON);
