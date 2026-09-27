const NodeCache = require('node-cache');

const configuredTtl = Number.parseInt(process.env.TASK_CACHE_TTL_SECONDS || '60', 10);
const ttlSeconds = Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : 60;
const enabled = process.env.TASK_CACHE_ENABLED !== 'false';
const store = new NodeCache({ stdTTL: ttlSeconds });
let hits = 0;
let misses = 0;

function get(key) {
  const value = store.get(key);
  if (value === undefined) {
    misses += 1;
    return undefined;
  }
  hits += 1;
  return value;
}

function set(key, value) {
  store.set(key, value);
}

function del(key) {
  store.del(key);
}

function getMetrics() {
  return { enabled, ttlSeconds, hits, misses, keys: store.keys().length };
}

module.exports = { enabled, get, set, del, getMetrics };
