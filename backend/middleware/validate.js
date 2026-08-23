// Server-side validation runs regardless of what the frontend already checked —
// the frontend can be bypassed entirely (Postman, curl, a modified client),
// so the server must never trust that "required" on an <input> was enough.

function validateRegister(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) errors.push('Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Email is invalid');

  if (!password) errors.push('Password is required');
  else if (password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
}

function validateTask(req, res, next) {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  next();
}

module.exports = { validateRegister, validateLogin, validateTask };
