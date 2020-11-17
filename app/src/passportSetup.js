const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const ExtractJWT = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const JWTCookieComboStrategy = require('passport-jwt-cookiecombo');
const bcrypt = require('bcrypt');

const { secret } = require('./keys');

const UserModel = require('./models/user');

let passportSetup = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },async (username, password, done) => {
    try {
      console.log('local strat username ' + username)
      const userDocument = await UserModel.user.findOne({username: username}).exec();
      const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

      if (passwordsMatch) {
        return done(null, userDocument);
      } else {
        return done('Incorrect Username / Password');
      }
    } catch (error) {
      done(error);
    }
  }));

  const opts = {}
  let cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
  };
  opts.secretOrKey = secret
  opts.jwtFromRequest = cookieExtractor

  passport.use(new JWTStrategy(opts, function(jwtPayload, done){
      if (Date.now() > jwtPayload.expires) {
        return done('jwt expired')
      }

      return done(null, jwtPayload)
    }
  ));
}

module.exports = passportSetup;