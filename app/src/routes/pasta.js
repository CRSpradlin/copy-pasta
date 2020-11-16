const passport = require('passport');

const UserModel = require('../models/user')
const PastaModel = require('../models/pasta')

const router = (app) => {
    app.get('/', async (req, res) => {
        res.render('pasta', { message: 'Hello there!'})
    })
    
    app.get('/pasta/:pastaID', async (req, res) => {
        const p = await PastaModel.findById(req.params.pastaID).lean()
        res.render('pasta', { delta: JSON.stringify(p.delta) })
    })
    
    app.post('/save', async (req, res) => {
        const delta = req.body
        const _id = mongoose.Types.ObjectId();
        const p = new PastaModel({
            _id,
            delta,
        })
        await p.save()
        res.send( {id: _id} )
    })
}

module.exports = router

