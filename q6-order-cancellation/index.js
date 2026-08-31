require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const Order = mongoose.model('Order', new mongoose.Schema({
  item: String,
  customerId: String,
  status: { type: String, enum: ['placed', 'shipped', 'cancelled'], default: 'placed' }
}));

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Customer can cancel their own order; admin can cancel any order.
app.delete('/api/orders/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.customerId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You cannot cancel this order' });
    }

    if (order.status === 'shipped') {
      return res.status(400).json({ message: 'Order cannot be cancelled after shipping' });
    }

    order.status = 'cancelled';
    await order.save();
    return res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/demo', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Order.deleteMany({});
  const orders = await Order.insertMany([
    { item: 'JavaScript Book', customerId: 'customer001', status: 'placed' },
    { item: 'Node.js Book', customerId: 'customer002', status: 'placed' },
    { item: 'MongoDB Book', customerId: 'customer002', status: 'shipped' }
  ]);

  console.log('Demo order IDs:');
  orders.forEach(o => console.log(`${o.item}: ${o._id}`));

  const customerToken = jwt.sign({ id: 'customer001', role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const otherCustomerToken = jwt.sign({ id: 'customer999', role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: 'admin001', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  console.log('\nCustomer token:', customerToken);
  console.log('Other customer token:', otherCustomerToken);
  console.log('Admin token:', adminToken);
  console.log('\nTest DELETE /api/orders/:id in Postman/Thunder Client.');

  app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
}

start().catch(err => console.error('Startup error:', err.message));
