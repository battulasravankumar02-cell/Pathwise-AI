/**
 * PathWise AI — Demo Data
 * Fictional student profile and realistic demo data
 * All data is clearly sample/demo data
 */

export const DEMO_STUDENT = {
  id: 'demo-student-001',
  email: 'demo@studypulse.ai',
  name: 'Alex Chen',
  course: 'B.Tech',
  stream: 'Artificial Intelligence & Data Science',
  college: 'Chennai Institute of Technology',
  year: '2nd Year',
  semester: '3rd Semester',
  graduationYear: 2027,
  profileComplete: true,
  onboardingComplete: true,
  createdAt: '2024-06-01T00:00:00Z',
};

export const DEMO_CAREER_GOAL = {
  hasGoal: true,
  jobRole: 'Software Engineer',
  specialization: 'Backend Development',
  country: 'Germany',
  industry: 'Tech / Product Companies',
};

export const DEMO_SUBJECTS = [
  {
    id: 'sub-001',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    units: 5,
    topicCount: 42,
    complexityScore: 88,
    effortScore: 85,
    conceptualDensity: 90,
    practicalDifficulty: 80,
    unitCountScore: 85,
    difficultyScore: 86,
    category: 'Difficult',
    reason: 'High conceptual density with 5 units covering trees, graphs, dynamic programming and complex algorithmic analysis. Requires significant coding practice.',
    progress: 45,
  },
  {
    id: 'sub-002',
    name: 'Database Management Systems',
    code: 'CS302',
    units: 5,
    topicCount: 38,
    complexityScore: 75,
    effortScore: 70,
    conceptualDensity: 80,
    practicalDifficulty: 72,
    unitCountScore: 85,
    difficultyScore: 76,
    category: 'Difficult',
    reason: 'Combines theoretical concepts (normalization, ACID) with practical SQL skills, transaction management, and indexing strategies.',
    progress: 60,
  },
  {
    id: 'sub-003',
    name: 'Object Oriented Programming with Java',
    code: 'CS303',
    units: 4,
    topicCount: 32,
    complexityScore: 60,
    effortScore: 62,
    conceptualDensity: 65,
    practicalDifficulty: 58,
    unitCountScore: 70,
    difficultyScore: 63,
    category: 'Moderate',
    reason: 'Moderate complexity with OOP concepts and Java-specific features. Design patterns increase difficulty.',
    progress: 75,
  },
  {
    id: 'sub-004',
    name: 'Machine Learning',
    code: 'CS401',
    units: 5,
    topicCount: 40,
    complexityScore: 82,
    effortScore: 80,
    conceptualDensity: 88,
    practicalDifficulty: 75,
    unitCountScore: 85,
    difficultyScore: 82,
    category: 'Difficult',
    reason: 'Heavy mathematical foundation (linear algebra, probability, calculus) combined with implementation complexity.',
    progress: 30,
  },
  {
    id: 'sub-005',
    name: 'Computer Networks',
    code: 'CS304',
    units: 4,
    topicCount: 34,
    complexityScore: 65,
    effortScore: 60,
    conceptualDensity: 70,
    practicalDifficulty: 55,
    unitCountScore: 70,
    difficultyScore: 64,
    category: 'Moderate',
    reason: 'Protocol stacks and network layers require systematic understanding. Moderate practical difficulty.',
    progress: 55,
  },
  {
    id: 'sub-006',
    name: 'Engineering Mathematics III',
    code: 'MA301',
    units: 5,
    topicCount: 35,
    complexityScore: 72,
    effortScore: 75,
    conceptualDensity: 78,
    practicalDifficulty: 65,
    unitCountScore: 85,
    difficultyScore: 75,
    category: 'Difficult',
    reason: 'Advanced mathematical topics including Laplace transforms, Fourier series, and complex analysis.',
    progress: 50,
  },
  {
    id: 'sub-007',
    name: 'Professional Ethics',
    code: 'HS301',
    units: 2,
    topicCount: 12,
    complexityScore: 20,
    effortScore: 15,
    conceptualDensity: 18,
    practicalDifficulty: 10,
    unitCountScore: 25,
    difficultyScore: 18,
    category: 'Easy',
    reason: 'Conceptual and theoretical subject with straightforward reading requirements.',
    progress: 90,
  },
];

export const DEMO_ROADMAP = {
  id: 'roadmap-001',
  goal: 'Software Engineer',
  country: 'Germany',
  totalSteps: 10,
  completedSteps: 1,
  steps: [
    {
      id: 'step-001',
      order: 1,
      title: 'Python Fundamentals',
      description: 'Master Python syntax, data types, control flow, and OOP',
      status: 'completed',
      progress: 100,
      estimatedWeeks: 4,
      skills: ['Python', 'Variables', 'Loops', 'Functions', 'OOP'],
      resources: ['Python.org docs', 'Real Python', 'Automate the Boring Stuff'],
    },
    {
      id: 'step-002',
      order: 2,
      title: 'Data Structures & Algorithms',
      description: 'Arrays, LinkedLists, Trees, Graphs, Sorting, DP',
      status: 'active',
      progress: 45,
      estimatedWeeks: 6,
      skills: ['DSA', 'Problem Solving', 'Time Complexity', 'Space Complexity'],
      resources: ['LeetCode', 'NeetCode', 'GeeksforGeeks'],
    },
    {
      id: 'step-003',
      order: 3,
      title: 'Git & Version Control',
      description: 'Git workflow, branching, GitHub collaboration',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 1,
      skills: ['Git', 'GitHub', 'Version Control'],
      resources: ['Pro Git book', 'GitHub Docs'],
    },
    {
      id: 'step-004',
      order: 4,
      title: 'SQL & Databases',
      description: 'Relational databases, SQL queries, PostgreSQL, schema design',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 3,
      skills: ['SQL', 'PostgreSQL', 'Database Design'],
      resources: ['SQLZoo', 'PostgreSQL docs'],
    },
    {
      id: 'step-005',
      order: 5,
      title: 'Backend Development',
      description: 'REST APIs, Node.js/Django/FastAPI, authentication',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 6,
      skills: ['REST API', 'Node.js', 'Authentication', 'HTTP'],
      resources: ['MDN Web Docs', 'FastAPI docs'],
    },
    {
      id: 'step-006',
      order: 6,
      title: 'Projects & Portfolio',
      description: 'Build 2-3 real-world projects for your portfolio',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 8,
      skills: ['Project Planning', 'GitHub Portfolio', 'Documentation'],
      resources: [],
    },
    {
      id: 'step-007',
      order: 7,
      title: 'German Language — A1',
      description: 'Basic German: greetings, numbers, daily phrases',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 6,
      skills: ['German A1', 'Language Skills'],
      resources: ['Duolingo', 'Deutsche Welle'],
    },
    {
      id: 'step-008',
      order: 8,
      title: 'German Language — A2',
      description: 'Intermediate German: workplace vocabulary, grammar',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 8,
      skills: ['German A2'],
      resources: ['Duolingo', 'Deutsche Welle'],
    },
    {
      id: 'step-009',
      order: 9,
      title: 'Internship Preparation',
      description: 'CV, LinkedIn, interview preparation for German companies',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 4,
      skills: ['Resume Writing', 'Interviews', 'LinkedIn'],
      resources: [],
    },
    {
      id: 'step-010',
      order: 10,
      title: 'Job / Master\'s Applications',
      description: 'Apply to German tech companies or universities',
      status: 'locked',
      progress: 0,
      estimatedWeeks: 12,
      skills: ['Job Search', 'Application Process'],
      resources: [],
    },
  ],
};

export const DEMO_TARGETS = [
  {
    id: 'target-001',
    title: 'Binary Trees — Introduction',
    description: 'Understand tree structure, terminology: root, leaf, height, depth, parent, child nodes',
    date: new Date().toISOString().split('T')[0],
    course: 'Data Structures & Algorithms',
    week: 5,
    day: 1,
    difficulty: 'Moderate',
    estimatedDuration: 60,
    status: 'in_progress',
    completedAt: null,
  },
  {
    id: 'target-002',
    title: 'Binary Tree Traversals',
    description: 'Implement Inorder, Preorder, Postorder traversal — both recursive and iterative',
    date: new Date().toISOString().split('T')[0],
    course: 'Data Structures & Algorithms',
    week: 5,
    day: 1,
    difficulty: 'Difficult',
    estimatedDuration: 90,
    status: 'not_started',
    completedAt: null,
  },
  {
    id: 'target-003',
    title: 'LeetCode: Easy Tree Problems',
    description: 'Solve 3 easy-level tree problems on LeetCode: Maximum Depth, Same Tree, Invert Binary Tree',
    date: new Date().toISOString().split('T')[0],
    course: 'Data Structures & Algorithms',
    week: 5,
    day: 1,
    difficulty: 'Easy',
    estimatedDuration: 45,
    status: 'not_started',
    completedAt: null,
  },
];

export const DEMO_ASSIGNMENTS = [
  {
    id: 'assign-001',
    title: 'DBMS Lab Assignment — ER Diagrams',
    subject: 'Database Management Systems',
    difficulty: 3,
    estimatedHours: 4,
    deadline: getRelativeDate(2),
    importance: 4,
    status: 'pending',
    priorityScore: 88,
    priorityCategory: 'HIGH',
    notes: 'Draw ER diagrams for library management system with all relationships',
    createdAt: getRelativeDate(-3),
  },
  {
    id: 'assign-002',
    title: 'DSA Assignment — Graph Algorithms',
    subject: 'Data Structures & Algorithms',
    difficulty: 4,
    estimatedHours: 6,
    deadline: getRelativeDate(4),
    importance: 5,
    status: 'pending',
    priorityScore: 85,
    priorityCategory: 'HIGH',
    notes: 'Implement BFS, DFS, Dijkstra\'s and A* algorithms with test cases',
    createdAt: getRelativeDate(-2),
  },
  {
    id: 'assign-003',
    title: 'Java OOP — Design Patterns Report',
    subject: 'Object Oriented Programming with Java',
    difficulty: 2,
    estimatedHours: 3,
    deadline: getRelativeDate(7),
    importance: 3,
    status: 'pending',
    priorityScore: 52,
    priorityCategory: 'MEDIUM',
    notes: 'Write a report explaining Singleton, Factory, and Observer patterns with examples',
    createdAt: getRelativeDate(-1),
  },
  {
    id: 'assign-004',
    title: 'Ethics Essay — AI in Society',
    subject: 'Professional Ethics',
    difficulty: 1,
    estimatedHours: 2,
    deadline: getRelativeDate(10),
    importance: 2,
    status: 'pending',
    priorityScore: 28,
    priorityCategory: 'LOW',
    notes: '1500-word essay on ethical implications of AI in modern society',
    createdAt: getRelativeDate(-5),
  },
  {
    id: 'assign-005',
    title: 'Python ML Project — Preprocessing',
    subject: 'Machine Learning',
    difficulty: 3,
    estimatedHours: 5,
    deadline: getRelativeDate(-1),
    importance: 4,
    status: 'overdue',
    priorityScore: 95,
    priorityCategory: 'HIGH',
    notes: 'Data preprocessing pipeline for Iris dataset',
    createdAt: getRelativeDate(-8),
  },
  {
    id: 'assign-006',
    title: 'Networks Lab — TCP Socket Programming',
    subject: 'Computer Networks',
    difficulty: 3,
    estimatedHours: 4,
    deadline: getRelativeDate(-3),
    importance: 3,
    status: 'completed',
    priorityScore: 0,
    priorityCategory: 'LOW',
    notes: 'Implement a basic chat application using TCP sockets',
    completedAt: getRelativeDate(-4),
    createdAt: getRelativeDate(-10),
  },
];

export const DEMO_EXAMS = [
  {
    id: 'exam-001',
    name: 'Internal Assessment I — DSA',
    type: 'Internal/Mid Exam',
    date: getRelativeDate(5),
    subjects: ['Data Structures & Algorithms'],
    syllabus: 'Units 1-3: Arrays, Linked Lists, Stacks, Queues, Trees',
    daysRemaining: 5,
    prepProgress: 35,
  },
  {
    id: 'exam-002',
    name: 'Internal Assessment I — DBMS',
    type: 'Internal/Mid Exam',
    date: getRelativeDate(7),
    subjects: ['Database Management Systems'],
    syllabus: 'Units 1-2: ER Models, Relational Algebra, SQL',
    daysRemaining: 7,
    prepProgress: 50,
  },
  {
    id: 'exam-003',
    name: 'Quiz — Machine Learning Basics',
    type: 'Quiz',
    date: getRelativeDate(12),
    subjects: ['Machine Learning'],
    syllabus: 'Unit 1: Supervised Learning fundamentals',
    daysRemaining: 12,
    prepProgress: 20,
  },
  {
    id: 'exam-004',
    name: 'Semester End Examination',
    type: 'Semester Exam',
    date: getRelativeDate(60),
    subjects: ['DSA', 'DBMS', 'Java OOP', 'Machine Learning', 'Computer Networks', 'Maths III'],
    syllabus: 'All units',
    daysRemaining: 60,
    prepProgress: 40,
  },
];

export const DEMO_ATTENDANCE = {
  totalWorkingDays: 78,
  presentDays: 61,
  requiredPercentage: 75,
  currentPercentage: 78.2,
  subjects: [
    { name: 'DSA', total: 28, present: 24, percentage: 85.7 },
    { name: 'DBMS', total: 28, present: 22, percentage: 78.6 },
    { name: 'Java OOP', total: 28, present: 25, percentage: 89.3 },
    { name: 'Machine Learning', total: 28, present: 18, percentage: 64.3 },
    { name: 'Computer Networks', total: 28, present: 20, percentage: 71.4 },
    { name: 'Engineering Maths', total: 28, present: 22, percentage: 78.6 },
    { name: 'Professional Ethics', total: 14, present: 13, percentage: 92.9 },
  ],
};

export const DEMO_STUDY_SESSIONS = generateStudySessions();

export const DEMO_STREAK = {
  currentStreak: 12,
  longestStreak: 18,
  totalActiveDays: 45,
  completionPercentage: 78,
  activityDates: generateActivityDates(45, 12),
};

export const DEMO_ANALYTICS = {
  weeklyTargets: [
    { week: 'Week 1', completed: 5, total: 7 },
    { week: 'Week 2', completed: 6, total: 7 },
    { week: 'Week 3', completed: 4, total: 7 },
    { week: 'Week 4', completed: 7, total: 7 },
    { week: 'Week 5', completed: 3, total: 5 },
  ],
  studyTime: [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 2 },
    { day: 'Wed', hours: 4 },
    { day: 'Thu', hours: 1.5 },
    { day: 'Fri', hours: 3 },
    { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 2.5 },
  ],
  skillProgress: [
    { skill: 'Python', progress: 100 },
    { skill: 'DSA', progress: 45 },
    { skill: 'Git/GitHub', progress: 0 },
    { skill: 'SQL', progress: 0 },
    { skill: 'Backend', progress: 0 },
  ],
  quizScores: [
    { topic: 'Python Basics', score: 92, date: getRelativeDate(-20) },
    { topic: 'Python OOP', score: 85, date: getRelativeDate(-15) },
    { topic: 'Arrays & LinkedLists', score: 70, date: getRelativeDate(-8) },
    { topic: 'Stacks & Queues', score: 78, date: getRelativeDate(-3) },
  ],
  monthlyStudyTime: [
    { month: 'Jun', hours: 42 },
    { month: 'Jul', hours: 68 },
    { month: 'Aug', hours: 55 },
  ],
};

export const DEMO_ACHIEVEMENTS = [
  { id: 'ach-001', title: 'First Step', description: 'Completed your first target', emoji: '🎯', unlocked: true, unlockedAt: getRelativeDate(-44) },
  { id: 'ach-002', title: 'Week Warrior', description: 'Maintained a 7-day streak', emoji: '🔥', unlocked: true, unlockedAt: getRelativeDate(-5) },
  { id: 'ach-003', title: 'Course Champion', description: 'Completed your first course', emoji: '🏆', unlocked: true, unlockedAt: getRelativeDate(-10) },
  { id: 'ach-004', title: 'Night Owl', description: 'Studied for 10+ hours total', emoji: '🦉', unlocked: true, unlockedAt: getRelativeDate(-30) },
  { id: 'ach-005', title: 'Assignment Ace', description: 'Completed 5 assignments', emoji: '📝', unlocked: true, unlockedAt: getRelativeDate(-20) },
  { id: 'ach-006', title: 'Streak Master', description: 'Achieve a 30-day streak', emoji: '⚡', unlocked: false },
  { id: 'ach-007', title: 'Century Club', description: 'Log 100 hours of study', emoji: '💯', unlocked: false },
  { id: 'ach-008', title: 'Roadmap Explorer', description: 'Complete 5 roadmap stages', emoji: '🗺️', unlocked: false },
  { id: 'ach-009', title: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', emoji: '🧠', unlocked: false },
  { id: 'ach-010', title: 'Perfect Week', description: 'Complete all 7 daily targets in a week', emoji: '⭐', unlocked: false },
];

export const DEMO_QUIZ_BANK = {
  'dsa-trees': {
    title: 'Binary Trees Fundamentals',
    topic: 'Data Structures & Algorithms',
    questions: [
      {
        id: 'q1',
        question: 'What is the maximum number of nodes at level l of a binary tree (root at level 0)?',
        options: ['l', '2l', '2^l', 'l^2'],
        correct: 2,
        explanation: 'At level l, a binary tree can have at most 2^l nodes.',
      },
      {
        id: 'q2',
        question: 'Which traversal of a Binary Search Tree gives nodes in sorted order?',
        options: ['Preorder', 'Postorder', 'Inorder', 'Level order'],
        correct: 2,
        explanation: 'Inorder traversal (Left → Root → Right) of a BST gives nodes in ascending sorted order.',
      },
      {
        id: 'q3',
        question: 'What is the height of a complete binary tree with n nodes?',
        options: ['n', 'n/2', 'log₂(n)', 'n²'],
        correct: 2,
        explanation: 'A complete binary tree with n nodes has height ⌊log₂(n)⌋.',
      },
      {
        id: 'q4',
        question: 'Which of the following is NOT a property of a Binary Search Tree?',
        options: [
          'Left subtree keys < root key',
          'Right subtree keys > root key',
          'All nodes must have exactly two children',
          'Both subtrees are also BSTs',
        ],
        correct: 2,
        explanation: 'BST nodes can have 0, 1, or 2 children. Having exactly two children is not a requirement.',
      },
      {
        id: 'q5',
        question: 'What is the time complexity of searching in a balanced BST?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correct: 1,
        explanation: 'In a balanced BST, search takes O(log n) time as we eliminate half the nodes at each step.',
      },
    ],
  },
};

export const DEMO_STUDY_VAULT = [
  {
    id: 'res-001',
    title: 'DSA Cheat Sheet — Big O Notation',
    type: 'note',
    subject: 'Data Structures & Algorithms',
    content: 'Quick reference for time and space complexities of common algorithms',
    createdAt: getRelativeDate(-15),
    tags: ['complexity', 'big-o', 'reference'],
  },
  {
    id: 'res-002',
    title: 'Binary Trees Visual Guide',
    type: 'link',
    subject: 'Data Structures & Algorithms',
    url: 'https://visualgo.net/en/bst',
    content: 'Interactive visualization of BST operations',
    createdAt: getRelativeDate(-5),
    tags: ['trees', 'visual', 'interactive'],
  },
  {
    id: 'res-003',
    title: 'DBMS Quick Revision Notes',
    type: 'note',
    subject: 'Database Management Systems',
    content: 'All SQL commands, normalization rules, ACID properties in one place',
    createdAt: getRelativeDate(-20),
    tags: ['sql', 'normalization', 'acid', 'revision'],
  },
  {
    id: 'res-004',
    title: 'Machine Learning Math Prerequisites',
    type: 'link',
    subject: 'Machine Learning',
    url: 'https://www.khanacademy.org/math/linear-algebra',
    content: 'Linear algebra foundation for ML',
    createdAt: getRelativeDate(-30),
    tags: ['math', 'linear-algebra', 'prerequisites'],
  },
  {
    id: 'res-005',
    title: 'Python Complete Reference PDF',
    type: 'pdf',
    subject: 'Python Fundamentals',
    content: 'Comprehensive Python 3.x reference documentation',
    createdAt: getRelativeDate(-60),
    tags: ['python', 'reference', 'complete'],
  },
];

export const DEMO_NOTIFICATIONS = [
  { id: 'n1', type: 'exam', title: 'DSA Internal in 5 days', message: 'Prepare Units 1-3 for your upcoming DSA internal assessment', read: false, time: '1h ago' },
  { id: 'n2', type: 'assignment', title: 'Assignment Overdue', message: 'ML Preprocessing assignment is overdue. Submit as soon as possible.', read: false, time: '3h ago' },
  { id: 'n3', type: 'target', title: 'Daily Target Pending', message: 'You haven\'t completed today\'s study targets yet.', read: false, time: '5h ago' },
  { id: 'n4', type: 'streak', title: '12-Day Streak! 🔥', message: 'You\'re on a 12-day study streak. Keep it going!', read: true, time: '1d ago' },
  { id: 'n5', type: 'achievement', title: 'Achievement Unlocked!', message: 'Week Warrior — You maintained a 7-day streak', read: true, time: '5d ago' },
];

export const CAREER_RECOMMENDATIONS = [
  {
    role: 'Data Analyst',
    matchPercentage: 91,
    reason: 'Strong alignment with your AI & Data Science background and interest in data-driven insights',
    requiredSkills: ['Python', 'SQL', 'Power BI / Tableau', 'Statistics', 'Excel'],
    difficulty: 'Moderate',
    prepPath: 'Python → SQL → Statistics → Visualization → Projects',
    demand: 'HIGH',
  },
  {
    role: 'Data Engineer',
    matchPercentage: 84,
    reason: 'Your CS foundation maps well to data pipeline and infrastructure engineering',
    requiredSkills: ['Python', 'SQL', 'Spark', 'Airflow', 'Cloud (AWS/GCP)'],
    difficulty: 'Difficult',
    prepPath: 'Python → SQL → Big Data → Cloud → Pipeline Projects',
    demand: 'HIGH',
  },
  {
    role: 'Software Engineer',
    matchPercentage: 78,
    reason: 'B.Tech background provides core CS fundamentals required for software engineering',
    requiredSkills: ['DSA', 'Python/Java', 'System Design', 'Git', 'Backend'],
    difficulty: 'Difficult',
    prepPath: 'DSA → Backend → Projects → System Design → Internship',
    demand: 'HIGH',
  },
  {
    role: 'ML Engineer',
    matchPercentage: 74,
    reason: 'AI & Data Science stream provides strong foundation; requires deepening math & ML skills',
    requiredSkills: ['Python', 'ML/DL frameworks', 'Math', 'Cloud ML', 'MLOps'],
    difficulty: 'Very Difficult',
    prepPath: 'Python → Math → ML → DL → Production ML → MLOps',
    demand: 'HIGH',
  },
  {
    role: 'Cloud Engineer',
    matchPercentage: 65,
    reason: 'CS fundamentals apply; requires focus on cloud infrastructure and DevOps tools',
    requiredSkills: ['AWS/Azure/GCP', 'Linux', 'Docker', 'Terraform', 'Networking'],
    difficulty: 'Moderate',
    prepPath: 'Linux → Networking → Cloud Fundamentals → Certifications → Projects',
    demand: 'MEDIUM',
  },
];

export const COUNTRY_PATHWAYS = {
  Germany: {
    overview: 'Germany is one of Europe\'s top tech hubs with strong demand for software engineers. Indian B.Tech graduates have several viable pathways.',
    disclaimer: 'Note: Immigration rules, visa requirements, and university admission criteria change. Always verify with official sources (DAAD, Make it in Germany, German Embassy) before making decisions.',
    pathways: [
      {
        id: 'path-1',
        title: 'Master\'s Degree Route',
        steps: ['Complete B.Tech', 'Apply to German universities (DAAD portal)', 'Master\'s in Computer Science / SE', 'Working student / internship during studies', 'Full-time job offer', 'Career'],
        requirements: ['Strong GPA', 'English/German proficiency (verify current requirements)', 'APS Certificate (verify current status)', 'IELTS / TOEFL', 'German A1/A2 may help'],
        advantages: ['Recognized qualification in Europe', 'Access to EU job market', 'Student visa allows part-time work (verify current limits)'],
        challenges: ['Application process takes time', 'Financial planning required', 'Possible language barrier initially'],
        prepSteps: ['Research universities on DAAD', 'Prepare SOP and LORs', 'Appear for IELTS/TOEFL', 'Start German language classes'],
      },
      {
        id: 'path-2',
        title: 'Direct Job Application Route',
        steps: ['B.Tech + Strong Skills', 'Build Project Portfolio', 'Gain experience (0-2 years)', 'Apply to German tech companies', 'Job offer', 'Work Visa (verify current process)', 'Career'],
        requirements: ['Strong technical portfolio', 'B.Tech degree', 'Relevant work experience (verify employer requirements)', 'English proficiency', 'Verify current visa requirements officially'],
        advantages: ['Potentially faster to employment', 'Learn on the job', 'Company may assist with relocation'],
        challenges: ['Competitive selection', 'Must secure offer before visa processing', 'German employers may prefer EU candidates'],
        prepSteps: ['Build 3-5 strong projects', 'Optimize LinkedIn profile', 'Practice DSA and system design', 'Learn basic German'],
      },
      {
        id: 'path-3',
        title: 'Indian Company → International Transfer',
        steps: ['Join Indian tech company (MNC/product)', 'Build 2-4 years experience', 'Transfer to European office or apply to German firms with experience', 'Career in Germany'],
        requirements: ['Strong performance record', 'Transferable skills', 'Company with international operations or experience for direct applications'],
        advantages: ['Lower initial risk', 'Build experience and savings', 'Established track record'],
        challenges: ['Internal transfers not guaranteed', 'Takes longer', 'Company-dependent'],
        prepSteps: ['Join a reputed company', 'Perform well consistently', 'Network internally', 'Continue improving skills and German language'],
      },
    ],
  },
};

export const JOB_MARKET_DATA = {
  'Software Engineer': {
    currentDemand: 'HIGH',
    trend: 'Growing',
    projectedDemand: 'HIGH',
    topSkills: ['Python', 'JavaScript', 'System Design', 'Cloud', 'DSA'],
    averageSalaryRange: 'Varies by country, company, and experience — research current data',
    disclaimer: 'Demand indicators are estimated trends. Actual job market conditions vary. Research current job postings for up-to-date data.',
    topCountries: ['Germany', 'USA', 'Canada', 'Netherlands', 'UK'],
    topCompanies: ['SAP', 'Zalando', 'BMW', 'Siemens', 'Delivery Hero (Germany examples)'],
  },
};

// Helper functions
function getRelativeDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

function generateActivityDates(totalDays, currentStreak) {
  const dates = [];
  const today = new Date();
  
  // Generate streak days
  for (let i = 0; i < currentStreak; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  
  // Add some earlier activity dates
  const gap = 3;
  for (let i = currentStreak + gap; i < totalDays + gap + 5; i++) {
    if (Math.random() > 0.3) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  
  return dates;
}

function generateStudySessions() {
  const sessions = [];
  const subjects = ['Data Structures & Algorithms', 'Database Management Systems', 'Python Fundamentals', 'Machine Learning', 'Computer Networks'];
  const activities = ['Study', 'Practice', 'Revision', 'Assignment'];
  
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (Math.random() > 0.3) {
      const duration = Math.floor(Math.random() * 3600 * 3) + 1800; // 30min to 4.5hrs
      sessions.push({
        id: `session-${i}`,
        date: d.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '12:00',
        duration,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        activity: activities[Math.floor(Math.random() * activities.length)],
      });
    }
  }
  
  return sessions;
}
