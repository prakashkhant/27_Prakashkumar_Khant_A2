

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore_demo';
const SALT_ROUNDS = 12;

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
});

const Customer = mongoose.model('Customer', customerSchema);

async function signup({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const customer = await Customer.create({ name, email, password: hashedPassword });
  return customer;
}


async function login({ email, password }) {
  const customer = await Customer.findOne({ email });
  if (!customer) {
    return { success: false, message: 'Invalid email or password' };
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    return { success: false, message: 'Invalid email or password' };
  }

  return { success: true, message: 'Login successful', customerId: customer._id };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Customer.deleteMany({ email: 'jane@example.com' });

  const newCustomer = await signup({
    name: 'Jane Reader',
    email: 'jane@example.com',
    password: 'BooksAreGreat123',
  });
  console.log('Signed up:', newCustomer.email, '| stored hash:', newCustomer.password);

  const correctAttempt = await login({ email: 'jane@example.com', password: 'BooksAreGreat123' });
  console.log('Correct password attempt:', correctAttempt);

  const wrongAttempt = await login({ email: 'jane@example.com', password: 'wrong-password' });
  console.log('Wrong password attempt:', wrongAttempt);

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { Customer, signup, login };
