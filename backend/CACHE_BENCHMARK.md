# Practical 9: In-Memory Caching and Query Optimization

The task API caches `GET /tasks` and `GET /tasks/:id` in a process-local
`node-cache` instance. The default TTL is 60 seconds. Successful writes
invalidate the all-tasks entry; updates and deletes also invalidate the
corresponding single-task entry. `GET /tasks/debug/cache` reports cache status,
TTL, hits, misses, and current key count.

## Response-Time Measurements

Use the same database, dataset, machine, and request for both runs. Record
Postman's response time for three `GET /tasks` requests per condition. With
caching enabled, the first request is a cold-cache miss and later requests are
warm-cache hits. Restart the backend when switching modes.

From `backend/`, start an uncached run:

```powershell
$env:TASK_CACHE_ENABLED = 'false'
npm start
```

Start a cached run with a 60-second TTL:

```powershell
$env:TASK_CACHE_ENABLED = 'true'
$env:TASK_CACHE_TTL_SECONDS = '60'
npm start
```

| Condition | Request 1 (ms) | Request 2 (ms) | Request 3 (ms) | Mean (ms) |
| --- | ---: | ---: | ---: | ---: |
| Uncached |  |  |  |  |
| Cached |  |  |  |  |

Fill in the readings from the running lab environment; response times depend
on the database, network, and dataset. The first cached read still queries
MongoDB, while later hits return the cached response.

## Analysis

- Invalidate entries after successful writes so later reads do not return stale
  task data. Without invalidation, stale values may remain until TTL expiry.
- A 60-second TTL is a practical starting point for a task list that changes
  occasionally. Longer TTLs improve cache reuse but can increase staleness if
  invalidation is missed; shorter TTLs reduce stale windows but increase
  database reads.
- `node-cache` is process-local. In a multi-instance deployment, each server
  has a separate cache, so a write on one instance cannot invalidate another
  instance's entries. A shared cache such as Redis is needed for coordinated
  cross-instance caching.

Cache values and counters reset when the Node.js process restarts. Try other
positive values for `TASK_CACHE_TTL_SECONDS` to compare freshness and reuse.
