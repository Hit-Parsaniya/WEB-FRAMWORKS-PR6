# Practical 8: Performance Optimization, Lazy Loading & Preloading in React

**Course**: ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Objective**: Improve frontend performance using lazy loading, code splitting, predictive preloading, and custom Rollup chunking techniques in React.

---

## 🏗️ Advanced Performance Architecture

```text
               ┌─────────────────────────────────────────────────────────┐
               │                Main Entry (index.js 7.96 kB)            │
               └───────────────────────────┬─────────────────────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
    [vendor-react.js]             [Route Chunks (Lazy)]         [vendor-recharts.js]
     (180 kB - Cached)          ┌───────────────────────┐       (382 kB - Loaded ONLY
                                │ TaskManager  (4.6 kB) │        when /analytics visited)
                                │ Projects     (1.1 kB) │
                                │ Contact      (1.3 kB) │
                                │ Analytics    (1.4 kB) │
                                └───────────────────────┘
                                     ▲ Hover Trigger
                               (Predictive Preloading)
```

---

## 📊 Performance Optimization Results

### Bundling & Chunk Breakdown (`vite.config.js` with Rollup `manualChunks`)

| Chunk File | File Size | Gzip Size | Optimization Role & Load Strategy |
| :--- | :---: | :---: | :--- |
| **`index.js`** | **7.96 kB** | 3.09 kB | Application bootstrap shell (Reduced from 187 kB) |
| **`vendor-react.js`** | **180.23 kB** | 59.07 kB | React core dependencies (Cached permanently in browser) |
| **`vendor-recharts.js`** | **382.52 kB** | 111.21 kB | Third-party chart engine (**Deferred 382 kB until Analytics visited**) |
| **`TaskManager.js`** | **4.62 kB** | 1.81 kB | Code-split tasks route chunk |
| **`Projects.js`** | **1.11 kB** | 0.56 kB | Code-split projects route chunk |
| **`Contact.js`** | **1.35 kB** | 0.63 kB | Code-split contact route chunk |
| **`Analytics.js`** | **1.41 kB** | 0.65 kB | Code-split analytics route chunk |
| **`HeavyChart.js`** | **0.93 kB** | 0.48 kB | Code-split heavy chart wrapper chunk |

---

## ⚡ Applied Performance Techniques

1. **Route-Based Code Splitting (`React.lazy()` & `Suspense`)**:
   - Every main route (`/`, `/projects`, `/analytics`, `/contact`) is lazily loaded on demand.

2. **Predictive Route Preloading on Hover (`onMouseEnter`)**:
   - Navigation links trigger `import()` on hover before the user clicks, enabling **0ms instantaneous route transitions**.

3. **Vendor Manual Chunking (`vite.config.js`)**:
   - `manualChunks` separates stable third-party libraries (`vendor-react`, `vendor-recharts`) from fast-changing application code to maximize browser HTTP caching.

4. **Component-Level Memoization (`React.memo`)**:
   - `TaskItem` inside `TaskList.jsx` is wrapped with `React.memo` to eliminate unnecessary re-renders when task states change.

5. **Minimum-Delay Suspense Fallback**:
   - Implemented `lazyWithMinDelay` (300ms threshold) in `Analytics.jsx` to prevent jarring UI flicker on high-speed connections.

---

## 🚀 How to Run the Application

### 1. Backend Server (`http://localhost:5000`)
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Server (`http://localhost:5173`)
```bash
cd frontend
npm install
npm run build   # Production bundle verification
npm run dev     # Development server
```

### 🔑 Demo Login Credentials
- **Email**: `admin@example.com`
- **Password**: `password123`
