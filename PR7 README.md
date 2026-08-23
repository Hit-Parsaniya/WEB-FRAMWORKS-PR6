# PR7 — Authentication and Middleware Pipeline

Builds directly on PR6: same Task Manager, now with JWT-based auth protecting
every task route, bcrypt password hashing, and server-side input validation.

## What's new vs PR6

**Backend**
- `models/User.js` — email + bcrypt-hashed password (password never returned by default queries)
- `middleware/auth.js` — verifies `Authorization: Bearer <token>`, attaches `req.user`, returns 401 on missing/invalid/expired tokens (never crashes the server)
- `middleware/validate.js` — server-side validation for register, login, and task creation — runs even if the frontend already validated the same fields
- `routes/auth.js` — `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `routes/tasks.js` — all routes now go through `auth` middleware; `POST /tasks` also goes through `validateTask`
- `server.js` — refuses to start if `JWT_SECRET` isn't set in `.env`

**Frontend**
- `AuthContext.jsx` — holds the token/user, persists the token in `localStorage`, verifies it against `/auth/me` on load, and listens for a global "unauthorized" event
- `components/AuthForm.jsx` — combined login/register form
- `api.js` — every request now sends the JWT; any `401` response clears the token and fires a global event
- `App.jsx` — shows the login/register screen when logged out; redirects there automatically (with a "session expired" message) if a protected request ever comes back 401
- Logout button in the task manager header, clears the token client-side

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set a real `JWT_SECRET` (any long random string — never commit this).

```bash
npm run dev
```

Requires MongoDB running (local `mongod` or Atlas URI in `MONGO_URI`).

### Auth endpoints
| Method | Route         | Auth required | Description                         |
|--------|---------------|:--:|--------------------------------------|
| POST   | /auth/register | No | Create account (hashes password)     |
| POST   | /auth/login     | No | Verify password, returns a JWT       |
| GET    | /auth/me        | Yes | Returns the logged-in user's details |

### Task endpoints (all now require `Authorization: Bearer <token>`)
| Method | Route      |
|--------|------------|
| GET    | /tasks     |
| POST   | /tasks     |
| PUT    | /tasks/:id |
| DELETE | /tasks/:id |

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. You'll land on the login/register screen first —
register an account, then log in to reach the task manager.

## Testing in Postman (per the spec's Step 8)

1. `POST http://localhost:5000/auth/register` with JSON body `{ "email": "...", "password": "..." }`
2. `POST http://localhost:5000/auth/login` with the same body → copy the `token` from the response
3. On any `/tasks` request, add header `Authorization: Bearer <token>` (note the space after `Bearer`)
4. Try a `/tasks` request with no header, or a deliberately mangled token, and confirm you get a clean `401` instead of a server crash

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| 401 on every request | Missing/malformed `Authorization` header | Must be exactly `Authorization: Bearer <token>` |
| Server crashes on invalid token | (Already handled) `jwt.verify()` wrapped in try/catch | — |
| Login fails with correct password | Comparing plaintext to hash directly | Already uses `bcrypt.compare()` |
| `JWT_SECRET is undefined` | `.env` missing or key name mismatch | Confirm `.env` exists and `JWT_SECRET=` matches exactly |
| Frontend stuck on "Checking session..." | Backend not running / bad `MONGO_URI` | Check backend terminal for errors |
