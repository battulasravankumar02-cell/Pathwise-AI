# PATHWISE AI — MASTER PRODUCTION AUDIT & RECTIFICATION ARCHITECTURE
**Document Path:** `docs/current-system-audit.md`  
**Date:** September 14, 2026  
**Auditor:** Principal Software Architect & Product Engineer  
**Status:** Pre-Rectification Assessment

---

## A. CURRENT ARCHITECTURE
PathWise AI is a single-page application built on:
- **Core Framework**: React 19.2.8 + Vite 8.2.2 + React Router 7.18.2
- **Data & Intelligence Layer**: Supabase (`@supabase/supabase-js` 2.112.4) with PostgreSQL backend, Row Level Security (RLS) policies, and local persistence fallback (`dataService.js`).
- **Icons & Visualization**: Lucide React 1.34.0, Recharts 3.10.1
- **Styling Architecture**: Custom Vanilla CSS design tokens (`src/styles/variables.css` and `src/styles/index.css`) featuring an Obsidian/Graphite/Teal/Champagne palette. No Tailwind or third-party CSS frameworks are installed.
- **Serverless API**: Vercel serverless function at `/api/chat.js` proxying BYOK (Gemini, OpenAI) and Groq Llama-3.3-70b web search requests.

---

## B. CURRENT NAVIGATION ARCHITECTURE
1. **Desktop Sidebar (`Sidebar.jsx`)**:
   - Fixed left sidebar at `width: var(--sidebar-width)` (252px) on desktop (`> 768px`).
   - Grouped into:
     - OVERVIEW: Home Dashboard (`/`)
     - CAREER & SKILLS: FutureForge (`/roadmap`), Goal & Career (`/goal-career`), Skill Quiz (`/skill-quiz`)
     - LEARNING & PRODUCTIVITY: Targets Engine (`/targets`), Study Timer (`/timer`), Habits & Streaks (`/habits`), Study Vault (`/study-vault`)
     - PLANNING & ACADEMICS: Unified Calendar (`/calendar`), Assignments (`/assignments`), Exam Planner (`/exams`), Academic & Attendance (`/academic`)
     - INTELLIGENCE: Analytics (`/analytics`), AI Assistant (`/ai-assistant`)
     - ACCOUNT: Settings (`/settings`)
2. **Top Header (`Header.jsx`)**:
   - Hamburger button (currently opens the desktop sidebar off-canvas on screens <= 768px).
   - Page title.
   - Theme toggle (Light/Dark).
   - Notification bell panel.
   - Student profile pill.

---

## C. CURRENT MOBILE NAVIGATION IMPLEMENTATION
- Current `MobileNav.jsx` renders a fixed bottom strip containing 6 arbitrary items (`Home`, `Targets`, `Timer`, `Analytics`, `AI`, `Academic`).
- Due to a CSS selector mismatch (`.mobile-nav-items` in JSX vs `.mobile-nav-inner` in CSS), the items lack proper flex alignment and touch-target padding.
- Meanwhile, the desktop sidebar remains active and slides in over the screen when the hamburger icon is tapped, causing navigation conflicts, overlapping UI elements, and a cluttered experience.
- The floating chatbot button sits at `bottom: 24px`, directly overlapping the bottom navigation bar.

---

## D. EXACT REASON THE CURRENT MOBILE EXPERIENCE IS FAILING
1. **Desktop-Biased Grids**: Inline CSS with rigid columns like `gridTemplateColumns: '1fr 340px'` in `Home.jsx` and `1fr 260px` in `AIAssistant.jsx` cause severe horizontal overflow on viewports under 768px.
2. **Bottom Nav / Content Collision**: Insufficient bottom padding on `.page-content` (`80px` on mobile, but floating chatbot + mobile nav + safe area requires at least `96px - 110px`), causing action buttons and cards to be clipped behind fixed bars.
3. **Competing Navigation Patterns**: Desktop sidebar sliding out over a mobile bottom bar creates two navigation systems fighting each other.
4. **Desktop Tables & Crowded Lists**: Academic subject cards and assignment lists try to display 5+ horizontal metadata chips simultaneously on narrow 360px–390px screens.
5. **No True App Hierarchy**: The mobile Command Center displays too many equally-weighted cards rather than answering:
   - "How am I doing?"
   - "What matters today?"
   - "What should I do next?"

---

## E. GOAL & CAREER IMPLEMENTATION
- Current file: `src/pages/GoalCareer.jsx`.
- Problem: It currently contains an interactive form with `form.hasGoal`, role inputs, destination dropdowns, and a "Save Goal & Generate Roadmap" button.
- Rectification Required:
  - Remove all edit controls, form inputs, and "Save Goal" / "Edit" / "Change Goal" buttons from `GoalCareer.jsx`.
  - Transform `GoalCareer.jsx` into a pure **VIEW-ONLY** destination overview (Target Role, Country, Industry, Career Pathway Stepper, Top In-Demand Skills, Job Market Data).
  - Also remove the "Change Goal" button from `Roadmap.jsx` and "Edit" button from `Home.jsx`.

---

## F. SETTINGS IMPLEMENTATION
- Current file: `src/pages/Settings.jsx`.
- Currently contains basic profile fields (name, email, course, year) and BYOK AI keys.
- Rectification Required:
  - Add a dedicated, premium **Career & Goals** section.
  - Enable students to edit: Target Job Role, Specialization, Target Destination/Country, and Industry.
  - On save: Persist to authoritative state (`career_goals` via Supabase & localStorage), notify the student, and present an adaptation confirmation modal:
    *"Your career goal changed. PathWise recommends updating your roadmap to match your new destination. [Update Roadmap] [Keep Current Roadmap]"*
  - Trigger downstream updates to roadmap, targets, and AI context when confirmed.

---

## G. EXAM PLANNER IMPLEMENTATION
- Current files: `src/pages/Exams.jsx`, route `/exams` in `src/App.jsx`, link in `src/components/layout/Sidebar.jsx`, and assessment card in `src/pages/Home.jsx`.
- Rectification Required:
  - Completely remove `/exams` route from `App.jsx`.
  - Remove `Exam Planner` navigation item from `Sidebar.jsx`.
  - Remove the "Upcoming Assessment / Exam Planner" card from `Home.jsx`.
  - Remove any button or link navigating to `/exams`.
  - Safely preserve existing database schema and tables (no destructive drops) while ensuring zero user-facing exposure.

---

## H. SUPABASE ARCHITECTURE
- Connected through `src/services/supabaseClient.js` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- 13 tables defined in `supabase/schema.sql` with RLS policies.
- Data service (`dataService.js`) maintains an authoritative dual-layer pattern: Supabase primary with localStorage fallback.
- **Preservation Assurance**: Database connection and tables will not be dropped, reset, or broken.

---

## I. VERCEL ARCHITECTURE
- Deployment configuration in `vercel.json` with SPA catch-all rewrite to `/index.html` and `/api/(.*)` to `/api/$1`.
- Serverless proxy in `api/chat.js`.
- Production build confirmed passing via Vite 8.
- Configuration will remain intact without breaking deployments.

---

## J. FILES THAT MUST CHANGE
1. `src/components/layout/MobileNav.jsx` — Rebuilt as fixed bottom bar: **Home | Learn | Roadmap | Career | More**.
2. `src/components/layout/Sidebar.jsx` — Hidden strictly on mobile (`<= 768px`); preserved on desktop.
3. `src/components/layout/Header.jsx` — Integrated with More drawer; mobile-compact actions.
4. `src/components/layout/MoreDrawer.jsx` (NEW) — Bottom sheet / drawer for secondary features (Attendance, Habits, Performance, Profile, AI Mentor, Settings).
5. `src/components/chat/FloatingChatbot.jsx` — Relocated above bottom nav; mobile-safe viewport sizing.
6. `src/styles/variables.css` & `src/styles/index.css` — Safe-area insets, fixed bottom nav tokens, content padding offsets, responsive grid resets.
7. `src/pages/GoalCareer.jsx` — Stripped of edit controls; converted to clean VIEW-ONLY career pathway dashboard.
8. `src/pages/Settings.jsx` — Upgraded with dedicated "Career & Goals" editing section and roadmap adaptation prompt.
9. `src/pages/Home.jsx` — Mobile hierarchy overhaul; Exam Planner card removed; rigid grids replaced.
10. `src/pages/Roadmap.jsx` — View toggles (Weekly, Monthly, Yearly), removal of "Change Goal" edit button, mobile milestone detail modal with "Already Know This" adaptation confirmation.
11. `src/pages/Academic.jsx` — Attendance Quick Calculator + What-if Simulator; status badges for syllabus.
12. `src/pages/Learn.jsx` (NEW) — Mobile hub uniting Curriculum, Study Velocity, and Assignments.
13. `src/App.jsx` — Exam Planner route removed; Learn route added.

---

## K. FILES THAT MUST NOT CHANGE
- `supabase/schema.sql` (no destructive database migrations)
- `vercel.json` (deployment routing preserved)
- `src/services/supabaseClient.js` (connection intact)
- `api/chat.js` (serverless endpoint intact)
- Core auth and security modules

---

## L. RISKS & MITIGATION
| Risk | Severity | Mitigation |
|---|---|---|
| Floating bottom nav obscures page content | High | Add `padding-bottom: calc(var(--mobile-nav-height) + env(safe-area-inset-bottom, 0px) + 24px)` to `.page-content` and `.main-content`. |
| Navigation overlap between desktop and mobile | High | Enforce strict media queries: Desktop sidebar `display: none !important` on `<= 768px`; Bottom nav `display: none !important` on `> 768px`. |
| Career goal change breaks active roadmap | Medium | Provide interactive modal `[Update Roadmap]` vs `[Keep Current Roadmap]` so changes are explicit, controlled, and synchronized. |
| Removing Exam Planner causes runtime import errors | Medium | Cleanly decouple all imports in `App.jsx`, `Sidebar.jsx`, and `Home.jsx` before building. |

---

## M. IMPLEMENTATION SEQUENCE
1. **Phase 1**: Mobile foundation in CSS (`variables.css`, `index.css`) with bottom nav height, safe-area insets, and responsive grids.
2. **Phase 2**: Fixed Bottom Navigation (`MobileNav.jsx`) with 5 tabs: **Home | Learn | Roadmap | Career | More** + `MoreDrawer.jsx`.
3. **Phase 3**: Remove Exam Planner completely from `App.jsx`, `Sidebar.jsx`, and `Home.jsx`.
4. **Phase 4**: Make `GoalCareer.jsx` strictly VIEW-ONLY; move all Career & Goal editing to `Settings.jsx` with real downstream adaptation.
5. **Phase 5**: Create `Learn.jsx` hub uniting Curriculum, Study Velocity, and Assignments.
6. **Phase 6**: Refactor `Home.jsx` (Command Center) for mobile hierarchy ("How am I doing?", "What matters today?", "What should I do next?").
7. **Phase 7**: Refactor `Roadmap.jsx` with Weekly/Monthly/Yearly views and Knowledge-Aware Adaptation.
8. **Phase 8**: Refactor `Academic.jsx` for Attendance Quick Calculator + What-If Simulator.
9. **Phase 9**: Refactor `FloatingChatbot.jsx` to prevent screen collisions.
10. **Phase 10**: Production build verification (`npm run build`) and responsive QA across 360px, 375px, 390px, 412px, 430px, 768px, 1024px, 1280px+.
