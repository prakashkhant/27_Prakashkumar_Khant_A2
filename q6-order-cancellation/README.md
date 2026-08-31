# Question 6 - Cancelling an Order — Customer or Admin Only

## Run
```bash
npm install
npm start
```

MongoDB must be running locally.

## Task
`DELETE /api/orders/:id` allows cancellation only when:
- the logged-in user is the customer who placed the order, OR
- the logged-in user has role `admin`.

Otherwise it returns `403 Forbidden`.
A shipped order cannot be cancelled.

## Test
After `npm start`, copy the printed tokens and order IDs into Postman/Thunder Client.

**Customer owns order:** DELETE using `customerToken` -> `200 OK`.

**Other customer:** DELETE another customer's order using `otherCustomerToken` -> `403 Forbidden`.

**Admin:** DELETE any unshipped order using `adminToken` -> `200 OK`.

**Shipped order:** even an allowed user gets `400` because it has already shipped.
