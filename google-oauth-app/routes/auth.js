const express = require('express')
const router = express.Router()

router.get(
  '/google',
  (req, res, next) => {
    // Preserve intended destination after login
    if (req.query.returnTo) {
      req.session.returnTo = req.query.returnTo
    }
    next()
  },
  require('../config/passport').authenticate('google', {
    scope: ['profile', 'email'],
  }),
)

router.get(
  '/google/callback',
  require('../config/passport').authenticate('google', {
    failureRedirect: '/',
  }),
  (req, res) => {
    const returnTo = req.session.returnTo || '/profile'
    delete req.session.returnTo
    res.redirect(returnTo)
  },
)

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr)
      res.clearCookie('connect.sid')
      res.redirect('/')
    })
  })
})

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr)
      res.clearCookie('connect.sid')
      res.redirect('/')
    })
  })
})

module.exports = router
