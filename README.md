![Static Badge](https://img.shields.io/badge/node.js-green)
![Static Badge](https://img.shields.io/badge/bun-white)
![Static Badge](https://img.shields.io/badge/Javascript-yellow)


# Fastify Backend API

A Node.js backend application built with **Fastify** and **MongoDB/Mongoose**, structured around controllers, routes, models, and custom Fastify plugins.

The project currently contains two main API areas:

* **Authentication** — registration, login, password reset, and logout
* **Thumbnail Management** — authenticated thumbnail upload, retrieval, update, and deletion

> **Current implementation note:** The repository is actively under development. Some authentication and thumbnail-handling code currently contains implementation issues that prevent the application from functioning completely as intended. This README documents the **actual code currently present**, rather than presenting unfinished functionality as production-ready.

---

## Tech Stack

| Technology             | Purpose                          |
| ---------------------- | -------------------------------- |
| **Node.js**            | JavaScript runtime               |
| **Fastify 5**          | HTTP server and API framework    |
| **MongoDB**            | Database                         |
| **Mongoose**           | MongoDB ODM                      |
| **@fastify/jwt**       | JWT authentication               |
| **@fastify/multipart** | Multipart/form-data file uploads |
| **@fastify/static**    | Static file serving              |
| **@fastify/cors**      | CORS support                     |
| **@fastify/env**       | Environment configuration        |
| **@fastify/sensible**  | Fastify HTTP utility helpers     |
| **bcryptjs**           | Password hashing                 |
| **dotenv**             | Environment variable loading     |
| **fastify-plugin**     | Custom Fastify plugins           |
| **Nodemon**            | Development server reloads       |

---

## Project Structure

```text
Backend/
│
├── controllers/
│   ├── authController.js
│   └── thumbnail.controller.js
│
├── models/
│   ├── user.model.js
│   └── thumbnail.model.js
│
├── pulgins/
│   ├── jwt.plugin.js
│   └── monogodb.plugins.js
│
├── routes/
│   ├── auth.routes.js
│   └── thumbnail.routes.js
│
├── uploads/
│   └── thumbnail/
│
├── .env
├── .gitignore
├── bun.lock
├── package.json
└── server.js
```

The project intentionally separates:

* **Routes** — endpoint registration
* **Controllers** — request handling and application logic
* **Models** — MongoDB/Mongoose schemas
* **Plugins** — reusable Fastify configuration and services
* **Server** — application initialization and route registration

---

# Application Architecture

The backend follows a simple layered structure:

```text
                    Client
                      │
                      ▼
                Fastify Server
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
     Auth Routes            Thumbnail Routes
          │                       │
          ▼                       ▼
   Auth Controller       Thumbnail Controller
          │                       │
          ├───────────┬───────────┤
          │           │           │
          ▼           ▼           ▼
      bcrypt        JWT       Mongoose
                                  │
                                  ▼
                              MongoDB
```

Fastify plugins are registered during application startup to provide:

* MongoDB connection
* JWT functionality
* CORS
* Multipart handling
* Static file serving
* HTTP utility helpers
* Environment configuration

---

# Server Configuration

The application entry point is:

```text
server.js
```

The server creates a Fastify instance with logging enabled:

```js
const fastify = require("fastify")({ logger: true });
```

The following plugins are registered:

```text
@fastify/cors
@fastify/sensible
@fastify/multipart
@fastify/static
@fastify/env
```

The custom MongoDB and JWT plugins are then registered.

Routes are mounted under:

```text
/api/auth
/api/thumbnail
```

---

# Environment Variables

The `.env` file currently contains the following configuration keys:

```env
PORT=4000
MONGODB_URI=<mongodb-connection-string>
JWT_TOKEN=<value>
JWT_SECRET=<value>
```

## Variables

| Variable      | Used By                    | Purpose                                    |
| ------------- | -------------------------- | ------------------------------------------ |
| `PORT`        | `server.js`                | Fastify listening port                     |
| `MONGODB_URI` | MongoDB plugin             | MongoDB connection string                  |
| `JWT_SECRET`  | JWT plugin                 | Secret used by `@fastify/jwt`              |
| `JWT_TOKEN`   | Fastify environment schema | Required by the current environment schema |

### Important

There is currently an implementation mismatch:

```js
JWT_TOKEN
```

is required by the `@fastify/env` schema, while the JWT plugin actually uses:

```js
process.env.JWT_SECRET
```

Therefore, both variables are currently present in the project's environment configuration.

Do not commit real secrets to Git.

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd Backend
```

Install dependencies:

```bash
npm install
```

The repository also contains a `bun.lock` file, so Bun can be used if the project is installed and maintained with Bun.

```bash
bun install
```

---

# Running the Server

## Development

```bash
npm run dev
```

This executes:

```bash
nodemon server.js
```

## Start

```bash
npm start
```

This executes:

```bash
node server.js
```

The default port configured by the application is:

```text
4000
```

The server itself uses Fastify's normal HTTP listener. The current startup log says `https://localhost`, but HTTPS/TLS is **not configured in the application**.

---

# Authentication API

Authentication routes are registered with:

```text
/api/auth
```

## Register

```http
POST /api/auth/register
```

### Request Body

```json
{
  "name": "kavinn",
  "email": "kavinn@yhoo.com",
  "password": "password"
}
```

The controller:

1. Reads `name`, `email`, and `password`
2. Checks that `email` and `password` are present
3. Hashes the password using `bcryptjs`
4. Creates a `User` document
5. Saves it to MongoDB

### Success Response

```json
{
  "message": "user registed sucessfully"
}
```

HTTP status:

```text
201 Created
```

---

## Login

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "kavinn@yhoo.com",
  "password": "password"
}
```

The controller:

1. Searches MongoDB for the supplied email
2. Compares the supplied password with the stored bcrypt hash
3. Creates a JWT containing the user's MongoDB ID

The JWT payload is currently:

```json
{
  "id": "<user-object-id>"
}
```

The generated token is returned directly by the endpoint.

---

## Forgot Password

```http
POST /api/auth/forgot-password
```

### Request Body

```json
{
  "email": "kavinn@yhoo.com"
}
```

The intended implementation generates a random reset token using Node.js `crypto`:

```js
crypto.randomBytes(32).toString("hex")
```

and creates a reset expiry timestamp.

The intended reset URL is generated in the following format:

```text
http://localhost:<PORT>/api/auth/passwd-reset/<token>
```

### Current Status

The current implementation has an unresolved variable/reference issue in this controller, so the password-reset flow does not currently operate correctly.

There is also no email service configured. The controller attempts to return the reset URL directly rather than sending it through an email provider.

---

## Reset Password

```http
POST /api/auth/reset-password/:token
```

### Request Body

```json
{
  "newPassword": "new-password"
}
```

The intended flow is:

```text
Reset Token
     │
     ▼
Find User
     │
     ├── Token matches
     └── Token has not expired
             │
             ▼
       Hash new password
             │
             ▼
        Save User
             │
             ▼
      Clear reset token
```

The controller uses:

```js
resetPasswdToken
resetPasswdExpiry
```

to identify a valid reset request.

---

## Logout

```http
POST /api/auth/logout
```

Logout is registered as a protected route using:

```js
fastify.authenticate
```

The controller currently returns:

```json
{
  "message": "user loged out "
}
```

Because authentication uses JWTs, the current logout implementation does not revoke or invalidate a token on the server. It only returns a logout response.

---

# JWT Authentication

JWT functionality is configured in:

```text
pulgins/jwt.plugin.js
```

The plugin registers:

```js
@fastify/jwt
```

using:

```js
secret: process.env.JWT_SECRET
```

It also decorates Fastify with:

```js
fastify.authenticate
```

The authentication function calls:

```js
request.jwtVerify()
```

This allows routes to use JWT verification as a Fastify pre-handler.

---

# MongoDB Integration

MongoDB configuration is located in:

```text
pulgins/monogodb.plugins.js
```

The project uses Mongoose:

```js
const mongoose = require("mongoose");
```

and connects using:

```js
mongoose.connect(process.env.MONGODB_URI);
```

After connection, Mongoose is exposed through Fastify:

```js
fastify.decorate("mongoose", mongoose);
```

This makes the Mongoose instance available through:

```js
fastify.mongoose
```

---

# User Model

The user schema is defined in:

```text
models/user.model.js
```

Current fields:

```text
User
├── name
├── email
├── password
├── resetPasswdToken
├── resetPasswdExpiry
├── createAt
└── updateAt
```

### Schema

```js
name
email
password
resetPasswdToken
resetPasswdExpiry
createAt
updateAt
```

The password is hashed with bcrypt before registration storage.

The email field is marked as unique.

> The current schema also marks `password` as `unique`. This is generally not appropriate for passwords and is part of the current implementation rather than an intended security requirement.

---

# Thumbnail API

Thumbnail routes are registered under:

```text
/api/thumbnail
```

The routes currently defined are:

```text
POST   /api/thumbnail
GET    /api/thumbnail
GET    /api/thumbnail/:id
PUT    /api/thumbnail/:id
DELETE /api/thumbnail/:id
DELETE /api/thumbnail
```

The route module attempts to protect the entire thumbnail route group using the JWT authentication hook.

---

## Create Thumbnail

```http
POST /api/thumbnail
```

The controller is designed to receive multipart data using:

```js
request.parts()
```

The intended request contains:

```text
videoName
version
paid
image file
```

The image is intended to be saved under:

```text
uploads/thumbnail/
```

with a generated filename based on the current timestamp.

A thumbnail MongoDB document is then intended to be created containing:

```text
user
videoName
version
image
paid
```

---

## Get User Thumbnails

```http
GET /api/thumbnail
```

The controller queries thumbnails using the authenticated user's ID:

```js
Thumbnail.find({
    user: request.user.id
});
```

The intended result is the collection of thumbnails owned by the current user.

---

## Get Single Thumbnail

```http
GET /api/thumbnail/:id
```

The query uses both:

```text
thumbnail ID
authenticated user ID
```

This is intended to prevent one authenticated user from retrieving another user's thumbnail.

---

## Update Thumbnail

```http
PUT /api/thumbnail/:id
```

The controller uses:

```js
Thumbnail.findByIdAndUpdate()
```

and attempts to restrict the update using the authenticated user's ID.

The request body is passed as the update object.

---

## Delete Thumbnail

```http
DELETE /api/thumbnail/:id
```

The controller:

1. Finds the thumbnail by ID and authenticated user
2. Deletes the MongoDB document
3. Builds the local image path
4. Attempts to remove the associated image from disk

The intended response is:

```json
{
  "message": "Thubnail deleted"
}
```

---

## Delete All Thumbnails

```http
DELETE /api/thumbnail
```

The controller first queries the authenticated user's thumbnails and then deletes their database records.

It is also intended to remove the associated image files from local storage.

The intended response is:

```json
{
  "message": "All thumpnail was deleted"
}
```

---

# Thumbnail Model

The schema is defined in:

```text
models/thumbnail.model.js
```

Current fields:

```text
Thumbnail
├── user
├── videoName
├── version
├── image
├── paid
└── createAt
```

### `user`

MongoDB ObjectId reference to:

```text
User
```

### `videoName`

Required string containing the associated video name.

### `version`

Optional string.

### `image`

Required string containing the image path.

### `paid`

Currently defined as a **String** field:

```js
paid: {
    type: String,
    default: false
}
```

Although the thumbnail controller compares the multipart value against:

```js
"true"
```

This means the current implementation has a type inconsistency between the schema and controller.

### `createAt`

Automatically initialized using:

```js
Date.now
```

---

# Static Uploads

The server registers `@fastify/static` with:

```text
root: uploads/
prefix: /uploads/
```

The intended upload structure is:

```text
uploads/
└── thumbnail/
```

The application therefore intends image URLs to follow this format:

```text
/uploads/thumbnail/<filename>
```

However, the current static configuration contains:

```js
constraints: {
    host: "example.com"
}
```

This means static-file serving is constrained to requests matching that host.

For local development, this configuration would need to be adjusted if thumbnails are expected to be accessible from `localhost`.

---

# Root Endpoint

The server defines:

```http
GET /
```

The current response is:

```json
{
  "hello": "kavinn"
}
```

This is currently a simple application/root test endpoint.

---

# MongoDB Test Endpoint

The server also defines:

```http
GET /test-db
```

This reads:

```js
mongoose.connection.readyState
```

and converts the Mongoose connection state into a response such as:

```json
{
  "database": "connected"
}
```

Possible states handled by the code are:

```text
disconnected
connected
connecting
disconnection
unknown
```

---

# Fastify Plugins

## CORS

```text
@fastify/cors
```

Registered globally in `server.js`.

---

## Sensible

```text
@fastify/sensible
```

Provides helpers such as:

```js
reply.notFound()
reply.badRequest()
```

---

## Multipart

```text
@fastify/multipart
```

Registered to support multipart/form-data requests for thumbnail uploads.

---

## Static

```text
@fastify/static
```

Configured to expose the `uploads` directory through:

```text
/uploads/
```

---

## Environment

```text
@fastify/env
```

The environment schema currently requires:

```text
PORT
MONGODB_URI
JWT_TOKEN
```

---

## JWT

```text
@fastify/jwt
```

Configured using:

```text
JWT_SECRET
```

and exposed through the custom:

```text
fastify.authenticate
```

decorator.

---

## MongoDB

The custom MongoDB plugin establishes a Mongoose connection during startup and exposes the Mongoose instance as:

```text
fastify.mongoose
```

---

# API Summary

| Method   | Endpoint                          | Purpose                       | Intended Auth |
| -------- | --------------------------------- | ----------------------------- | ------------- |
| `GET`    | `/`                               | Basic server response         | No            |
| `GET`    | `/test-db`                        | MongoDB connection status     | No            |
| `POST`   | `/api/auth/register`              | Register user                 | No            |
| `POST`   | `/api/auth/login`                 | Login and receive JWT         | No            |
| `POST`   | `/api/auth/forgot-password`       | Generate password reset token | No            |
| `POST`   | `/api/auth/reset-password/:token` | Reset password                | No            |
| `POST`   | `/api/auth/logout`                | Logout response               | Yes           |
| `POST`   | `/api/thumbnail`                  | Create thumbnail              | Intended      |
| `GET`    | `/api/thumbnail`                  | Get user's thumbnails         | Intended      |
| `GET`    | `/api/thumbnail/:id`              | Get one thumbnail             | Intended      |
| `PUT`    | `/api/thumbnail/:id`              | Update thumbnail              | Intended      |
| `DELETE` | `/api/thumbnail/:id`              | Delete thumbnail              | Intended      |
| `DELETE` | `/api/thumbnail`                  | Delete user's thumbnails      | Intended      |

---
