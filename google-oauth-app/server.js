require('dotenv').config()

const express = require('express')
const session = require('express-session')
const passport = require('./config/passport')
const authRoutes = require('./routes/auth')
const indexRoutes = require('./routes/index')

const app = express()

app.set('view engine', 'ejs')
app.set('views', require('path').join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))
app.use(express.static(require('path').join(__dirname, 'public')))

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

// Expose current user to all views
app.use((req, res, next) => {
  res.locals.user = req.user || null
  res.locals.path = req.path
  next()
})

app.use('/auth', authRoutes)
app.use('/', indexRoutes)

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    statusCode: 404,
    message: 'Page not found',
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).render('error', {
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

module.exports = app
