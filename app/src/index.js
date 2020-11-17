const express = require('express')
const passport = require('passport')
var bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const pug = require('pug')
const app = express()
const mongoose = require('mongoose')
mongoose.connect("mongodb://root:example@mongo:27017/copypasta?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
mongoose.set('useCreateIndex', true)

const { secret } = require('./keys')
const UserModel = require('./models/user')
const PastaModel = require('./models/pasta')

const port = 3000

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('public'))

app.use(cookieParser(secret))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./passportSetup')(passport)

//app routes
require('./routes/user')(app, passport)
require('./routes/pasta')(app, passport)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})