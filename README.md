# Quizzical — Production MERN Quiz Application

A production-quality full-stack online quiz platform built with **MongoDB, Express.js, React (Vite), Node.js, Mongoose, JWT, and bcryptjs**.

Features complete role-based authentication (**Admin** and **User**), automatic unique quiz-code generation, countdown timer with server-side duration verification, server-side score calculation (where answers are never exposed to the client), tiebreaker leaderboard ranking, and responsive UI.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **JWT Stateless Authentication**: Secure token generation with configurable expiration (`JWT_EXPIRES_IN`).
- **Password Hashing**: Strong salting and hashing with `bcryptjs`. Passwords never stored in plain text and stripped from responses.
- **Strict Role Authorization**: Public signup defaults to `user`. Creating an `admin` account requires a secret server key (`ADMIN_REGISTRATION_SECRET`).
- **Endpoint Protection**: `requireAuth` and `requireAdmin` middlewares guarding APIs and routes.
- **Answer Security**: Correct answers are stored exclusively in MongoDB and never sent to candidates before submission.
- **Duplicate Submission Protection**: Backend rejects duplicate attempts for the same quiz.

### 👑 Admin Experience
- **Admin Dashboard**: Real-time counts of quizzes authored, total student participants, and average scores.
- **Dynamic Quiz Creator**: Build quizzes with custom titles, categories, difficulty, duration (minutes), marks, and explanations.
- **Unique Quiz Code Generation**: Automatically generates and enforces unique uppercase quiz codes (e.g. `MERN4821`).
- **Quiz Inventory & Management**: Copy quiz codes with one click, inspect candidate attempts, and safely delete quizzes with cascading cleanups.
- **Participant Submissions Review**: View candidate name, email, score, accuracy, time taken, and detailed answers.

### 🎓 Student / User Experience
- **Quick Code Join System**: Jump directly into a test session by entering a quiz code (e.g. `MERN4821`).
- **Student Dashboard**: Welcome area, recent quiz scores, accuracy %, and quick join tools.
- **Timed Quiz Interface**:
  - Real-time countdown timer using React hooks.
  - Interactive question palette & status indicators.
  - Option selection, clear choice, previous/next controls.
  - Submit confirmation dialog.
  - Automatic submission when the timer reaches `00:00`.
- **Server-Side Validation**: Backend calculates elapsed time and grades each response against database answers.
- **Results Page**: Circular score percentage ring, correct vs incorrect counts, time taken, and question-by-question review with explanations.
- **Leaderboard**:
  - **1st priority**: Higher score.
  - **2nd priority**: Lower completion time breaks ties.
  - Ranked medals (🥇, 🥈, 🥉) and highlighting for the current user.

---

## 📁 Project Structure

```text
mern-quiz-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── quizController.js
│   │   │   └── resultController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Quiz.js
│   │   │   ├── QuizAttempt.js
│   │   │   └── QuizResult.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── quizRoutes.js
│   │   │   └── resultRoutes.js
│   │   ├── seed/
│   │   │   └── seed.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── AdminRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Signup.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── CreateQuiz.jsx
    │   │   │   ├── AdminQuizzes.jsx
    │   │   │   └── QuizResults.jsx
    │   │   ├── user/
    │   │   │   ├── UserDashboard.jsx
    │   │   │   ├── JoinQuiz.jsx
    │   │   │   ├── QuizAttempt.jsx
    │   │   │   ├── QuizResultPage.jsx
    │   │   │   ├── QuizLeaderboard.jsx
    │   │   │   └── Profile.jsx
    │   │   └── Home.jsx
    │   ├── routes/
    │   │   └── AppRoutes.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── quizService.js
    │   │   └── resultService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizapp
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_mern_quiz_2026
JWT_EXPIRES_IN=7d
ADMIN_REGISTRATION_SECRET=admin_secret_quiz_app_2026
NODE_ENV=development
```

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register student or admin with secret key |
| POST | `/api/auth/login` | Public | Authenticate user & receive JWT |
| POST | `/api/auth/logout` | Public | Invalidate client session |
| GET | `/api/auth/me` | Authenticated | Fetch current user profile |

### Quizzes (`/api/quizzes`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/quizzes` | Authenticated | List all active quizzes (metadata only) |
| POST | `/api/quizzes/join` | Authenticated | Validate quiz code & check eligibility |
| GET | `/api/quizzes/:id` | Authenticated | Fetch quiz summary |
| GET | `/api/quizzes/:id/attempt` | Authenticated | Start/resume attempt with server timer (no answers) |
| POST | `/api/quizzes/:id/submit` | Authenticated | Grade answers server-side & compute score |
| POST | `/api/quizzes` | Admin Only | Author new quiz & generate unique code |
| GET | `/api/quizzes/admin/my` | Admin Only | List quizzes created by logged-in admin with stats |
| DELETE | `/api/quizzes/:id` | Admin Only | Remove quiz and its submission records |

### Results & Leaderboard (`/api/results` & `/api/leaderboard`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/results/my` | Authenticated | Fetch logged-in user's test results |
| GET | `/api/results/detail/:id` | Authenticated | Detailed review of an individual test attempt |
| GET | `/api/results/:quizId` | Admin / Owner | All participant submissions for a quiz |
| GET | `/api/leaderboard/:quizId` | Authenticated | Tiebreaker leaderboard sorted by score & time |

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18+
- **MongoDB**: Local MongoDB community service (`mongodb://127.0.0.1:27017`) or Atlas connection URI.

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds sample admin, users, quizzes (MERN4821, JSES6101), and results
npm run dev      # Starts Express server on port 5000
```

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5173
```

---

## 🧪 Default Test Credentials

| Role | Email | Password | Quiz Code |
|---|---|---|---|
| **Admin** | `admin@quizapp.com` | `Admin@12345` | Can create & manage any quiz |
| **Student** | `rahul@quizapp.com` | `User@12345` | `MERN4821` |
| **Student** | `priya@quizapp.com` | `User@12345` | `JSES6101` |
