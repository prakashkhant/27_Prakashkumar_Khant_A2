# Question 3 - Issuing a Digital Membership Token on Login

This program demonstrates JWT authentication for the bookstore.

## Features
- Generates a JWT token after successful login.
- Stores customer id and email in the token payload.
- Token expires after 1 hour.
- `verifyToken` middleware checks the `Authorization: Bearer <token>` header.
- Protected route is allowed only when the token is valid.
- Invalid/expired tokens are rejected.

## Run
```bash
npm install
npm start
```

## Expected output
The program shows:
1. Successful login.
2. JWT token generated.
3. Protected route accessed with the valid token.
4. Invalid token attempt rejected.

For a real Express application, use `verifyToken` before routes such as `/orders` or `/order-history`.
