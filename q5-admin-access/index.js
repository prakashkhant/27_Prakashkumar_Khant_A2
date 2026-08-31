const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'bookstore_secret_key';

app.use(express.json());

// Authentication middleware: verifies the JWT and attaches the user to req.user.
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Authorization middleware: only admins can continue.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access only' });
  }
  next();
}

// Demo tokens for testing the authorization middleware.
app.get('/demo-tokens', (req, res) => {
  const customerToken = jwt.sign({ id: 'customer001', email: 'customer@example.com', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: 'admin001', email: 'admin@example.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ customerToken, adminToken });
});

// Protected inventory dashboard: authentication + admin authorization.
app.get('/api/admin/inventory', verifyToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Inventory dashboard accessed successfully',
    data: [
      { book: 'Node.js Guide', stock: 25, sales: 40 },
      { book: 'MongoDB Basics', stock: 18, sales: 32 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Open /demo-tokens to get customer and admin JWT tokens.');
});
