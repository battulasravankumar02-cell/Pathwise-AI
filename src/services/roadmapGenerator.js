/**
 * FutureForge Roadmap & Target Generator
 * PathWise AI — Dynamic Skill & Career Journey Engine
 * "Forge Your Skills. Build Your Future."
 */

export const CAREER_PROFILES = {
  'Software Engineer': {
    title: 'Software Engineer',
    defaultCountry: 'Germany',
    stages: [
      {
        id: 'stage-1',
        title: 'Programming Fundamentals (Python / C++)',
        description: 'Master core programming constructs, memory models, object-oriented concepts, and algorithmic thinking.',
        skills: ['Python / C++', 'Object-Oriented Programming', 'Time & Space Complexity', 'Debugging'],
        estimatedWeeks: 4,
        whyItMatters: 'Foundational syntax and algorithmic logic are required for all subsequent engineering modules and technical interviews.',
        conceptDetails: 'Data structures, control flow, functions, recursion, classes, pointers/references, and memory layout.',
        practiceTask: 'Build 5 console applications including an automated Grade Tracker and a Mini File Parser.',
        quizId: 'python-fundamentals',
        dailyTargets: [
          { day: 1, title: 'What is Programming & Language Syntax', duration: 45, difficulty: 'Easy' },
          { day: 2, title: 'Variables, Memory & Data Types', duration: 45, difficulty: 'Easy' },
          { day: 3, title: 'Control Flow: Conditionals & Pattern Matching', duration: 60, difficulty: 'Medium' },
          { day: 4, title: 'Loops, Iterators & List Comprehensions', duration: 60, difficulty: 'Medium' },
          { day: 5, title: 'Functions, Scopes & Lambda Expressions', duration: 60, difficulty: 'Medium' },
          { day: 6, title: 'OOP Principles: Classes, Inheritance & Polymorphism', duration: 90, difficulty: 'Hard' },
          { day: 7, title: 'Module 1 Review & Mini-Project Build', duration: 90, difficulty: 'Hard' },
        ],
      },
      {
        id: 'stage-2',
        title: 'Data Structures & Core Algorithms (DSA)',
        description: 'Essential data structures from arrays and linked lists to trees, graphs, and dynamic programming.',
        skills: ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'LeetCode Problem Solving'],
        estimatedWeeks: 6,
        whyItMatters: 'DSA is the universal benchmark tested in international software engineering hiring rounds.',
        conceptDetails: 'Big-O asymptotic analysis, binary search trees, graph traversals (BFS/DFS), heaps, recursion trees, and memoization.',
        practiceTask: 'Solve 30 curated LeetCode Easy & Medium problems covering arrays, trees, and graphs.',
        quizId: 'dsa-fundamentals',
        dailyTargets: [
          { day: 1, title: 'Big-O Notation & Asymptotic Complexity Analysis', duration: 60, difficulty: 'Medium' },
          { day: 2, title: 'Array Manipulations, Two-Pointers & Sliding Window', duration: 90, difficulty: 'Hard' },
          { day: 3, title: 'Singly & Doubly Linked Lists Implementations', duration: 90, difficulty: 'Medium' },
          { day: 4, title: 'Stacks & Queues: Monotonic Stacks & Applications', duration: 60, difficulty: 'Medium' },
          { day: 5, title: 'Binary Search Trees & Tree Traversals (Inorder/Preorder)', duration: 90, difficulty: 'Hard' },
          { day: 6, title: 'Graph Representations & BFS/DFS Traversal Algorithms', duration: 90, difficulty: 'Hard' },
          { day: 7, title: 'Introduction to Dynamic Programming & Memoization', duration: 90, difficulty: 'Hard' },
        ],
      },
      {
        id: 'stage-3',
        title: 'Backend Systems & RESTful APIs',
        description: 'Designing scalable web services, API architecture, database schemas, and microservice communication.',
        skills: ['FastAPI / Node.js', 'PostgreSQL / SQL', 'REST APIs', 'Authentication & JWT'],
        estimatedWeeks: 5,
        whyItMatters: 'Industry backends power modern apps. Building real services demonstrates production readiness.',
        conceptDetails: 'HTTP protocols, relational database normalization, indexing, ORMs, middleware, and stateless authentication.',
        practiceTask: 'Develop an authenticated REST API for a collaborative workspace with PostgreSQL and automated tests.',
        quizId: 'backend-apis',
        dailyTargets: [
          { day: 1, title: 'HTTP Methods, Status Codes & Request Lifecycle', duration: 45, difficulty: 'Easy' },
          { day: 2, title: 'Relational Database Schema Design & Normalization', duration: 60, difficulty: 'Medium' },
          { day: 3, title: 'Complex SQL Queries, Joins, and Index Optimizations', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'Building RESTful Endpoints with Input Validation', duration: 90, difficulty: 'Medium' },
          { day: 5, title: 'JWT Authentication & Role-Based Access Control', duration: 90, difficulty: 'Hard' },
          { day: 6, title: 'API Integration Testing & Error Handling Middleware', duration: 60, difficulty: 'Medium' },
          { day: 7, title: 'Dockerizing the Backend Application', duration: 90, difficulty: 'Hard' },
        ],
      },
      {
        id: 'stage-4',
        title: 'Git, DevOps & Cloud Deployment',
        description: 'Version control mastery, CI/CD pipelines, containerization with Docker, and cloud hosting.',
        skills: ['Git & GitHub', 'Docker Containers', 'CI/CD Pipelines', 'Cloud Hosting (AWS/Vercel)'],
        estimatedWeeks: 3,
        whyItMatters: 'Companies expect developers to deploy, collaborate, and manage cloud workloads smoothly.',
        conceptDetails: 'Branching strategies, merge conflict resolution, Dockerfiles, multi-stage builds, and automated GitHub Actions.',
        practiceTask: 'Set up an automated GitHub Actions pipeline that lints, tests, and deploys a live application.',
        quizId: 'devops-git',
        dailyTargets: [
          { day: 1, title: 'Advanced Git: Interactive Rebase, Cherry-Pick & Branching', duration: 45, difficulty: 'Medium' },
          { day: 2, title: 'Docker Basics: Images, Containers & Volumes', duration: 60, difficulty: 'Medium' },
          { day: 3, title: 'Writing Multi-Stage Dockerfiles for Production', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'Docker Compose for Multi-Service Local Environments', duration: 60, difficulty: 'Medium' },
          { day: 5, title: 'Configuring GitHub Actions for Continuous Integration', duration: 90, difficulty: 'Hard' },
          { day: 6, title: 'Deploying Containers to Cloud Platforms', duration: 60, difficulty: 'Medium' },
          { day: 7, title: 'Infrastructure Monitoring & Health Check Setup', duration: 45, difficulty: 'Easy' },
        ],
      },
      {
        id: 'stage-5',
        title: 'Capstone Production Project',
        description: 'End-to-end full-stack software application solving a tangible real-world problem with live users.',
        skills: ['System Architecture', 'Frontend & Backend Integration', 'Unit & E2E Testing', 'Portfolio Documentation'],
        estimatedWeeks: 4,
        whyItMatters: 'A live, well-architected project is the #1 asset that gets engineering resumes shortlisted by recruiters.',
        conceptDetails: 'Clean architecture, state management, caching (Redis), responsive UI, API security, and README case studies.',
        practiceTask: 'Ship and launch a full-featured web platform with live URL, demo video, and comprehensive GitHub README.',
        quizId: 'capstone-engineering',
        dailyTargets: [
          { day: 1, title: 'Project Specification & System Architecture Diagramming', duration: 60, difficulty: 'Medium' },
          { day: 2, title: 'Database Schema Migration & Core Data Models Setup', duration: 90, difficulty: 'Medium' },
          { day: 3, title: 'Implementing Business Logic & Complex Backend Features', duration: 120, difficulty: 'Hard' },
          { day: 4, title: 'Building the Interactive Responsive Frontend UI', duration: 120, difficulty: 'Hard' },
          { day: 5, title: 'Adding Security Headers, Rate Limiting & Error Logging', duration: 90, difficulty: 'Medium' },
          { day: 6, title: 'Writing Unit & End-to-End Test Suites', duration: 90, difficulty: 'Hard' },
          { day: 7, title: 'Deploying Production Build & Recording Video Demo', duration: 90, difficulty: 'Medium' },
        ],
      },
      {
        id: 'stage-6',
        title: 'Career & Internship Readiness (Global Pathway)',
        description: 'Technical interview practice, ATS-optimized resume building, LinkedIn presence, and country pathway requirements.',
        skills: ['Technical Interview Prep', 'System Design Basics', 'ATS Resume', 'Country Language/Visa Pathway'],
        estimatedWeeks: 3,
        whyItMatters: 'Translating engineering ability into job offers requires targeted interview readiness and country-specific preparation.',
        conceptDetails: 'Behavioral STAR methodology, mock coding rounds, portfolio presentations, and language certifications (e.g. German A1/A2 for Germany).',
        practiceTask: 'Complete 3 mock coding interviews and submit 10 personalized internship/job applications.',
        quizId: 'career-readiness',
        dailyTargets: [
          { day: 1, title: 'Drafting an ATS-Compliant Technical Resume', duration: 60, difficulty: 'Medium' },
          { day: 2, title: 'Optimizing LinkedIn & GitHub Profile for Recruiters', duration: 45, difficulty: 'Easy' },
          { day: 3, title: 'System Design Fundamentals: Scalability & Load Balancing', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'Behavioral Questions & STAR Method Responses', duration: 60, difficulty: 'Medium' },
          { day: 5, title: 'Live Coding Interview Simulation (Timed LeetCode)', duration: 90, difficulty: 'Hard' },
          { day: 6, title: 'Researching Target Country Visa & Hiring Requirements', duration: 60, difficulty: 'Easy' },
          { day: 7, title: 'Submitting Target Internship / Job Applications', duration: 90, difficulty: 'Medium' },
        ],
      },
    ],
  },
  'Data Scientist': {
    title: 'Data Scientist',
    defaultCountry: 'USA',
    stages: [
      {
        id: 'stage-1',
        title: 'Python for Data Science & Mathematics',
        description: 'Master Python, NumPy, Pandas, Linear Algebra, and Multivariate Calculus fundamentals.',
        skills: ['Python', 'NumPy & Pandas', 'Linear Algebra', 'Calculus'],
        estimatedWeeks: 4,
        whyItMatters: 'Mathematical foundations and efficient matrix manipulations are crucial for data science algorithms.',
        conceptDetails: 'Vector operations, matrix decompositions, derivatives, data manipulation, and clean vectorization.',
        practiceTask: 'Clean, reshape, and analyze a real-world dataset of 500k records using Pandas.',
        quizId: 'python-data-science',
        dailyTargets: [
          { day: 1, title: 'NumPy Arrays & Multidimensional Slicing', duration: 60, difficulty: 'Easy' },
          { day: 2, title: 'Pandas DataFrames, Indexing & Merging', duration: 60, difficulty: 'Medium' },
          { day: 3, title: 'Handling Missing Values & Outlier Detection', duration: 60, difficulty: 'Medium' },
          { day: 4, title: 'Matrix Inverses, Eigenvalues & Dot Products', duration: 90, difficulty: 'Hard' },
          { day: 5, title: 'Statistical Aggregations & GroupBy Operations', duration: 60, difficulty: 'Medium' },
          { day: 6, title: 'Exploratory Data Analysis (EDA) on Kaggle Dataset', duration: 90, difficulty: 'Hard' },
          { day: 7, title: 'Building Automated Data Cleaning Pipelines', duration: 90, difficulty: 'Hard' },
        ],
      },
      {
        id: 'stage-2',
        title: 'Statistical Inference & Exploratory Analysis',
        description: 'Probability distributions, hypothesis testing, A/B testing frameworks, and data visualization.',
        skills: ['Statistics', 'Hypothesis Testing', 'Seaborn & Matplotlib', 'A/B Testing'],
        estimatedWeeks: 4,
        whyItMatters: 'Sound statistical conclusions prevent false findings and guide business decisions.',
        conceptDetails: 'Central Limit Theorem, p-values, confidence intervals, ANOVA, and experiment design.',
        practiceTask: 'Design and evaluate a complete A/B test simulation on user conversion data.',
        quizId: 'statistics-inference',
        dailyTargets: [
          { day: 1, title: 'Probability Distributions (Normal, Binomial, Poisson)', duration: 60, difficulty: 'Medium' },
          { day: 2, title: 'Central Limit Theorem & Confidence Intervals', duration: 60, difficulty: 'Medium' },
          { day: 3, title: 'Hypothesis Testing: t-tests & z-tests', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'Chi-Square Tests & ANOVA Calculations', duration: 90, difficulty: 'Hard' },
          { day: 5, title: 'Designing an A/B Test Framework & Power Analysis', duration: 90, difficulty: 'Hard' },
          { day: 6, title: 'Interactive Visualizations with Seaborn & Plotly', duration: 60, difficulty: 'Medium' },
          { day: 7, title: 'Writing Statistical Findings Reports', duration: 60, difficulty: 'Medium' },
        ],
      },
      {
        id: 'stage-3',
        title: 'Machine Learning Models & Scikit-Learn',
        description: 'Supervised and unsupervised learning, regression, classification, clustering, and model validation.',
        skills: ['Scikit-Learn', 'Regression & Classification', 'Ensemble Models', 'Cross-Validation'],
        estimatedWeeks: 6,
        whyItMatters: 'Core machine learning algorithms power predictive models across modern industry domains.',
        conceptDetails: 'Decision trees, Random Forests, XGBoost, k-Means, PCA, ROC-AUC, and hyperparameter tuning.',
        practiceTask: 'Train and tune an ensemble model achieving top 15% benchmark on a Kaggle competition.',
        quizId: 'machine-learning',
        dailyTargets: [
          { day: 1, title: 'Linear & Logistic Regression Implementations', duration: 60, difficulty: 'Medium' },
          { day: 2, title: 'Decision Trees & Information Gain Mathematics', duration: 60, difficulty: 'Medium' },
          { day: 3, title: 'Random Forests & Gradient Boosting (XGBoost/LightGBM)', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'K-Means Clustering & Dimensionality Reduction (PCA)', duration: 90, difficulty: 'Hard' },
          { day: 5, title: 'Feature Engineering & One-Hot Encoding Pipelines', duration: 90, difficulty: 'Medium' },
          { day: 6, title: 'Hyperparameter Tuning with GridSearch & Optuna', duration: 90, difficulty: 'Hard' },
          { day: 7, title: 'Model Evaluation Metrics: Precision, Recall & ROC-AUC', duration: 60, difficulty: 'Medium' },
        ],
      },
      {
        id: 'stage-4',
        title: 'Deep Learning & Neural Networks',
        description: 'Deep neural architectures, PyTorch, computer vision or NLP basics, and transfer learning.',
        skills: ['PyTorch', 'Neural Networks', 'Computer Vision / NLP', 'Transfer Learning'],
        estimatedWeeks: 5,
        whyItMatters: 'Modern AI relies on deep neural networks for unstructured image, text, and audio data.',
        conceptDetails: 'Backpropagation, gradient descent, CNNs, Transformers, attention mechanisms, and fine-tuning.',
        practiceTask: 'Fine-tune a pretrained model on custom dataset with PyTorch and deploy an inference API.',
        quizId: 'deep-learning',
        dailyTargets: [
          { day: 1, title: 'Perceptrons, Activation Functions & Backpropagation', duration: 90, difficulty: 'Hard' },
          { day: 2, title: 'PyTorch Tensors, Autograd & Building Custom Modules', duration: 90, difficulty: 'Medium' },
          { day: 3, title: 'Convolutional Neural Networks (CNN) for Image Tasks', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'Recurrent Architectures & Transformers Basics', duration: 90, difficulty: 'Hard' },
          { day: 5, title: 'Transfer Learning with HuggingFace / PyTorch Vision', duration: 90, difficulty: 'Medium' },
          { day: 6, title: 'Preventing Overfitting: Dropout, L2 & Early Stopping', duration: 60, difficulty: 'Medium' },
          { day: 7, title: 'Exporting Models to ONNX for High-Speed Inference', duration: 60, difficulty: 'Medium' },
        ],
      },
      {
        id: 'stage-5',
        title: 'MLOps, Data Pipelines & Model Deployment',
        description: 'Deploying machine learning models as production APIs with Docker, FastAPI, and MLflow tracking.',
        skills: ['FastAPI', 'MLflow', 'Docker for ML', 'Model Monitoring'],
        estimatedWeeks: 4,
        whyItMatters: 'Data science without production deployment remains unused prototypes. MLOps ensures business value.',
        conceptDetails: 'Model registry, artifact storage, inference latency optimization, batch vs streaming predictions, and drift detection.',
        practiceTask: 'Deploy an automated ML pipeline with model retraining triggers on AWS/GCP.',
        quizId: 'mlops-deployment',
        dailyTargets: [
          { day: 1, title: 'Wrapping ML Models in High-Performance FastAPI Endpoints', duration: 60, difficulty: 'Medium' },
          { day: 2, title: 'Experiment Tracking & Model Versioning with MLflow', duration: 90, difficulty: 'Medium' },
          { day: 3, title: 'Containerizing Machine Learning Environments with Docker', duration: 90, difficulty: 'Hard' },
          { day: 4, title: 'Setting Up Data Validation with Great Expectations', duration: 60, difficulty: 'Medium' },
          { day: 5, title: 'Automating Training Pipelines with GitHub Actions', duration: 90, difficulty: 'Hard' },
          { day: 6, title: 'Concept Drift & Data Drift Monitoring Strategies', duration: 60, difficulty: 'Medium' },
          { day: 7, title: 'Deploying Live Inference Service to Cloud Infrastructure', duration: 90, difficulty: 'Hard' },
        ],
      },
    ],
  },
};

/**
 * Generate a complete FutureForge Roadmap tailored to user goal & country
 * @param {string} jobRole
 * @param {string} country
 * @returns {object} Roadmap structure with stages, targets, milestones
 */
export function generatePersonalizedRoadmap(jobRole = 'Software Engineer', country = 'Germany') {
  // Use matched profile or fallback to customizable engineering template
  const baseProfile = CAREER_PROFILES[jobRole] || CAREER_PROFILES['Software Engineer'];
  const targetCountry = country || baseProfile.defaultCountry || 'Germany';

  const stages = baseProfile.stages.map((stage, index) => ({
    ...stage,
    status: index === 0 ? 'active' : 'locked',
    progress: index === 0 ? 0 : 0,
    order: index + 1,
  }));

  // Build Weekly, Monthly, Yearly target breakdowns
  const weeklyTargets = stages.flatMap((stage, sIdx) => 
    Array.from({ length: stage.estimatedWeeks }, (_, wIdx) => ({
      id: `w-${sIdx + 1}-${wIdx + 1}`,
      stageId: stage.id,
      weekNumber: sIdx * 4 + wIdx + 1,
      title: `${stage.title} — Part ${wIdx + 1}`,
      description: `Complete weekly learning milestones and practice exercises for ${stage.title}.`,
      skills: stage.skills,
      status: sIdx === 0 && wIdx === 0 ? 'in_progress' : 'locked',
      totalDays: 7,
      completedDays: 0,
    }))
  );

  const monthlyTargets = stages.map((stage, idx) => ({
    id: `m-${idx + 1}`,
    monthNumber: idx + 1,
    title: `Month ${idx + 1}: ${stage.title}`,
    milestone: `Master ${stage.title} and pass the Skill Quiz benchmark.`,
    expectedOutcome: stage.practiceTask,
    status: idx === 0 ? 'in_progress' : 'locked',
    progress: 0,
  }));

  const yearlyTargets = [
    {
      id: 'y-1',
      year: 1,
      title: `Career-Ready ${jobRole} (${targetCountry} Pathway)`,
      goal: `Build foundational to advanced ${jobRole} skills, pass skill quizzes, complete production capstone, and prepare international career applications for ${targetCountry}.`,
      milestones: stages.map(s => s.title),
      status: 'in_progress',
      progress: 0,
    },
  ];

  return {
    goal: jobRole,
    country: targetCountry,
    totalSteps: stages.length,
    completedSteps: 0,
    currentStepIndex: 0,
    steps: stages,
    weeklyTargets,
    monthlyTargets,
    yearlyTargets,
  };
}
