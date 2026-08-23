const jwt = require('jsonwebtoken');

// Verifies the JWT sent in the Authorization header and attaches
// the decoded payload to req.user. Never lets jwt.verify() throw
// uncaught — missing/invalid/expired tokens all resolve to a 401.
function auth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: <userId>, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message });
  }
}

module.exports = auth;
