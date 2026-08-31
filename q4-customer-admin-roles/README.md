# Q4 - Defining Customer and Admin Roles

## Requirement
Create a Mongoose User schema with a `role` field that accepts only `customer` or `admin`, and defaults to `customer`.

## Run
1. Start MongoDB.
2. Open this folder in VS Code.
3. Run:
   npm install
   npm start

## Expected output
Connected to MongoDB
New signup role: customer
Admin role: admin

The first user does not provide a role, so Mongoose applies the default `customer` role. The second user explicitly sets `role: 'admin'`.
