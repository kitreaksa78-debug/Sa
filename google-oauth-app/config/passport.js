const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const {
  findUserByGoogleId,
  createUser,
  updateUser,
} = require('./db')

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CALLBACK_URL } = process.env

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !CALLBACK_URL) {
  throw new Error(
    'Missing Google OAuth env vars. Copy .env.example to .env and fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CALLBACK_URL.',
  )
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const existing = findUserByGoogleId(profile.id)
        if (existing) {
          const updated = updateUser(profile)
          return done(null, updated)
        }
        const created = createUser(profile)
        return done(null, created)
      } catch (err) {
        return done(err)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  try {
    const { db } = require('./db')
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    done(null, user || null)
  } catch (err) {
    done(err)
  }
})

module.exports = passport
