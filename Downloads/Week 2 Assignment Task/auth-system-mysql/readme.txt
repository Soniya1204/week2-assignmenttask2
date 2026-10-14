# Secure User Authentication System

A secure, full-stack user authentication system built with **Node.js**, **Express**, **MySQL**, and **JSON Web Tokens (JWT)** delivered via **HttpOnly cookies**.

---

## Features

- **User Registration**: Sign up with username, email, and password.
- **Password Hashing**: Uses `bcryptjs` with a cost factor (salt round) of 12 for password security.
- **Secure Authentication**: Validates credentials against MySQL with parameterized queries to prevent SQL Injection.
- **HttpOnly Cookie Sessions**: Stores JWTs in `HttpOnly` cookies to protect tokens from Cross-Site Scripting (XSS) attacks.
- **Protected Routes**: Middleware verifies active user sessions before granting access to protected endpoints (`/api/auth/me`).
- **Session Termination**: Logout endpoint clears the auth cookie securely.
- **Input Validation**: Uses `express-validator` for sanitization and clear user feedback.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (`mysql2/promise`)
- **Authentication**: JSON Web Token (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **Frontend**: HTML5, CSS3 (Dark Glassmorphism Theme), Vanilla JavaScript (Fetch API)

---

## Project Structure

```text
auth-system-mysql/
├── config/
│   └── db.js                 # MySQL database connection pool
├── middleware/
│   └── authMiddleware.js     # JWT route protection middleware
├── routes/
│   └── authRoutes.js         # Register, Login, Logout, and Me endpoints
├── public/
│   ├── index.html            # Registration / Login interface
│   ├── dashboard.html        # Protected dashboard page
│   ├── app.js                # Frontend form handling & API integration
│   └── style.css             # Glassmorphism UI stylesheet
├── .env                      # Environment variables configuration
├── package.json              # Dependencies and scripts
├── schema.sql                # Database schema script
└── server.js                 # Express application entry point