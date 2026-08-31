# Q5 - Admin-Only Access to Inventory Dashboard

## Run
npm install
npm start

## Test
1. Open http://localhost:5000/demo-tokens
2. Copy the `customerToken` and `adminToken`.
3. Call GET http://localhost:5000/api/admin/inventory with header:
   Authorization: Bearer <token>

Customer token -> 403 Forbidden.
Admin token -> 200 OK with inventory data.

## Core middleware
`verifyToken` authenticates the JWT.
`requireAdmin` checks `req.user.role` and returns HTTP 403 unless role is `admin`.
