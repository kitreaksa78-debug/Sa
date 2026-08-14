const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')

router.get('/', (req, res) => {
  res.render('home', { user: req.user })
})

router.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { user: req.user })
})

module.exports = router
