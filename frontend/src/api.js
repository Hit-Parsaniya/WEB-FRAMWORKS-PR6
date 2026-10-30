// Central place for all backend API calls.
// Configured to support environment variables (VITE_API_URL) for Docker / Production environments.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AUTH_EVENT = 'app:auth-unauthorized';

function getToken() {
  return localStorage.getItem('token');
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event(AUTH_EVENT));
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // response wasn't JSON, ignore and use default message
    }
    throw new Error(message);
  }
  return res.json();
}

// --- Authentication Endpoints ---

export const login = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const register = (email, password) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const getMe = () =>
  fetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeaders() },
  }).then(handleResponse);

// --- Task CRUD Endpoints ---

export const getTasks = () =>
  fetch(`${BASE_URL}/tasks`, {
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const createTask = (task) =>
  fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(task),
  }).then(handleResponse);

export const updateTask = (id, updates) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  }).then(handleResponse);

export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  }).then(handleResponse);

// --- Practical 10 & 11: Event-Driven Processing & Health Endpoints ---

export const getEventLogs = () =>
  fetch(`${BASE_URL}/tasks/debug/events`, {
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const simulateErrorEvent = (title) =>
  fetch(`${BASE_URL}/tasks/simulate-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title: title || 'Simulated Error Task' }),
  }).then(handleResponse);

export const getSystemHealth = () =>
  fetch(`${BASE_URL}/health`).then(handleResponse);

// --- Practical 13: AI Service Integration ---
export const generateAiDescription = (title) =>
  fetch(`${BASE_URL}/api/ai/generate-description`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title }),
  }).then(handleResponse);

export const getAiStatus = () =>
  fetch(`${BASE_URL}/api/ai/status`, {
    headers: { ...authHeaders() },
  }).then(handleResponse);

