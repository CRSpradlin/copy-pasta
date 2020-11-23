const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const keys = require('../keys')
const UserModel = require('../models/user')

const routes = (app, passport) => {
  app.get('/register', async (req, res) => {
    res.render('register')
  })
  app.post('/register', async (req, res) => {
    const { username, password, passwordAgain } = req.body

    if (passwordAgain !== password) {
      res.render('register', { error: { message: 'Passwords do not match' } })
    } else {
      if (await UserModel.methods.userExists(username)) {
        res.render('register', { error: { message: 'That username is already taken, please try a different one.' } })
      } else {
        const hashCost = 10
        try {
          const passwordHash = await bcrypt.hash(password, hashCost)
          const userDocument = new UserModel.User({ username, passwordHash })
          await userDocument.save()

          res.redirect('/login')
        } catch (error) {
          res.render('register', { error: { message: error } })
        }
      }
    }
  })

  app.get('/login', async (req, res) => {
    res.render('login')
  })
  app.post('/login', (req, res) => {
    passport.authenticate(
      'local',
      { session: false },
      (error, user) => {
        if (error || !user) {
          res.render('login', { error: { message: 'Could not find that username and password combination, please try again.' } })
        } else {
          const payload = {
            username: user.username,
            expires: Date.now() + parseInt(27000000)
          }

          req.login(payload, { session: false }, (error) => {
            if (error) {
              res.render('login', { err: { message: error } })
            } else {
              const token = jwt.sign(payload, keys.secret)
              res.cookie('jwt', token, { httpOnly: false })
              res.redirect(302, '/')
            }
          })
        }
      }
    )(req, res)
  })

  app.get('/logout', async (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/login')
  })
}

module.exports = routes
