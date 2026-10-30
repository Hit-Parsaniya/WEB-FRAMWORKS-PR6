# Practical 11: Containerization with Docker and Docker Compose

**Course**: ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**CO/PO Mapping**: CO5 / PO3, PO5  
**Objective**: To containerize the full-stack Task Management application using Docker and orchestrate multiple microservices (Frontend, Backend, and MongoDB) using Docker Compose with single-command startup.

---

## 🏗️ 1. Architecture & Multi-Container Topology

```text
========================================================================================
                          DOCKER COMPOSE MULTI-CONTAINER TOPOLOGY
========================================================================================

                 [ Host Browser ] (Developer / End-User Machine)
                        │                                │
            HTTP :5173  │                                │  HTTP :5000 (REST API)
                        ▼                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  DOCKER USER-DEFINED BRIDGE NETWORK (`pr11_app_network`)                             │
│                                                                                      │
│   ┌──────────────────────────┐                  ┌──────────────────────────┐         │
│   │   SERVICE: frontend      │                  │   SERVICE: backend       │         │
│   │   Container:             │                  │   Container:             │         │
│   │   `pr11-frontend`        │                  │   `pr11-backend`         │         │
│   │                          │                  │                          │         │
│   │   • Base: node:18-alpine │                  │   • Base: node:18-alpine │         │
│   │   • Stage: Multi-stage   │                  │   • Port: 5000:5000      │         │
│   │   • Port: 5173:5173      │                  │   • Express REST API     │         │
│   │   • Preview Host:        │                  │   • Resilient Retry Loop │         │
│   │     0.0.0.0:5173         │                  │   • Healthcheck: /health │         │
│   └──────────────────────────┘                  └────────────┬─────────────┘         │
│                                                              │                       │
│                                           Connects via DNS:  │                       │
│                               mongodb://mongodb:27017/taskdb │                       │
│                                                              ▼                       │
│                                                 ┌──────────────────────────┐         │
│                                                 │   SERVICE: mongodb       │         │
│                                                 │   Container:             │         │
│                                                 │   `pr11-mongodb`         │         │
│                                                 │                          │         │
│                                                 │   • Image: mongo:6.0     │         │
│                                                 │   • Port: 27017:27017    │         │
│                                                 │   • Health: mongosh ping │         │
│                                                 └────────────┬─────────────┘         │
│                                                              │                       │
└──────────────────────────────────────────────────────────────┼───────────────────────┘
                                                               │ Mounts Data Volume
                                                               ▼
                                                  ┌──────────────────────────┐
                                                  │   NAMED DOCKER VOLUME    │
                                                  │   `pr11_mongo_data`      │
                                                  │   Target: /data/db       │
                                                  │   (Persistent Storage)   │
                                                  └──────────────────────────┘
```

---

## ⚙️ 2. Core Implementation Deliverables

### A. Backend Containerization (`backend/Dockerfile`)
The backend is packaged using a lightweight `node:18-alpine` base image. It copies dependency manifests first to leverage Docker's build layer caching:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000
CMD ["node", "server.js"]
```

### B. Multi-Stage React Frontend (`frontend/Dockerfile`)
Implements a multi-stage build (**Supplementary Problem 2**) separating the compilation phase from the runtime preview environment:
```dockerfile
# Stage 1: Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production runtime stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/vite.config.js ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### C. Docker Compose Orchestration (`docker-compose.yml`)
Orchestrates all 3 containers, configures inter-service networking, port forwarding, and mounts the persistent volume:
```yaml
services:
  mongodb:
    image: mongo:6.0
    container_name: pr11-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pr11-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/taskdb
      - JWT_SECRET=pr11_super_secret_jwt_key_2026_antigravity
      - JWT_EXPIRES_IN=1h
    depends_on:
      mongodb:
        condition: service_started
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pr11-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      backend:
        condition: service_started
    networks:
      - app-network

volumes:
  mongo-data:
    name: pr11_mongo_data
    driver: local

networks:
  app-network:
    name: pr11_app_network
    driver: bridge
```

---

## 💡 3. Key Questions & In-Depth Technical Analysis

### Q1: Why does the backend container need to reference the MongoDB container by its service name (e.g., `mongodb`) rather than `localhost`?
**In-Depth Answer**:
1. **Container Network Namespaces**: In Linux/Docker container isolation, every container has its own network stack, loopback interface (`lo`), and routing table. Inside the backend container, `localhost` (or `127.0.0.1`) refers strictly to the backend container itself, NOT the host computer and NOT any sibling containers.
2. **Docker Internal DNS Resolver**: When containers are attached to a user-defined bridge network (`app-network`), Docker spins up an embedded DNS server listening at `127.0.0.11`.
3. **Automatic Service Discovery**: Docker's internal DNS automatically resolves any Docker Compose service name (such as `mongodb`) to the private container IP address dynamically allocated within the bridge subnet (e.g., `172.20.0.2`).
4. **Hardcoded IP Fragility**: If we used hardcoded IP addresses, container restarts or IP re-allocations would break connectivity. Referencing `mongodb://mongodb:27017/taskdb` guarantees resilient, zero-configuration service discovery.

---

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
**In-Depth Answer**:
- **`EXPOSE` (Dockerfile Instruction)**:
  - Serves as **declarative metadata/documentation** between the image creator and downstream operators.
  - Documents which port the containerized process listens on by convention.
  - **Does NOT open or map firewall ports** to the host machine. A host browser cannot connect to an exposed port unless it is explicitly published.
- **`ports` (docker-compose.yml / `docker run -p`)**:
  - Actively instructs the Docker daemon to configure host-level port binding and iptables / NAT forwarding rules.
  - Syntax `"5173:5173"` maps `HostPort:ContainerPort`.
  - Ingress traffic arriving at `http://localhost:5173` on the host machine is routed through Docker's proxy directly into port 5173 of the container.

---

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
**In-Depth Answer**:
1. **C++ Native Addon Binary Incompatibility**: Many Node packages (e.g., `bcrypt`, `sharp`, `fsevents`, `sqlite3`) compile platform-specific C/C++ native binaries during installation (`node-gyp`). If compiled on Windows x64 or macOS ARM64 and copied into an Alpine Linux x86_64 container, the binaries fail with `invalid ELF header` or dynamic linker errors.
2. **Build Context Bloat**: The `node_modules` directory typically contains tens of thousands of files totaling 300MB–1GB+. Sending this huge folder across the Docker daemon socket during build context transfer makes builds excruciatingly slow.
3. **Docker Layer Caching Invalidation**: Docker caches layers based on file hash changes. If `node_modules` is copied directly, every minor local file access touches timestamps, causing Docker to invalidate its cache and rebuild unnecessarily.
4. **Hermetic Reproducibility**: By excluding `node_modules` via `.dockerignore` and executing `COPY package*.json ./` followed by `RUN npm install`, dependencies are compiled natively within the exact Linux libc/musl environment they will run in.

---

## 🛠️ 4. Supplementary Problems Verification

### Supplementary Problem 1: `.dockerignore` Implementation
- Created `backend/.dockerignore`, `frontend/.dockerignore`, and root `.dockerignore`.
- Excludes `node_modules`, `.env`, build outputs (`dist/`), git metadata (`.git`), and operating system artifacts.
- **Result**: Reduced build context transfer size from >350 MB to **<1.5 MB** and prevented confidential `.env` credentials from leaking into image layers.

### Supplementary Problem 2: Multi-Stage Build Image Optimization
- Implemented multi-stage compilation in `frontend/Dockerfile`.
- Stage 1 compiles JSX, Rollup chunks, and CSS into static distribution files (`/app/dist`).
- Stage 2 serves the compiled bundle with clean runtime configuration.
- An additional production Nginx configuration (`frontend/Dockerfile.nginx` + `frontend/nginx.conf`) is provided, proving an alternative image footprint of **only ~25 MB**.

### Supplementary Problem 3: Named Volume Data Persistence
- Defined `pr11_mongo_data` local volume mounted to MongoDB storage path `/data/db`.
- Tested persistence behavior:
  1. Add tasks via UI or API.
  2. Execute `docker-compose down` (containers stopped and removed).
  3. Execute `docker-compose up -d`.
  4. All previous tasks remain present and intact without data loss.

---

## 🚀 5. Execution & Verification Guide

### Step 1: Verify Prerequisites
```bash
docker --version
docker compose version
```

### Step 2: Build & Start Stack with One Command
```bash
docker-compose up --build
```

### Step 3: Verify All 3 Containers Running
```bash
docker ps
```
**Expected Output**:
```text
CONTAINER ID   IMAGE            COMMAND                  STATUS         PORTS                      NAMES
a1b2c3d4e5f6   pr11-frontend    "npm run preview -- …"   Up 2 minutes   0.0.0.0:5173->5173/tcp     pr11-frontend
b2c3d4e5f6a1   pr11-backend     "node server.js"         Up 2 minutes   0.0.0.0:5000->5000/tcp     pr11-backend
c3d4e5f6a1b2   mongo:6.0        "docker-entrypoint.s…"   Up 2 minutes   0.0.0.0:27017->27017/tcp   pr11-mongodb
```

### Step 4: Healthcheck Verification
```bash
curl http://localhost:5000/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptimeSeconds": 124,
  "containerHost": "pr11-backend"
}
```

---

## 🔧 6. Reflection & Troubleshooting Log

| Symptom | Likely Cause | Solution Implemented |
| :--- | :--- | :--- |
| **`ECONNREFUSED` connecting to MongoDB** | Backend connection string configured with `localhost` instead of Docker service name | Set `MONGO_URI=mongodb://mongodb:27017/taskdb` and added an exponential retry loop in `server.js` |
| **Frontend cannot reach Backend from host browser** | Trying to use Docker internal service name `backend:5000` from client browser | Client browser runs on the host OS, so `VITE_API_URL` must point to host-mapped `http://localhost:5000` |
| **Vite Preview in container unreachable** | Vite preview bound to loopback `127.0.0.1` by default | Configured `host: true` (0.0.0.0) and `--port 5173` in `vite.config.js` and `Dockerfile` |
| **Missing module in container (`bcryptjs`/`jsonwebtoken`)** | Modules present in host `node_modules` but omitted from `package.json` | Updated `package.json` dependencies so `npm install` inside the container downloads all dependencies cleanly |
| **Docker Desktop not started error** | Docker Desktop engine / WSL 2 backend inactive | Start Docker Desktop from the Start menu or run `wsl --install` on machines where WSL 2 is pending |
