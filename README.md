# 🚀 PathWise AI

### Forge Your Skills. Build Your Future.

PathWise AI is an AI-powered student growth and career guidance platform designed to help students move beyond simply focusing on academics and build the skills, habits, knowledge, and career direction they need for their future.

Instead of leaving students confused about **what to learn, what to do next, and how to reach their dream career**, PathWise AI creates a personalized journey based on their education, skills, career goals, target job role, and destination.

---

## 🎯 Vision

Many students know that they want to improve their lives and careers, but they don't know:

- What skills they should learn
- Which career path is right for them
- What they should learn today
- How to maintain consistency
- How to track their progress
- How to prepare for their dream job
- How to plan for opportunities in another country

**PathWise AI is designed to solve this problem.**

> Your career should not be a road you walk blindly.
> PathWise AI gives you a path to follow.

---

# ✨ Key Features

## 👤 Personalized Student Profile

Create an account and build a personalized student profile.

The platform can maintain information such as:

- Name
- Course
- Stream
- Current year
- Academic information
- Skills
- Career goals
- Learning progress

User information is securely associated with the authenticated account.

---

## 🧭 AI Career Roadmap

Don't know what to learn next?

PathWise AI creates a personalized career roadmap based on:

- Dream job role
- Target country
- Current education
- Current skills
- Career requirements

For example:

**Software Engineer → Germany**

Possible journey:

```text
Python
   ↓
Data Structures & Algorithms
   ↓
Software Development Skills
   ↓
German Language A1
   ↓
German Language A2
   ↓
German Language B1
   ↓
Projects & Experience
   ↓
Higher Studies / Job / On-site Opportunities# Pathwise-AI

The roadmap is designed to evolve as the student progresses.
🎯 Smart Target System
PathWise AI converts the roadmap into manageable learning targets.
Daily Target
Small tasks designed for today's learning.
Weekly Target
A structured weekly learning objective.
Monthly Target
Larger milestones that measure meaningful progress.
Yearly Target
Long-term career development goals.
As the student completes targets, progress is updated and the learning journey moves forward.
🔥 Habit & Learning Streak
Consistency matters.
PathWise AI tracks learning activity and creates a personalized streak system.
Students can monitor:
Current streak
Learning consistency
Completed targets
Progress history
Longest streak
The goal is to encourage students to build consistent learning habits.
📚 Study Vault
Study Vault allows students to organize their learning resources.
Students can:
Upload resources
View resources
Download resources
Delete resources
Resources can be used to generate learning assistance such as:
Important topics
Important questions
Practice quizzes
Learning insights
Uploaded resources are associated with the student's account.
🧠 Skill Quiz
PathWise AI provides two quiz modes.
Mode 1 — Skills Learned
Generate quizzes based on the skills and topics the student has already completed.
Example:
Python Basics Completed
        ↓
Python Basics Quiz
        ↓
Student Answers
        ↓
Score Analysis
        ↓
Performance Updated
Mode 2 — Resource-Based Quiz
Generate quizzes from resources uploaded by the student.
Quiz performance can contribute to the student's learning analytics.
🤖 Personalized AI Chatbot
PathWise AI includes an AI-powered personalized chatbot.
The chatbot can assist students with:
Learning questions
Career guidance
Roadmap guidance
Target explanations
Study planning
Skill development
Personalized assistance
The chatbot is designed to understand the student's learning journey where appropriate.
🌐 AI Web Search
PathWise AI can provide web-assisted AI responses through its web-search functionality.
The system can use Groq-based AI services where configured.
API secrets are intended to remain in secure environment/server-side configuration rather than being exposed in the frontend.
📊 Student Analytics
PathWise AI converts student activity into meaningful visual analytics.
Students can monitor:
Target completion
Learning progress
Study time
Quiz performance
Habit streak
Roadmap progress
Activity history
Analytics are designed to work even when the student has only a small amount of activity data.
⏱️ Smart Study Stopwatch
The built-in stopwatch helps students track study sessions.
Features include:
Start
Pause
Resume
Stop
Reset
Study activity can contribute to the student's overall analytics.
📅 Smart Assignment & Exam Planner
Students can manage important academic deadlines.
Assignment information
Students can add:
Task name
Subject
Difficulty
Deadline
Estimated effort where applicable
PathWise AI calculates a priority score based on factors such as:
Time remaining
Difficulty
Estimated effort
Urgency
Priority indicators
🔴 High priority
🟡 Medium priority
🟢 Lower priority
🗓️ Smart Calendar
Assignments and examinations are organized according to their actual dates.
For example:
10 September
┌─────────────────────────┐
│ Python Examination      │
│ Assignment Deadline     │
└─────────────────────────┘
This provides students with a clear overview of upcoming responsibilities.
📈 Attendance Calculator
Students can calculate their academic attendance.
The calculator supports targets such as:
75%
85%
90%
It can help determine:
Current attendance percentage
Attendance needed to reach a target
Possible absences while maintaining the selected percentage
💬 Daily Motivation
The Home dashboard includes motivational messages designed to encourage students to stay consistent.
A curated collection of motivational quotes can be displayed across different days.
🏠 Personalized Home Dashboard
The Home dashboard brings the student's journey together.
It can display:
Today's targets
Roadmap progress
Learning streak
Quiz performance
Study time
Assignment urgency
Overall progress
Motivational message
🔐 Authentication & Cloud Data
PathWise AI uses Supabase for cloud-based functionality.
The architecture supports:
User authentication
Persistent user sessions
User profiles
Cloud database storage
Learning progress
Targets
Roadmaps
Quiz results
Assignments
Analytics
Study resources
Each authenticated user should only have access to their own private data through appropriate database security policies.
🛠️ Technology Stack
Frontend
React
Vite
JavaScript
Modern CSS
Responsive UI
Motion-based UI/UX
Backend / Cloud
Supabase
Supabase Authentication
Supabase Database
Supabase Storage
AI
AI-powered personalized assistance
Groq integration for configured web-search functionality
Deployment
Vercel
Development
Antigravity IDE
Git
GitHub
🏗️ High-Level Architecture
                    PATHWISE AI
                         │
              ┌──────────┴──────────┐
              │                     │
          Frontend              AI Services
              │                     │
        React + Vite          Personalized AI
              │                     │
              └──────────┬──────────┘
                         │
                      Supabase
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        Auth          Database        Storage
          │              │              │
       Accounts       User Data      Resources
                         │
                    Student Journey
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
    Roadmap           Targets          Analytics
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  Personalized Growth
🚀 Getting Started
1. Clone the repository
git clone YOUR_REPOSITORY_URL
cd skillforge-ai
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file locally.
Example:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
Add other required server-side variables according to the application's deployment configuration.
Never commit secret API keys to GitHub.
4. Run the development server
npm run dev
Open the local address provided by Vite.
5. Build for production
npm run build
The production build is generated in:
dist/
☁️ Deployment
PathWise AI is designed to be deployed using Vercel.
Deployment flow:
Local Project
     ↓
GitHub
     ↓
Vercel
     ↓
Environment Variables
     ↓
Production Build
     ↓
Live PathWise AI
Once deployed, students can access the application through the public Vercel URL.
🔒 Security
PathWise AI follows secure application principles.
Important rules:
Never expose service-role keys in frontend code.
Never commit .env files containing secrets.
Use authenticated user identity for user-specific data.
Use Row Level Security where appropriate.
Keep server-only API keys on the server.
Validate user input.
Protect private student data.
🌱 Future Vision
PathWise AI is designed to evolve into a complete student growth ecosystem.
Future possibilities include:
Mobile application
Advanced AI career prediction
Skill-gap analysis
Internship recommendations
Job opportunity tracking
Country-specific career pathways
Resume assistance
Interview preparation
Portfolio generation
Personalized learning plans
AI-powered career mentoring
Advanced learning analytics
🏆 The Core Idea
PathWise AI is not just an academic planner.
It is a student transformation platform.
The goal is to help students move from:
CONFUSION
   ↓
CLARITY
   ↓
ROADMAP
   ↓
DAILY ACTION
   ↓
CONSISTENCY
   ↓
SKILL DEVELOPMENT
   ↓
CAREER READINESS
   ↓
FUTURE
Don't just study for tomorrow's exam. Build the skills for tomorrow's life.
👨‍💻 Project
PathWise AI
Tagline
Forge Your Skills. Build Your Future.
Built with the vision of helping students discover their direction, develop valuable skills, stay consistent, and build a future they are proud of.
⭐ If you find PathWise AI useful, consider giving the repository a star.

### Small recommendation

Since you've renamed the application to **PathWise AI**, use these consistently everywhere:

**Application:** `PathWise AI`  
**Career Journey:** `FutureForge` (if you still want this internal feature name)  
**Tagline:** `Forge Your Skills. Build Your Future.`

And don't put your actual Supabase/Groq keys in this README or GitHub.
