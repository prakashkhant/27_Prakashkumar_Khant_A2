const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bookstore_roles');
  console.log('Connected to MongoDB');

  
  const customer = await User.create({
    name: 'Jane Customer',
    email: `jane${Date.now()}@example.com`,
    password: 'hashed-password'
  });

  const admin = await User.create({
    name: 'Store Admin',
    email: `admin${Date.now()}@example.com`,
    password: 'hashed-password',
    role: 'admin'
  });

  console.log('New signup role:', customer.role);
  console.log('Admin role:', admin.role);

  await User.deleteMany({ _id: { $in: [customer._id, admin._id] } });
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
