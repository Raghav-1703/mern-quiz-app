# Quizzical — MERN Quiz Application

A full-stack quiz app built with **MongoDB, Express, React (Vite), and Node.js**.
Players pick a quiz, race a per-question countdown, and land on a leaderboard —
answers are graded server-side so the correct answers never ship to the browser
ahead of time.

## Features

- Quiz list with category and difficulty tags
- Timed questions with an animated countdown ring
- Server-side grading (correct answers are never sent to the client until after submit)
- Score summary with a full answer-by-answer review and explanations
- Per-quiz leaderboard (top 10 scores)
- Seed script with 3 sample quizzes (15 questions total)

## Project structure

```
mern-quiz-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/quizController.js
│   ├── models/Quiz.js
│   ├── models/Score.js
│   ├── routes/quizRoutes.js
│   ├── seed/seed.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/api.js
    │   ├── components/TimerRing.jsx
    │   ├── components/DotProgress.jsx
    │   ├── pages/Home.jsx
    │   ├── pages/QuizPage.jsx
    │   ├── pages/ResultPage.jsx
    │   ├── pages/Leaderboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env if your MongoDB URI or port differs
npm run seed   # loads 3 sample quizzes into the database
npm run dev    # starts the API on http://localhost:5000
```

Key endpoints:

| Method | Route                          | Description                              |
|--------|---------------------------------|-------------------------------------------|
| GET    | /api/quizzes                   | List quizzes (no answers included)        |
| GET    | /api/quizzes/:id                | Get one quiz's questions (no answers)     |
| POST   | /api/quizzes                   | Create a quiz                              |
| POST   | /api/quizzes/:id/submit         | Grade answers, save a score, return review |
| GET    | /api/quizzes/:id/leaderboard     | Top 10 scores for a quiz                   |
| DELETE | /api/quizzes/:id                | Delete a quiz                              |

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev    # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so just
open http://localhost:5173 once both servers are running.

## 3. Build for production

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (or add `express.static` to
`backend/server.js`) and point `CLIENT_ORIGIN` in `.env` at that origin.

## Adding your own quizzes

Either extend `backend/seed/seed.js` and re-run `npm run seed`, or POST directly
to `/api/quizzes` with a body like:

```json
{
  "title": "JavaScript Fundamentals",
  "category": "Programming",
  "difficulty": "medium",
  "description": "Closures, hoisting, and the event loop.",
  "timePerQuestion": 20,
  "questions": [
    {
      "text": "What does `typeof null` return?",
      "options": ["'null'", "'undefined'", "'object'", "'number'"],
      "correctIndex": 2,
      "explanation": "It's a long-standing JavaScript quirk."
    }
  ]
}
```

## Deploying it live

You need three things running somewhere other than your laptop: the database,
the API, and the built frontend. The simplest free path deploys all of it as
**one Render web service** (Render builds the React app and Express serves it).

### 1. Database — MongoDB Atlas
Create a free M0 cluster (see the walkthrough above) and copy its
`mongodb+srv://...` connection string. You'll paste this into Render as an
environment variable, not into any file you commit.

### 2. Push the code to GitHub
Render (and any host) deploys from a Git repo:
```bash
cd mern-quiz-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/quizzical.git
git push -u origin main
```

### 3. Backend + frontend together — Render
1. Go to [render.com](https://render.com) → New → **Web Service** → connect your GitHub repo.
   (This repo already includes a `render.yaml`, so Render can auto-detect these settings via "New → Blueprint" instead, if you prefer.)
2. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build` (this also builds the React app — see the `build` script in `backend/package.json`)
   - **Start Command:** `npm start`
3. Add environment variables in Render's dashboard:
   - `MONGO_URI` → your Atlas connection string
   - `NODE_ENV` → `production`
   - `CLIENT_ORIGIN` → your Render URL once you have it (e.g. `https://quizzical.onrender.com`)
4. Deploy. Render gives you a public URL — that's your live app, frontend and API together on one origin, so CORS barely matters.
5. Seed the live database once: in Render's dashboard, open a shell for the service and run `npm run seed`, or run it locally with `MONGO_URI` temporarily pointed at your Atlas cluster.

### Alternative: split hosting (Vercel + Render)
If you'd rather host the frontend on Vercel/Netlify and the API separately on Render:
- Deploy `backend` to Render as its own service (root directory `backend`, build `npm install`, start `npm start`, **skip** the frontend build step). Set `NODE_ENV` to anything other than `production`... actually leave it unset so the static-serving block in `server.js` is skipped.
- Deploy `frontend` to Vercel: root directory `frontend`, framework preset "Vite", build command `npm run build`, output directory `dist`.
- In Vercel, add an environment-driven rewrite or just point `frontend/src/api/api.js`'s `baseURL` at your Render API URL (e.g. `https://quizzical-api.onrender.com/api`) instead of the relative `/api` proxy path used for local dev.
- On the Render backend, set `CLIENT_ORIGIN` to your Vercel URL so CORS allows it.

Either path works — one service is simplest to manage, two services scale and redeploy independently.

## Notes

- No authentication is included — `playerName` is just a display name typed in
  before a score is saved. Add JWT auth in `backend` if you need real accounts.
- CORS is restricted to `CLIENT_ORIGIN` from `.env`; update it for deployment.
- Free-tier Render services spin down when idle and take ~30-60s to wake up on
  the first request after a period of inactivity — normal for a demo/hobby deploy.
