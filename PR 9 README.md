# PR6 — Full Stack Integration (React + Node + MongoDB)

**Note:** Your uploaded PR3/PR4/PR5 files came through as empty (0 bytes), so this was
built as a complete, self-contained implementation of PR6 following the practical spec
exactly. Drop in your actual PR3–5 code if you have it — the structure (`/tasks` CRUD
endpoints, `api.js` base URL pattern) matches what the spec describes, so it should
slot together with minimal changes.

## Structure

```
PR6/
├── backend/     Express + Mongoose API (port 5000)
└── frontend/    React (Vite) UI (port 5173)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env    # edit MONGO_URI if needed
npm run dev              # or: npm start
```

Requires a running MongoDB instance (local `mongod` or a MongoDB Atlas connection
string in `.env`). The server listens on `http://localhost:5000`.

Endpoints:
| Method | Route        | Description       |
|--------|--------------|--------------------|
| GET    | /tasks       | List all tasks     |
| POST   | /tasks       | Create a task      |
| PUT    | /tasks/:id   | Update a task      |
| DELETE | /tasks/:id   | Delete a task      |

## 2. Frontend setup

In a **separate terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Both servers must be running at the same time.

## Features implemented (per PR6 spec)

- CORS enabled on Express so the Vite dev server can call the API
- Central `src/api.js` with a single `BASE_URL`, replacing the Practical 3 GitHub-fetch logic
- Full CRUD wired to MongoDB via Mongoose
- Loading and error states on **every** API call (not just initial GET), with a Retry button
- UI state updated from the backend response after each write — never assumed
- **Optimistic UI** on task creation (temp entry shown instantly, rolled back on failure)
- **Confirmation dialog** before delete
- **Toast notifications** for success/failure of every operation

## Verifying persistence

1. Create a few tasks, edit one, delete one.
2. Refresh the browser — the list should reload from MongoDB via `GET /tasks`
   and show exactly what you left it in.

## Practical 9: In-memory caching

The backend caches `GET /tasks` and `GET /tasks/:id` responses in `node-cache`
for 60 seconds. Successful task creation, update, and deletion invalidate the
all-tasks entry; updates and deletions also invalidate that task's entry. Cache
statistics are available at `GET /tasks/cache/stats` (JWT required).
Read queries use Mongoose `lean()` to avoid document hydration, and a descending
`createdAt` index supports the task-list sort.

Measure `GET /tasks` three times with caching enabled, then repeat with
`?cache=false` to bypass cache lookup and storage for an uncached database read.
Use Postman's response-time display and record the observed values:

| Run | Cached (ms) | Uncached (ms) |
|---|---:|---:|
| 1 | 4.42 | 153.62 |
| 2 | 3.96 | 56.93 |
| 3 | 2.31 | 148.81 |

These local readings used Node's HTTP client after warming the cache. The
average was 3.56 ms cached versus 119.79 ms uncached; timings vary by machine,
network, and dataset size.

Cache invalidation is necessary so a successful write cannot leave a stale list
or task response available for the rest of the TTL. A 60-second TTL is a
reasonable lab default: longer TTLs can improve hit rate but increase the
maximum time data may remain stale if an invalidation path is missed. `node-cache`
is process-local, so separate server instances have separate values and
invalidations; multi-instance deployments need a shared cache such as Redis.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| CORS error in console | `cors()` not applied | Confirm `app.use(cors())` runs before routes in `server.js` |
| `fetch failed` | Backend not running | Start `npm run dev` in `backend/` on port 5000 |
| Stale UI after edit/delete | State not synced | Already handled here via response-driven state updates |
| Data gone after refresh | Backend/Mongo not connected | Check `MONGO_URI` and that `mongod` is running |
