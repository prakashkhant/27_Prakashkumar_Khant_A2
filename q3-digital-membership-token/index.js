const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_jwt_secret_123';

const customer = {
  id: 'customer_1001',
  email: 'jane@example.com'
};

function login(email, password) {
  if (email === 'jane@example.com' && password === '123456') {
    const token = jwt.sign(
      { customerId: customer.id, email: customer.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return { success: true, message: 'Login successful', token };
  }

  return { success: false, message: 'Invalid email or password' };
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

function protectedRoute(req, res) {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user
  });
}

function createResponse(label) {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { console.log(`${label}:`, data); return this; }
  };
}

console.log('--- Q3: Digital Membership Token (JWT) ---');

const loginResult = login('jane@example.com', '123456');
console.log('Login result:', {
  success: loginResult.success,
  message: loginResult.message
});

if (loginResult.success) {
  console.log('JWT token generated:', loginResult.token);

  const protectedRequest = {
    headers: { authorization: `Bearer ${loginResult.token}` }
  };
  const next = () => protectedRoute(protectedRequest, createResponse('Protected route'));
  verifyToken(protectedRequest, createResponse('Protected route error'), next);

  const invalidRequest = {
    headers: { authorization: 'Bearer invalid-token' }
  };
  verifyToken(invalidRequest, createResponse('Invalid token attempt'), () => {});
}

module.exports = { login, verifyToken };
