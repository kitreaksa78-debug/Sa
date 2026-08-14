# Google OAuth App

A simple web application demonstrating **Google OAuth 2.0 login** built with **Node.js + Express + EJS + SQLite + Passport.js**.

Users can sign in with their Google account, view a protected profile page, and log out. User data is stored in a local SQLite database.

## Features

- Google OAuth 2.0 login via Passport.js
- Session-based authentication (`express-session`)
- SQLite storage for user profiles (`better-sqlite3`)
- Protected `/profile` route (requires login)
- Server-side rendering with EJS

## Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Backend      | Node.js + Express              |
| View engine  | EJS                            |
| Database     | SQLite (better-sqlite3)        |
| Auth         | Passport + passport-google-oauth20 |
| Session      | express-session                |

## Prerequisites

- Node.js 18+
- A Google account

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create Google OAuth credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services → OAuth consent screen** and configure it (External or Internal). Add your Google account as a test user if the app is in testing mode.
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
5. Choose **Web application**.
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/google/callback
   ```
7. Click **Create** and copy the **Client ID** and **Client Secret**.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=a-long-random-string
CALLBACK_URL=http://localhost:3000/auth/google/callback
PORT=3000
```

### 4. Run the app

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

Visit http://localhost:3000.

## Usage

1. Open the home page and click **Login with Google**.
2. Approve the consent screen on Google.
3. You'll be redirected to your **profile** page showing your name, email, and avatar.
4. Click **Logout** to end the session.

## Project structure

```
├── server.js              # Express app entry point
├── config/
│   ├── db.js              # SQLite connection + user queries
│   └── passport.js        # Google OAuth strategy
├── middleware/
│   └── auth.js            # requireAuth guard
├── routes/
│   ├── auth.js            # login / callback / logout
│   └── index.js           # home + profile
├── views/                 # EJS templates
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   ├── profile.ejs
│   └── error.ejs
├── public/css/style.css
└── .env.example
```

## Notes

- The SQLite database file (`data/app.db`) is created automatically on first run and is git-ignored.
- Never commit your `.env` file. It contains secrets.
- For production, set `NODE_ENV=production` (enables secure session cookies) and use HTTPS.
