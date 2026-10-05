const jwt = require('jsonwebtoken');

// The old default secret was committed to git, so it is never accepted.
const LEAKED_SECRET = 'turfsync_super_secure_jwt_secret_mumbai_2026';
const configured = process.env.JWT_SECRET;
const JWT_SECRET = configured && configured !== LEAKED_SECRET && configured.length >= 32
  ? configured
  : require('crypto').randomBytes(48).toString('hex');
if (JWT_SECRET !== configured) {
  console.warn('JWT_SECRET is missing, too short or leaked: using a temporary random secret. Set a strong JWT_SECRET env var.');
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAuth,
  requireRole
};
