# Practical 11: Containerization with Docker and Docker Compose

**Course**: ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**CO/PO Mapping**: CO5 / PO3, PO5  
**Objective**: Containerize the full-stack Task Management application using Docker and orchestrate all microservices using Docker Compose with a single command.

---

## 🏗️ Architecture & Network Diagram

```text
               +------------------------------------------------------+
               |                     HOST MACHINE                     |
               |                                                      |
               |  Browser / Client          Browser API Calls         |
               |         |                          |                 |
               +---------|--------------------------|-----------------+
                         | :5173                    | :5000
                         v                          v
+-----------------------------------------------------------------------------+
| DOCKER BRIDGE NETWORK: pr11_app_network                                     |
|                                                                             |
|   +-----------------------+              +-----------------------+          |
|   |   pr11-frontend       |              |   pr11-backend        |          |
|   |   (React / Vite)      |              |   (Express / Node)    |          |
|   |   Port: 5173          |              |   Port: 5000          |          |
|   |   Stage: Multi-Stage  |              |   Healthcheck: /health|          |
|   +-----------------------+              +-----------+-----------+          |
|                                                      |                      |
|                                    mongodb://mongodb:27017/taskdb           |
|                                                      |                      |
|                                                      v                      |
|                                          +-----------------------+          |
|                                          |   pr11-mongodb        |          |
|                                          |   (Official Mongo 6.0)|          |
|                                          |   Port: 27017         |          |
|                                          +-----------+-----------+          |
|                                                      |                      |
|                                          +-----------v-----------+          |
|                                          |   NAMED VOLUME        |          |
|                                          |   pr11_mongo_data     |          |
|                                          |   (/data/db)          |          |
|                                          +-----------------------+          |
+-----------------------------------------------------------------------------+
```

---

## ⚡ Quick Start: Running with Single Command

Ensure Docker Desktop or Docker Engine is running on your machine:

```bash
# 1. Clone / navigate to project root
cd PR11

# 2. Build images and start all 3 services in one command
docker-compose up --build

# (Optional: run in detached background mode)
docker-compose up -d --build
```

### Accessing the Running Services:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Healthcheck**: [http://localhost:5000/health](http://localhost:5000/health)
- **Backend Root Status**: [http://localhost:5000/](http://localhost:5000/)
- **MongoDB Database**: `mongodb://localhost:27017`

---

## 📦 Container Services Overview

| Service | Container Name | Image / Build Context | Port Mapping | Internal Role |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | `pr11-frontend` | `./frontend/Dockerfile` (Multi-stage) | `5173:5173` | React SPA built via Vite and served with `vite preview --host 0.0.0.0` |
| **`backend`** | `pr11-backend` | `./backend/Dockerfile` | `5000:5000` | Node.js Express REST API connected to MongoDB via service DNS |
| **`mongodb`** | `pr11-mongodb` | `mongo:6.0` (Official Image) | `27017:27017` | Persistent NoSQL database backed by named volume `mongo-data` |

---

## 🔍 Key Questions & Technical Analysis

### Q1: Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?
**Answer**:
1. In Docker, each container runs inside its own isolated network namespace with its own `localhost` (loopback interface `127.0.0.1`).
2. If `backend` tried to connect to `mongodb://localhost:27017`, it would search for a MongoDB daemon listening **inside the backend container itself**, causing connection refused (`ECONNREFUSED`).
3. When containers join a user-defined Docker bridge network (`app-network`), Docker runs an embedded internal DNS server (at `127.0.0.11`).
4. Docker DNS maps each Compose service name (e.g., `mongodb`) to the internal IP dynamically assigned to that container. Thus, `mongodb://mongodb:27017/taskdb` resolves seamlessly between containers.

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
**Answer**:
- **`EXPOSE <port>` (Dockerfile)**:
  - Serves primarily as **metadata/documentation** between the image author and user.
  - Informs Docker and developers that the application inside listens on that port.
  - **Does NOT publish or map** the port to the host machine. Without port publishing, host browsers cannot access it.
- **`ports: ["HOST:CONTAINER"]` (docker-compose.yml)**:
  - Actively configures host port forwarding and iptables/NAT rules.
  - Binds port `5173` on the host to port `5173` inside the container.
  - Allows external traffic from the host machine browser to reach the containerized service.

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
**Answer**:
1. **OS and CPU Architecture Incompatibilities**: Native binary C++ addons compiled on the host (e.g., Windows x64, macOS ARM64) will crash or fail to execute inside a Linux container (`GLIBC` / `musl` mismatch).
2. **Massive Build Context Overhead**: Copying gigabytes of host `node_modules` drastically slows down `docker build` context transfer.
3. **Layer Bloat & Cache Invalidation**: Host dependency updates will needlessly invalidate Docker cache layers.
4. **Reproducibility**: Running `RUN npm install` (or `npm ci`) inside the container guarantees clean, hermetic dependencies built specifically for the target container Linux kernel.

---

## 🛠️ Supplementary Problems Implementation

### 1. `.dockerignore` Exclusion Files
Both `backend/.dockerignore` and `frontend/.dockerignore` (along with root `.dockerignore`) exclude:
- `node_modules/`
- `.env` and `.env.*`
- `dist/`, `build/`
- `.git/` and temporary log files

### 2. Multi-Stage Build for React Frontend
`frontend/Dockerfile` uses a two-stage build pipeline:
1. **Stage 1 (`AS build`)**: Uses `node:18-alpine` to install dependencies and execute `npm run build`.
2. **Stage 2 (`AS runner`)**: Copies only the built assets (`dist/`), configuration, and preview scripts.
*(Alternative Nginx static server provided in `frontend/Dockerfile.nginx` reducing image size to ~25 MB).*

### 3. Named Volume for MongoDB Data Persistence
`docker-compose.yml` mounts a named volume:
```yaml
volumes:
  - mongo-data:/data/db

volumes:
  mongo-data:
    name: pr11_mongo_data
    driver: local
```
Even if containers are stopped and removed (`docker-compose down`), all task records persist safely on the host volume across container re-creations.

---

## 📋 Common Commands & Verification

```bash
# Check running containers
docker ps

# Inspect logs of all containers in real time
docker-compose logs -f

# Inspect logs of backend only
docker-compose logs -f backend

# Run healthcheck test
curl http://localhost:5000/health

# Stop all containers (preserving persistent database volume)
docker-compose down

# Stop all containers and remove volumes (clean slate reset)
docker-compose down -v
```
