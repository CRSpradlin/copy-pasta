const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const keys = require('../keys')
const UserModel = require('../models/user')

let routes = (app) => {
    app.get('/register', async (req, res) => {
        res.render('register');
    })
    app.post('/register', async (req, res) => {
        const { username, password, password_again } = req.body
        
        if(password_again != password){
            res.render('register', {error: {message:"Passwords do not match"} })
        } else {
            const hashCost = 10
      
            try {
              //const salt = await bcrypt.genSalt(hashCost);
              const passwordHash = await bcrypt.hash(password, hashCost)
              const userDocument = new UserModel({ username, passwordHash })
              await userDocument.save()
              
              res.redirect('/login')
              
            } catch (error) {
              res.render('register', {error: {message:error}})
            }
        }

    })
    
    app.get('/login', async (req, res) => {
        res.render('login');
    })
    app.post('/login', (req, res) => {
        passport.authenticate(
          'local',
          { session: false },
          (error, user) => {
            if (error || !user) {
                res.render('login', {error:{message:error}})
            } else {
            /** This is what ends up in our JWT */
                const payload = {
                    username: user.username,
                    expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
                }
        
                /** assigns payload to req.user */
                req.login(payload, {session: false}, (error) => {
                    if (error) {
                        res.render('login', {err:{message:error}})
                    } else {
                    /** generate a signed json web token and return it in the response */
                    const token = jwt.sign(JSON.stringify(payload), keys.secret)
            
                    /** assign our jwt to the cookie */
                    res.cookie('jwt', jwt, { httpOnly: true, secure: true })

                    res.render("pasta")
                    }
                })
    
            }
          },
        )(req, res)
    })
      
}

module.exports = routes