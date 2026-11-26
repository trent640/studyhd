/* Further reading from W3Schools and freeCodeCamp, attached to modules by id.
   Every link here was checked to exist (November 2026). Format: [url, title, source]. */
(function (M) {
  const W = 'W3Schools', F = 'freeCodeCamp';
  const w3 = (path, title) => ['https://www.w3schools.com/' + path, title, W];
  const fcc = (path, title) => ['https://www.freecodecamp.org/' + path, title, F];
  const refs = {
    'java-fundamentals': [w3('java/', 'Java Tutorial')],
    oop: [w3('java/java_encapsulation.asp', 'Java Encapsulation'), w3('java/java_inheritance.asp', 'Java Inheritance'), w3('java/java_polymorphism.asp', 'Java Polymorphism'), w3('java/java_interface.asp', 'Java Interface'), w3('java/java_abstract.asp', 'Java Abstraction')],
    'data-structures': [w3('dsa/', 'DSA Tutorial'), fcc('learn/javascript-algorithms-and-data-structures-v8/', 'JavaScript Algorithms and Data Structures')],
    algorithms: [w3('dsa/', 'DSA Tutorial'), fcc('learn/javascript-algorithms-and-data-structures-v8/', 'JavaScript Algorithms and Data Structures')],
    'coding-assessments': [w3('java/java_interview_questions.asp', 'Java Interview Questions')],
    git: [w3('git/git_intro.asp', 'Introduction to Git and GitHub'), w3('git/git_branch_merge.asp', 'Git Branch Merge'), w3('git/git_github_flow.asp', 'Git GitHub Flow')],
    'software-engineering': [w3('git/git_github_flow.asp', 'Git GitHub Flow')],
    databases: [w3('sql/sql_join_inner.asp', 'SQL INNER JOIN'), w3('sql/sql_parameterized_queries.asp', 'SQL Parameters (Parameterized Queries)'), fcc('news/freecodecamps-new-relational-databases-certification-is-now-live/', 'Relational Databases Certification')],
    mysql: [w3('mysql/mysql_join.asp', 'MySQL Joins'), w3('mysql/mysql_join_left.asp', 'MySQL LEFT JOIN'), w3('mysql/mysql_prepared_statements.asp', 'MySQL Prepared Statements'), w3('mysql/mysql_injection.asp', 'MySQL SQL Injection')],
    'db-management': [w3('sql/sql_prepared_statements.asp', 'SQL Prepared Statements')],
    'web-development': [w3('htmlcss/htmlcss_forms_validation.asp', 'HTML & CSS Forms and Validation'), w3('css/css3_flexbox.asp', 'CSS Flexbox'), w3('css/css_grid.asp', 'CSS Grid Layout'), w3('html/html_layout.asp', 'HTML Layout Elements'), fcc('news/freecodecamps-new-responsive-web-design-certification-is-now-live/', 'Responsive Web Design Certification')],
    'web-patterns': [w3('html/html_layout.asp', 'HTML Layout Elements and Techniques'), fcc('learn/back-end-development-and-apis-v9/', 'Back-End Development and APIs')],
    'frontend-react': [w3('react/react_hooks.asp', 'React Hooks'), w3('react/react_usereducer.asp', 'React useReducer Hook'), w3('css/css3_flexbox.asp', 'CSS Flexbox'), fcc('learn/front-end-development-libraries-v9/', 'Front-End Development Libraries (React, TypeScript)')],
    typescript: [w3('typescript/', 'TypeScript Tutorial'), w3('typescript/typescript_react.php', 'TypeScript with React'), fcc('learn/front-end-development-libraries-v9/', 'Front-End Development Libraries (React, TypeScript)')],
    'rest-apis': [fcc('learn/back-end-development-and-apis-v9/', 'Back-End Development and APIs (Node.js; same API concepts)')],
    'backend-spring': [w3('java/', 'Java Tutorial'), fcc('learn/back-end-development-and-apis-v9/', 'Back-End Development and APIs (Node.js; same API concepts)')],
    python: [w3('python/', 'Python Tutorial')],
    'data-analysis': [w3('python/pandas/default.asp', 'Pandas Tutorial'), w3('python/', 'Python Tutorial')],
    'more-languages': [w3('cs/cs_intro.php', 'Introduction to C#'), w3('go/', 'Go Tutorial'), w3('kotlin/kotlin_intro.php', 'Kotlin Introduction')],
    security: [w3('sql/sql_injection.asp', 'SQL Injection'), w3('cybersecurity/cybersecurity_web_applications_attacks.php', 'Web Application Attacks')],
    'hacking-ethics': [w3('cybersecurity/index.php', 'Cyber Security Tutorial')],
    'security-principles': [w3('cybersecurity/index.php', 'Cyber Security Tutorial')],
    'networking-security': [w3('cybersecurity/index.php', 'Cyber Security Tutorial (Networking Basics)')],
    'web-vulns-injection': [w3('sql/sql_injection.asp', 'SQL Injection'), w3('cybersecurity/cybersecurity_web_applications_attacks.php', 'Web Application Attacks')],
    'web-vulns-access': [w3('cybersecurity/cybersecurity_web_applications_attacks.php', 'Web Application Attacks')],
    'teamwork-career': [fcc('learn/full-stack-developer-v9/', 'Certified Full-Stack Developer Curriculum')],
  };
  for (const [id, list] of Object.entries(refs)) {
    const m = M.find((x) => x.id === id);
    if (m) m.refs = list;
  }
})(window.SD_MODULES);
