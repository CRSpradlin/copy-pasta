const express = require('express')
var bodyParser = require('body-parser')
const pug = require('pug')
const app = express()
const mongoose = require('mongoose')
const port = 3000

let connection = mongoose.connect("mongodb://root:example@mongo:27017/copypasta?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.set('useCreateIndex', true)

const Pasta = mongoose.model("Pasta", {
    name: {type: String, default: ""},
    language: {type: String, default: "Plain Text"},
    delta: Object,
})

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('public'))

app.use(bodyParser.json())

app.get('/', async (req, res) => {
    res.render('pasta', { message: 'Hello there!'})
})

app.get('/pasta/:pastaID', async (req, res) => {
    const p = await Pasta.findById(req.params.pastaID).lean()
    res.render('pasta', { message: 'Hello there!', delta: JSON.stringify(p.delta)})
})

app.post('/save', async (req, res) => {
    const delta = req.body
    const _id = mongoose.Types.ObjectId();
    const p = new Pasta({
        _id,
        delta,
    })
    await p.save()
    res.send( {id: _id})
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})