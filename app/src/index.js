const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()
const mongoose = require('mongoose')
mongoose.connect('mongodb://root:example@mongo:27017/copypasta?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
mongoose.set('useCreateIndex', true)

const { secret } = require('./keys')

const port = 3000

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('public'))

app.use(cookieParser(secret))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

require('./passportSetup')(passport)

require('./routes/user')(app, passport)
require('./routes/pasta')(app, passport)

app.listen(port, () => {
  console.log('Listening on port 80 (3000 ported through 80 within docker)')
})
