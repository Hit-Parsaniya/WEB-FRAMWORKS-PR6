# Practical 6: Full Stack Integration (React + Node + MongoDB)

| Course Details | Information |
| :--- | :--- |
| **Course / Subject** | Advanced Web Development Frameworks (ITUE301) |
| **Practical Number** | Practical 6 |
| **CO / PO Mapping** | **CO1, CO2** / **PO3, PO5** |
| **Objective** | Wire the React frontend to the Node/Express/MongoDB backend into a fully functional, synchronized full-stack application. |
| **Prerequisites** | Practicals 1–3 (React UI, Routing, API consumption) & Practicals 4–5 (Node/Express/MongoDB CRUD API) |
| **Self-Study Reference** | IBM: Node.js & MongoDB Developing Back-end Database Applications, Module 3 (*Connecting Frontend to Backend, End-to-End API Calls*) |

---

## 1. System Architecture & Flow Diagram

The application follows a decoupled client-server architecture where the React Single Page Application (SPA) communicates asynchronously with the Express REST API via HTTP requests, persisting records in a MongoDB database.

```text
  React Frontend                         Express Backend                     MongoDB Database
 (localhost:5173)                       (localhost:5000)                     (localhost:27017)
        │                                      │                                     │
        │── 1. User submits task ─────────────>│                                     │
        │   POST /tasks (JSON Payload)         │── 2. Validate & Mongoose Model ────>│
        │                                      │   Task.create(req.body)             │
        │   [Optimistic UI: item appears]      │                                     │
        │                                      │<─ 3. Document saved with _id ───────│
        │<─ 4. HTTP 201 Created ───────────────│                                     │
        │   (Returns saved document)           │                                     │
        │                                      │                                     │
        │── 5. State synchronized in React ────│                                     │
        │   (Temp ID replaced by server _id)   │                                     │
        │   [Toast notification displayed]     │                                     │
        │                                      │                                     │
        │── 6. Browser Reload (Persistence) ──>│                                     │
        │   GET /tasks                         │── 7. Query all documents ──────────>│
        │<─ 8. HTTP 200 OK (Array of tasks) ───│<─ 9. Return tasks from DB ──────────│
```

### Complete End-to-End Lifecycle Flow
1. **User Action**: User fills out the task creation form and clicks "Add Task".
2. **Optimistic Rendering**: The UI displays the task immediately with a temporary identifier (`temp-*`) and marks it as pending.
3. **API Dispatch**: `createTask()` in `src/api.js` fires an asynchronous `fetch` `POST` request to `http://localhost:5000/tasks`.
4. **Backend Processing**: Express parses the JSON body, verifies authorization headers, validates data, and persists the record into MongoDB via Mongoose.
5. **State Reconciliation**: On HTTP `201 Created`, the temporary task in React state is replaced with the permanent MongoDB document containing `_id`, `createdAt`, and `updatedAt`.
6. **Error Rollback**: If the network or server fails (e.g., HTTP 400 or 500), React rolls back the optimistic state, removes the temporary task, and displays an error toast notification with a retry option.

---

## 2. Key Analysis & Critical Questions

### Q1: What changes are required on the backend (CORS) to allow the React dev server to call the Express API?
* **Problem**: Modern web browsers enforce the **Same-Origin Policy (SOP)** for security. The React application runs on `http://localhost:5173` while Express runs on `http://localhost:5000`. Because the port numbers differ, the browser treats them as distinct origins and blocks cross-origin XMLHttpRequests/fetch calls unless the server explicitly grants permission.
* **Solution**: The backend must configure **Cross-Origin Resource Sharing (CORS)** middleware:
  ```bash
  npm install cors
  ```
  ```javascript
  const cors = require('cors');
  app.use(cors()); // Enables Access-Control-Allow-Origin: * for incoming requests
  ```
* **Preflight Requests**: For non-simple HTTP requests (such as `PUT`, `DELETE`, or requests carrying custom headers like `Authorization` and `Content-Type: application/json`), the browser automatically sends a preflight `OPTIONS` request. The `cors` package handles this by returning the necessary CORS response headers (`Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`).

---

### Q2: Why should the UI re-fetch or update local state after a successful POST/PUT/DELETE rather than assuming success silently?
1. **Server-Generated Fields**: The database assigns immutable system fields such as `_id`, timestamps (`createdAt`, `updatedAt`), and default model values that do not exist on the client side before persistence.
2. **Multi-User Synchronization**: Re-fetching or reconciling with server data prevents state drift, race conditions, and stale data when multiple users or tabs interact with the system.
3. **Integrity & Validation**: The server might transform, sanitize, or alter data during validation before writing to the database. The client must reflect the true database state, not merely what the user typed.

---

### Q3: What is the risk of not handling errors on write operations (POST/PUT/DELETE) the same way as read operations (GET)?
* **"Phantom State" (Desynchronization)**: If write operations fail silently, the frontend UI continues to show an item as created, updated, or deleted, while the database remains unchanged.
* **Data Loss on Refresh**: The moment the user refreshes the page, the "created" task vanishes or the "deleted" task reappears, leading to complete loss of user trust and confusion.
* **Actionable Recovery**: By handling errors on write operations, the application can display descriptive toast alerts, retain user input in the form, and provide a direct "Retry" button.

---

## 3. Repository Structure

```text
PR12/
├── backend/
│   ├── models/
│   │   ├── Task.js             # Mongoose schema and model for tasks
│   │   └── User.js             # User schema for authentication
│   ├── routes/
│   │   ├── tasks.js            # Express CRUD routes (/tasks, /tasks/:id)
│   │   └── auth.js             # Authentication routes (/auth/register, /auth/login)
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── validate.js         # Input validation middleware
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example            # Sample configuration template
│   ├── package.json            # Backend dependencies (express, mongoose, cors, dotenv)
│   └── server.js               # Express app initialization with CORS & MongoDB connection
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.jsx      # Controlled task input form with loading states
│   │   │   ├── TaskList.jsx      # Task rendering with status badges & action buttons
│   │   │   ├── ConfirmDialog.jsx # Modal confirmation dialog before deletion
│   │   │   └── Toast.jsx         # Non-intrusive notification banner for API feedback
│   │   ├── api.js              # Centralized API service with BASE_URL & fetch wrappers
│   │   ├── TaskManager.jsx     # Master state management (CRUD, optimistic UI, errors)
│   │   ├── App.jsx             # Root component with navigation & auth guards
│   │   ├── index.css           # Design tokens, responsive grid, and UI styles
│   │   └── main.jsx            # React 18 DOM mount point
│   ├── package.json            # Frontend dependencies (react, react-dom, vite)
│   └── vite.config.js          # Vite development configuration
│
└── PR6 README.md               # This documentation file
```

---

## 4. Step-by-Step Implementation Guide

### Step 1: Install and Configure CORS on Express Backend
Inside `backend/package.json`, ensure `cors` is installed and applied before any route definitions in `backend/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', require('./routes/tasks'));
```

### Step 2: Centralized API Service in React (`frontend/src/api.js`)
Create a single point of configuration for the backend base URL and helper fetch methods:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

export const getTasks = () => fetch(`${BASE_URL}/tasks`).then(handleResponse);
export const createTask = (task) =>
  fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  }).then(handleResponse);
export const updateTask = (id, updates) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).then(handleResponse);
export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  }).then(handleResponse);
```

### Step 3: Replace Practical 3 GitHub Fetch Logic with Backend `/tasks`
In `TaskManager.jsx`, remove the third-party GitHub API calls from Practical 3. Populate state on component mount via `getTasks()`:
```javascript
useEffect(() => {
  fetchTasks();
}, [fetchTasks]);
```

### Step 4: Task Creation Form with State Update (`POST /tasks`)
Wire `TaskForm.jsx` to dispatch `createTask(payload)` and immediately sync local state upon receiving HTTP 201 response.

### Step 5: Implement Update (`PUT`) and Delete (`DELETE`) Actions
- **Update**: Toggle completion status or modify task details, followed by state mapping or re-fetch.
- **Delete**: Remove the task from the list and delete the document in MongoDB via `DELETE /tasks/:id`.

### Step 6: Granular Loading and Error Handling
Ensure every API interaction (Fetch, Create, Update, Delete) maintains its own loading indicator and catch handler so the UI remains interactive.

### Step 7: Test and Verify MongoDB Persistence
1. Create tasks from the UI.
2. Edit their title or status.
3. Refresh the browser (`F5` or `Ctrl+R`).
4. Confirm all data persists directly from MongoDB.

---

## 5. Supplementary Problems Implemented

### 1. Optimistic UI Updates
When a user adds or edits a task, the task list updates instantly before the HTTP response resolves. If the request fails, the state automatically reverts to the previous snapshot, and an error toast notifies the user:
```javascript
// Example in TaskManager.jsx:
const tempId = `temp-${Date.now()}`;
const optimisticTask = { ...newTask, _id: tempId, isOptimistic: true };
setTasks((prev) => [optimisticTask, ...prev]);

try {
  const savedTask = await createTask(newTask);
  setTasks((prev) => prev.map((t) => (t._id === tempId ? savedTask : t)));
  showToast('Task created successfully!', 'success');
} catch (err) {
  setTasks((prev) => prev.filter((t) => t._id !== tempId));
  showToast(`Failed to create task: ${err.message}`, 'error');
}
```

### 2. Deletion Confirmation Dialog (`ConfirmDialog.jsx`)
Destructive actions are guarded by an interactive modal dialog that requires explicit user confirmation before issuing the `DELETE /tasks/:id` request.

### 3. Toast Notification Component (`Toast.jsx`)
A floating feedback toast component informs the user of successful operations (green) or network/database failures (red) with automatic auto-dismissal after 3 seconds.

---

## 6. API Specification Table

| Method | Endpoint | Request Body | Status Code | Description |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/tasks` | *None* | `200 OK` | Fetches all persisted tasks from MongoDB |
| `POST` | `/tasks` | `{ "title": "...", "description": "...", "priority": "..." }` | `201 Created` | Validates and stores a new task in MongoDB |
| `PUT` | `/tasks/:id` | `{ "title": "...", "completed": true }` | `200 OK` | Updates existing task fields by ObjectId |
| `DELETE`| `/tasks/:id` | *None* | `200 OK` | Removes the task document from MongoDB |

---

## 7. How to Run the Application Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm install
# Create .env if not already configured
npm run dev
```
*Output confirmation: `Server running on port 5000` & `Connected to MongoDB`.*

### Terminal 2: Frontend Server (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*Open your browser and navigate to: `http://localhost:5173`.*

---

## 8. Troubleshooting Guide

| Symptom | Likely Cause | Step-by-Step Fix |
| :--- | :--- | :--- |
| **CORS error in browser console** | `cors` middleware missing or registered after routes | Run `npm install cors` in `backend/`. Place `app.use(cors())` before any `app.use('/tasks', ...)` in `server.js`. |
| **`fetch failed` / `NetworkError`** | Backend server is not running or running on an unexpected port | Verify Express server is running in its terminal. Check if port 5000 is open and listening. |
| **UI shows stale data after edit/delete** | React state was not updated with the server response | Ensure `setTasks(...)` reconciles the returned updated task object or calls `fetchTasks()` after write operations. |
| **Data disappears after browser refresh** | Component only stored data in local memory; did not save to MongoDB | Check `GET /tasks` call in `useEffect()`. Confirm MongoDB service (`mongod`) is running and documents are saved in collection. |

---

## 9. Evaluation Rubrics & Viva Questions

| Evaluation Criteria | Max Marks | Description / Expectation |
| :--- | :---: | :--- |
| **Conceptual Understanding** | 2 | Ability to explain CORS, Same-Origin Policy, and client-server synchronization lifecycle. |
| **Implementation** | 4 | Clean, working full-stack code for all CRUD operations with proper directory separation. |
| **Correctness** | 2 | End-to-end flow works seamlessly; changes persist across page reloads in MongoDB. |
| **Reflection & Error Handling** | 1 | Loading spinners, error messages, rollback on failed writes, and troubleshooting documentation. |
| **Lab File & Presentation** | 1 | Complete documentation, clear commit history, and adherence to assignment specs. |
| **Total** | **10** | **Passing Threshold: 5 / 10 (50%)** |

### Common Viva Discussion Points:
1. *Why is CORS enforced by the browser and not by the server itself?*
2. *What happens during an HTTP preflight request (`OPTIONS`)?*
3. *Why is an optimistic UI update preferred for user experience, and what is the required fallback if the write fails?*
4. *How does Mongoose handle schema validation errors, and how does the frontend catch and display them?*
