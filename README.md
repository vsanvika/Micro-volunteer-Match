# ⚡ Micro-Volunteer Match — Turn 15 Minutes Into Impact

> **A full-stack, production-quality MERN application created for college hackathons and community impact.**

---

## 📌 Problem Statement & Concept

Many students and individuals want to contribute to their campus or local community but cannot commit to recurring 10-hour/week volunteer programs due to busy academic or work schedules. Conversely, campus clubs, NGOs, and individual students frequently need quick help with small 5 to 60-minute tasks (e.g. debugging a script, explaining a concept, designing a poster header, proofreading a document).

**Micro-Volunteer Match** solves this with the central concept:

> **"I have 15 minutes right now. What useful thing can I do?"**

---

## ✨ Features & Highlights

- **⚡ Time-Based Quick Filter**: Volunteers choose how much time they have (5, 10, 15, 30, 45, 60 mins) and immediately get matching micro-tasks.
- **🧠 Dual Smart Matching Engine**: Calculates weighted compatibility score (Skill 40%, Interest 20%, Availability 20%, Duration 10%, Preference 10%) with color-coded badges (*96% Excellent Match*).
- **🤖 LLM AI Integration & Fallback Engine**: Uses Google Gemini LLM API for semantic task matching, AI Assistant chat recommendations, and Smart Task Creator suggestions. Defaults to a rule-based engine if no API key is set.
- **💬 Real-Time Messaging**: Socket.IO powered live task chat between accepted volunteers and task requesters.
- **🔔 Live Notifications**: Real-time notifications for new high-match tasks, applicant acceptance, completion confirmation, and badge unlocks.
- **🏆 Gamification**: Earn points (+15 pts for 15-min tasks), maintain daily volunteer streaks (🔥 7-Day Streak), unlock 6+ achievement badges, and climb the platform leaderboard.
- **📊 Impact & Personal Analytics**: Visually stunning charts using Recharts displaying platform-wide volunteer minutes logged, tasks completed over time, category distribution, and requested skills.
- **🛡️ Safety & Admin Moderation**: User reporting, administrative user suspension, task moderation, and report resolution.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, Lucide React, Recharts, Framer Motion, Axios, Socket.IO Client, React Hot Toast |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ODM, JWT Auth, BcryptJS, Socket.IO Server |
| **AI Integration** | Google Gemini LLM API with Rule-Based Fallback Matching Engine |

---

## 📁 Repository Structure

```
micro-volunteer/
├── backend/
│   ├── config/          # Database connection & constants
│   ├── controllers/     # Auth, Task, Application, Matching, AI, Admin, Gamification
│   ├── middleware/      # JWT auth, Role authorization, Central error handler
│   ├── models/          # User, Task, Application, Category, Skill, Badge, Notification, etc.
│   ├── routes/          # REST API route handlers
│   ├── seed/            # Seed data script populating 15+ users & 25+ tasks
│   ├── services/        # Matching engine, AI service, Socket.IO service
│   ├── server.js        # Main Express server entry point
│   ├── .env.example     # Environment variable documentation
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Footer, TaskCard, TaskFilter, TimeQuickPicker, AI Modals, ChatDrawer
│   │   ├── pages/       # Landing, Volunteer Dashboard, Discovery, Detail, Create Task, Achievements, Impact, Admin
│   │   ├── services/    # Axios client & Socket.IO listener
│   │   ├── store/       # Zustand auth, task, and notification stores
│   │   ├── App.jsx      # React Router setup & protected route guards
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Quick Start Installation Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/micro-volunteer`) or MongoDB Atlas URI.

---

### Step 1: Clone & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment config
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/micro-volunteer
JWT_SECRET=micro_volunteer_match_hackathon_super_secret_jwt_key_2026
GEMINI_API_KEY=
```

---

### Step 2: Seed the Database

Populate realistic demo users, categories, badges, and 25+ micro-tasks:

```bash
cd backend
npm run seed
```

Output:
```text
[Seed]: Connected to MongoDB...
[Seed]: Cleared existing collections.
[Seed]: Created 8 Categories.
[Seed]: Created 6 Badges.
[Seed]: Created 8 Users.
[Seed]: Created 15 Tasks.
[Seed]: Database seeding complete!
```

---

### Step 3: Run Backend Server

```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

---

### Step 4: Setup & Run Frontend

```bash
cd ../frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
# Application running at http://localhost:3000
```

---

## 🔑 Demo Accounts for Presentation

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Volunteer (Student)** | `alex.volunteer@student.edu` | `password123` | CS student, 18 tasks completed, 420 mins logged, 860 pts |
| **Task Requester (Club)** | `sarah.requester@campus.edu` | `password123` | Campus Coding Club organizer |
| **Admin** | `admin@microvolunteer.org` | `password123` | Admin panel access to manage users & reports |

---

## 🚀 Hackathon Presentation Flow

1. **Open `http://localhost:3000`**: View the landing page ("Turn 15 Minutes Into Impact"), impact stats, and featured task cards.
2. **Interactive Time Quick Filter**: Click **"15 Mins"** on the hero time picker -> instantly filters tasks matching 15-minute availability.
3. **AI Assistant Chat**: Click **"AI Assistant"** in the top navbar -> ask *"I know Python and have 15 mins"* -> see recommended tasks from DB.
4. **Log in as Volunteer (`alex.volunteer@student.edu`)**:
   - View personalized dashboard with streak (🔥 7-Day Streak) and recommended tasks (*96% Match*).
   - Click a task -> View **Match Breakdown** (*"Why this is a great match..."*) -> Click **Apply**.
5. **Log in as Requester (`sarah.requester@campus.edu`)**:
   - Go to Requester Dashboard -> Click **Applicants** -> View volunteer match score -> Click **Accept Volunteer**.
   - Open **Task Chat** drawer -> Send real-time Socket message.
6. **Task Completion & Points**:
   - Volunteer marks task completed -> Requester clicks **Confirm Completion & Award Points** (giving 5 stars).
   - Volunteer receives **+15 points**, volunteer minutes updated, and **Badge Unlocked** notification pops up!
7. **Impact Dashboard & Admin Control**:
   - View Recharts visualizations for total volunteer minutes and skill distributions.
   - Log in as `admin@microvolunteer.org` -> view user management and safety reports.

---

## 🌐 Main REST API Endpoints

- `POST /api/auth/register` & `login`
- `GET /api/tasks` (Supports `search`, `category`, `maxDuration`, `sort`)
- `POST /api/tasks` (Create micro-task)
- `POST /api/application/tasks/:id/apply`
- `PUT /api/applications/:id` (Accept/reject applicant)
- `POST /api/application/tasks/:id/confirm` (Confirm & award points)
- `GET /api/matches/time-filter?minutes=15`
- `POST /api/ai/assistant` & `smart-task-creator`
- `GET /api/leaderboard`
- `GET /api/analytics/impact`
