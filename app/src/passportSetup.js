const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const bcrypt = require('bcrypt')

const { secret } = require('./keys')

const UserModel = require('./models/user')

const passportSetup = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, async (username, password, done) => {
    try {
      const userDocument = await UserModel.User.findOne({ username: username }).exec()
      const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash)

      if (passwordsMatch) {
        return done(null, userDocument)
      } else {
        return done('Incorrect Username / Password')
      }
    } catch (error) {
      done(error)
    }
  }))

  const opts = {}
  const cookieExtractor = function (req) {
    let token = null
    if (req && req.cookies) token = req.cookies.jwt
    return token
  }
  opts.secretOrKey = secret
  opts.jwtFromRequest = cookieExtractor

  passport.use(new JWTStrategy(opts, function (jwtPayload, done) {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired')
    }

    return done(null, jwtPayload)
  }
  ))
}

module.exports = passportSetup
