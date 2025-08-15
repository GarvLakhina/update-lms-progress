// Simple header-based user resolver for MVP
export function requireUser(req, res, next) {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(400).json({ error: 'X-User-Id header required' });
  req.userId = userId;
  next();
}
