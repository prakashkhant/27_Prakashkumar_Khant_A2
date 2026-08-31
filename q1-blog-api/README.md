# Blog Management REST API with Authentication

A backend + server-rendered (EJS) blogging platform built with **Node.js, Express, MongoDB (Mongoose), JWT auth, and Multer** file uploads. Registered users can create, edit, and delete their own posts; admins can moderate any post.

## Folder structure

```
blog-api/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # register/login/profile logic
│   └── postController.js     # post CRUD + image upload logic
├── middleware/
│   ├── auth.js                # JWT verification (API + page routes)
│   ├── authorize.js           # role-based access control
│   ├── upload.js               # Multer config (type/size validation)
│   └── validators.js          # express-validator rules
├── models/
│   ├── User.js
│   └── Post.js
├── routes/
│   ├── authRoutes.js
│   ├── postRoutes.js
│   └── viewRoutes.js
├── views/
│   ├── posts.ejs               # public list of published posts
│   ├── login.ejs                # login form
│   └── dashboard.ejs           # protected: user's own posts
├── uploads/                     # uploaded images are stored here
├── app.js                       # Express app + middleware wiring
├── server.js                    # entry point
├── .env.example
└── package.json
```

## 1. Setup

```bash
cd blog-api
npm install
cp .env.example .env
# edit .env and set MONGO_URI, JWT_SECRET, etc.
```

Make sure MongoDB is running locally (or point `MONGO_URI` at Atlas / another instance).

## 2. Run

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start
```

The server starts at `http://localhost:5000` (or whatever `PORT` you set).

- `GET /posts` — public list of published posts (EJS)
- `GET /login` — login page (EJS)
- `GET /dashboard` — logged-in user's posts (EJS, protected)

## 3. Environment variables (`.env.example`)

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — keep this long and random |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` |
| `ALLOWED_ORIGINS` | Comma-separated list of trusted CORS origins |
| `MAX_UPLOAD_SIZE_MB` | Max upload size enforced by Multer |

Never commit your real `.env` — only `.env.example` is tracked.

## 4. Example API requests (curl)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Doe","email":"alice@example.com","password":"secret123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"alice@example.com","password":"secret123"}'
```
Response includes a `token` (for API clients) and also sets an httpOnly `token` cookie (used by the EJS dashboard).

### Get profile (protected)
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <TOKEN>"
```

### Create a post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "Hello world, this is my first blog post!",
    "tags": ["intro", "hello"],
    "published": true
  }'
```

### Get my posts
```bash
curl http://localhost:5000/api/posts \
  -H "Authorization: Bearer <TOKEN>"
```

### Get a single post
```bash
curl http://localhost:5000/api/posts/<POST_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### Update a post
```bash
curl -X PUT http://localhost:5000/api/posts/<POST_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "published": true}'
```

### Delete a post
```bash
curl -X DELETE http://localhost:5000/api/posts/<POST_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### Upload / replace a featured image
```bash
curl -X POST http://localhost:5000/api/posts/<POST_ID>/image \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@/path/to/photo.jpg"
```
Only `image/jpeg`, `image/png`, and `image/webp` are accepted, and the file is rejected if it exceeds `MAX_UPLOAD_SIZE_MB`. Uploaded filenames are randomly generated server-side — the client-supplied filename is never trusted.

## 5. Postman

Import the requests above as a collection, or manually create:
1. `POST {{baseUrl}}/api/auth/register`
2. `POST {{baseUrl}}/api/auth/login` → copy the returned `token` into an environment variable
3. Use `Authorization: Bearer {{token}}` on all subsequent requests
4. For the image upload request, set the body type to `form-data` with a key `image` of type `File`

## 6. Security features implemented

- Passwords hashed with **bcrypt** (never stored in plaintext)
- **JWT** authentication with configurable expiry; token sent via `Authorization: Bearer` header or httpOnly cookie
- **Helmet** for secure HTTP headers
- **CORS** restricted to `ALLOWED_ORIGINS`
- **express-rate-limit** on `/api/auth/login` and `/api/auth/register`
- **express-validator** input validation/sanitization on all write routes
- **express-mongo-sanitize** to strip `$`/`.` operators from user input (NoSQL injection protection)
- Server-side ownership/role re-checks on every update/delete/image-upload — the UI hiding buttons is never trusted
- Multer restricts uploads to image MIME types and a max file size, and generates random server-side filenames (client filenames are never trusted)
- Old images are deleted from disk when a post is deleted or its image is replaced
- Secrets loaded from `.env` (`.env` is gitignored; only `.env.example` is committed)

## 7. Demo checklist (for screenshots)

1. Register a user via curl/Postman → 201 response
2. Login → 200 response with token + cookie set
3. Visit `/login` in the browser, log in, get redirected to `/dashboard`
4. Create a couple of posts (one published, one draft) via the API
5. Visit `/posts` — only the published post should appear
6. Visit `/dashboard` — both posts should appear, with edit/delete actions
7. Upload an image to a post, then reload `/posts` and `/dashboard` to see it rendered
8. Try deleting another user's post while logged in as a non-admin → expect `403 Forbidden`
