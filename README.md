# Quizzical — Production MERN Quiz Platform

A modern, production-grade full-stack online quiz platform built with **MongoDB, Express.js, React (Vite), Node.js, Mongoose, JWT, and bcryptjs**.

Quizzical features role-based access control (**Admin** and **Student**), public/private quiz visibility, start-time scheduling and access deadlines, server-side duration verification, cheat-proof server-side score calculation, tiebreaker leaderboards, and a clean editorial design system.

---

## 🎨 Design System & Visual Identity

Quizzical uses a focused, high-contrast, editorial visual design with a warm cream canvas, deep forest green primary accents, and gold highlight badges.

### Color Tokens
```css
:root {
  --bg: #F6F4EE;            /* Warm cream page background */
  --card: #FFFFFF;          /* Pure white card backgrounds */
  --border: #DDD8CB;        /* Subtle warm gray-beige borders */
  --text: #14231D;          /* Deep navy-forest typography */
  --text-muted: #4B5A52;    /* Slate-green secondary text */
  --primary: #1F5F4A;       /* Deep forest green for primary actions & active states */
  --primary-hover: #174A3A; /* Darker forest green hover state */
  --primary-soft: #E4EFE9;  /* Soft sage green for tags and secondary badges */
  --accent: #E9B949;        /* Warm gold for trophy highlights & rank badges */
  --easy: #3F7D58;          /* Green badge for easy difficulty */
  --medium: #B7791F;        /* Amber badge for medium difficulty */
  --hard: #B23A3A;          /* Crimson badge for hard difficulty */
}
```

### Typography
- **Headings & Titles**: `Fraunces` (Serif, weights 600, 700) — distinctive editorial hierarchy for page headers, hero typography, and quiz titles.
- **Body & Controls**: `DM Sans` (Sans-Serif, weights 400, 500, 700) — clean legibility for paragraphs, navigation links, forms, and inputs.
- **Data & Timers**: `JetBrains Mono` (Monospace, weights 500, 600) — tabular alignment for countdown timers, quiz codes, and durations.

---

## 🚀 Key Features

### 🔐 Authentication & Role-Based Access Control
- **Stateless JWT Authentication**: Secure tokens stored in `localStorage` with automated expiration handling and Axios request interceptors.
- **Secure Password Hashing**: Passwords salted and hashed with `bcryptjs` (never stored in plain text, omitted from queries and responses).
- **Multi-Admin Support**: Any user with the server registration secret (`ADMIN_REGISTRATION_SECRET`) can register as an Admin. Multiple admins manage independent quiz inventories.
- **Protected Routes**: React router guards (`ProtectedRoute`, `AdminRoute`) paired with Express middlewares (`requireAuth`, `requireAdmin`).

### ⏱️ Visibility & Scheduling System
- **Public vs. Private Quizzes**:
  - **Public**: Discoverable on the catalog/explore page and student dashboard. Any enrolled student can join.
  - **Private**: Hidden from public catalogs. Students can only access the quiz by entering its unique 8-character code via Quick Join.
- **Scheduled Start Time (`scheduledStartTime`)**: Quizzes set for a future timestamp display a "Scheduled" status badge and cannot be attempted until the start time arrives.
- **Access Deadline (`accessDeadline`)**: Quizzes past their deadline automatically transition to "Expired" and close to new attempts.
- **Virtual Lifecycle Status**: Quizzes dynamically compute their status on the server:
  - `draft`: `isPublished === false`
  - `scheduled`: Scheduled for a future timestamp (`Date.now() < scheduledStartTime`)
  - `expired`: Past access deadline (`Date.now() > accessDeadline`)
  - `active`: Ready for attempts

### 🛡️ Anti-Cheat & Timed Submissions
- **Zero Client Answer Exposure**: Correct options and explanations are stored exclusively in MongoDB. During active attempts, the API sends only question prompts and options.
- **Server-Side Timer Verification**: The server records the exact attempt start time (`startedAt`). Remaining seconds are calculated dynamically on the server (`remainingSeconds = totalSeconds - elapsedSeconds`).
- **Automatic Submission**: Frontend auto-submits when the countdown reaches `00:00`. The server also rejects attempts exceeding quiz duration plus a grace window.
- **Single Attempt Enforcement**: Prevents candidate re-attempts for the same quiz.

### 🏆 Results & Tiebreaker Leaderboard
- **Detailed Question Review**: Candidates view their percentage score, accuracy, time taken, correct/incorrect choices, and comprehensive explanations after submission.
- **Two-Tier Leaderboard Ranking**:
  1. **Primary Sort**: Higher total score.
  2. **Secondary Sort**: Lower completion time (seconds) breaks ties.
  3. Visual rank medals (🥇 Gold, 🥈 Silver, 🥉 Bronze) with custom highlight for the logged-in user.

---

## 📁 Project Structure

```text
mern-quiz-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Signup, login, logout, getMe
│   │   │   ├── quizController.js     # Quiz CRUD, join, attempt, submit, update
│   │   │   └── resultController.js   # My results, attempt details, leaderboard
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification middleware
│   │   │   └── roleMiddleware.js     # Admin authorization middleware
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt password hashing
│   │   │   ├── Quiz.js               # Quiz schema with visibility, schedule, virtual status
│   │   │   ├── QuizAttempt.js        # Tracks in-progress attempts and start time
│   │   │   └── QuizResult.js         # Final graded score, accuracy, and detailed answers
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth endpoints
│   │   │   ├── quizRoutes.js         # /api/quizzes endpoints
│   │   │   └── resultRoutes.js       # /api/results & /api/leaderboard endpoints
│   │   ├── seed/
│   │   │   └── seed.js               # Database seeder with sample quizzes and users
│   │   └── server.js                 # Express application initialization & middleware
│   ├── .env                          # Backend environment variables
│   ├── .env.example                  # Example environment template
│   ├── package.json
│   └── server.js                     # Root entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx            # Responsive navigation with role-aware links
    │   │   ├── ProtectedRoute.jsx    # Authentication route guard
    │   │   └── AdminRoute.jsx        # Admin role route guard
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global auth state & token management
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx         # Clean login form
    │   │   │   └── Signup.jsx        # Registration with optional Admin key
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx# Metrics, quiz management links, recent activity
    │   │   │   ├── CreateQuiz.jsx    # Create/edit quiz with visibility & scheduling
    │   │   │   ├── AdminQuizzes.jsx  # Inventory list, copy code, delete & edit actions
    │   │   │   └── QuizResults.jsx   # Candidate submission records & details
    │   │   ├── user/
    │   │   │   ├── UserDashboard.jsx # Personalized stats, recent quizzes, quick code entry
    │   │   │   ├── JoinQuiz.jsx      # Dedicated code validation and join portal
    │   │   │   ├── QuizAttempt.jsx   # Timed quiz interface with question palette
    │   │   │   ├── QuizResultPage.jsx# Score breakdown & question review
    │   │   │   ├── QuizLeaderboard.jsx# Tiebreaker leaderboard with medal ranks
    │   │   │   └── Profile.jsx       # User profile details and stats
    │   │   └── Home.jsx              # Explore catalog with search & category filters
    │   ├── routes/
    │   │   └── AppRoutes.jsx         # Client-side routing configuration
    │   ├── services/
    │   │   ├── api.js                # Axios instance with auth headers & error interceptor
    │   │   ├── authService.js        # Auth API calls
    │   │   ├── quizService.js        # Quiz API calls (create, edit, fetch, join, submit)
    │   │   └── resultService.js      # Results and leaderboard API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css                 # Global CSS variables & design tokens
    ├── index.html                    # Google Fonts preconnect (Fraunces, DM Sans, JetBrains Mono)
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizapp
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_mern_quiz_2026
JWT_EXPIRES_IN=7d
ADMIN_REGISTRATION_SECRET=admin_secret_quiz_app_2026
NODE_ENV=development
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register student or admin (`adminSecretKey` required for admin) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/logout` | Public | Invalidate client session token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of the logged-in user |

### Quizzes (`/api/quizzes`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/quizzes` | Authenticated | List active quizzes (supports `search`, `category`, `difficulty`, `visibility`) |
| `POST` | `/api/quizzes/join` | Authenticated | Validate code, check schedule/deadline, return quiz info |
| `GET` | `/api/quizzes/:id` | Authenticated | Fetch quiz details and metadata |
| `GET` | `/api/quizzes/:id/attempt` | Authenticated | Start/resume attempt with server remaining time (no answers sent) |
| `POST` | `/api/quizzes/:id/submit` | Authenticated | Grade answers server-side, calculate score, persist result |
| `POST` | `/api/quizzes` | Admin Only | Create new quiz with unique 8-character code, visibility & schedule |
| `PUT` | `/api/quizzes/:id` | Admin Only | Update existing quiz metadata, schedule, visibility, or questions |
| `GET` | `/api/quizzes/admin/my` | Admin Only | List all quizzes created by the logged-in admin with statistics |
| `DELETE` | `/api/quizzes/:id` | Admin Only | Delete quiz and cascade-delete attempts and results |

### Results & Leaderboard (`/api/results` & `/api/leaderboard`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/results/my` | Authenticated | Retrieve history of quiz attempts for the logged-in user |
| `GET` | `/api/results/detail/:id` | Authenticated | Detailed review of an individual test attempt |
| `GET` | `/api/results/:quizId` | Admin / Owner | View all student submissions and scores for a specific quiz |
| `GET` | `/api/leaderboard/:quizId` | Authenticated | Fetch tiebreaker leaderboard sorted by score (desc) and time (asc) |

---

## 🗄️ Database Schemas

### `Quiz` Schema
```javascript
{
  title: { type: String, required: true },
  description: { type: String, default: '' },
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g. MERN4821
  creator: { type: ObjectId, ref: 'User', required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  duration: { type: Number, required: true, min: 1 }, // in minutes
  totalMarks: { type: Number, default: 0 },
  passMarks: { type: Number, default: 0 },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  isPublished: { type: Boolean, default: true },
  scheduledStartTime: { type: Date, default: null },
  accessDeadline: { type: Date, default: null },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true, min: 0, max: 3 }, // Omitted in attempt queries
    marks: { type: Number, default: 1 },
    explanation: { type: String, default: '' }
  }],
  // Virtual field: status ('draft' | 'scheduled' | 'expired' | 'active')
}
```

### `QuizResult` Schema
```javascript
{
  quiz: { type: ObjectId, ref: 'Quiz', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },
  unanswered: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // in seconds (used for leaderboard tiebreaker)
  submittedAt: { type: Date, default: Date.now },
  answers: [{
    questionId: { type: ObjectId, required: true },
    selectedOption: { type: Number, default: -1 },
    isCorrect: { type: Boolean, required: true },
    marksAwarded: { type: Number, required: true }
  }]
}
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas cluster URI

### 2. Backend Installation & Run
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Seed initial users, sample quizzes, and leaderboard results
npm run seed

# Start server in development mode (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Installation & Run
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite React development server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Default Seed Credentials

After running `npm run seed` in the backend, you can sign in immediately using these pre-configured accounts:

| Role | Email | Password | Pre-seeded Quiz Codes |
|---|---|---|---|
| **Admin** | `admin@quizapp.com` | `Admin@12345` | Manages `MERN4821`, `JSES6101` |
| **Student** | `rahul@quizapp.com` | `User@12345` | Can take any public quiz or enter code |
| **Student** | `priya@quizapp.com` | `User@12345` | Can take any public quiz or enter code |

> [!NOTE]
> To register a new **Admin** account through the signup page, enter `admin_secret_quiz_app_2026` in the **Admin Secret Key** field.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
