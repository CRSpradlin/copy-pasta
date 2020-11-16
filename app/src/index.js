const express = require('express')
var bodyParser = require('body-parser')
const pug = require('pug')
const app = express()
const mongoose = require('mongoose')
mongoose.connect("mongodb://root:example@mongo:27017/copypasta?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.set('useCreateIndex', true)
const UserModel = require('./models/user')
const PastaModel = require('./models/pasta')

const port = 3000

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }));

require('./passportSetup')

//app routes
require('./routes/user')(app)
require('./routes/pasta')(app)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})