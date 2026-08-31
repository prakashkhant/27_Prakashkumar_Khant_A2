# Secure Signup for Bookstore Customers (Q2)

Hashes a customer's password with **bcrypt** before storing it in MongoDB, and verifies the password against the stored hash on login. Never stores or compares plaintext passwords.

## Files

- `index.js` — Mongoose `Customer` model, `signup()`, `login()`, and a runnable demo in `main()`.

## How it works

**Signup** (`signup({ name, email, password })`)
1. Takes the customer's plaintext password.
2. Hashes it with `bcrypt.hash(password, 12)` (12 salt rounds).
3. Saves the customer document with the **hash**, never the plaintext, in the `password` field.

**Login** (`login({ email, password })`)
1. Looks up the customer by email.
2. Compares the submitted plaintext password against the stored hash using `bcrypt.compare(password, customer.password)`.
3. Returns success only if the hash matches — the plaintext password is never stored or logged.

## Setup

```bash
npm install
cp .env.example .env   # edit MONGO_URI if needed
```

Make sure MongoDB is running locally (or point `MONGO_URI` at Atlas/another instance).

## Run the demo

```bash
npm start
```

Expected output:
```
Connected to MongoDB
Signed up: jane@example.com | stored hash: $2b$12$...
Correct password attempt: { success: true, message: 'Login successful', customerId: ... }
Wrong password attempt: { success: false, message: 'Invalid email or password' }
```

## Using it in your own app

```js
const { Customer, signup, login } = require('./index.js');

// Signup
const customer = await signup({ name: 'John', email: 'john@example.com', password: 'mypassword' });

// Login
const result = await login({ email: 'john@example.com', password: 'mypassword' });
if (result.success) {
  // issue a session/JWT, etc.
} else {
  // reject with 401
}
```

## Security notes

- Passwords are hashed with bcrypt (12 salt rounds) — a slow, salted hash designed to resist brute-force and rainbow-table attacks.
- The password field never stores or returns plaintext.
- Login always returns a generic "Invalid email or password" message whether the email doesn't exist or the password is wrong, to avoid leaking which emails are registered.
