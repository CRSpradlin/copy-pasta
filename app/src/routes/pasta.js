const mongoose = require('mongoose')
const UserModel = require('../models/user')
const PastaModel = require('../models/pasta')

const router = (app, passport) => {
    app.get('/', async (req, res) => {
        res.render('pasta')
    })
    
    app.get('/pasta/:pastaID',
        passport.authenticate('jwt', {session: false, failWithError: true}),
        async (req, res, next) => {
            const { user } = req
            const pasta = req.params.pastaID
            const p = await PastaModel.pasta.findById(pasta).lean()

            if(await UserModel.methods.ownsPasta(user.username, pasta)){
                res.render('pasta', { delta: JSON.stringify(p.delta), pasta: JSON.stringify(p), id: pasta })
            } else {
                res.render('view', { delta: JSON.stringify(p.delta), pasta: JSON.stringify(p), id: pasta })
            }    
        },
        async (err, req, res, next) => {
            res.status(200)
            console.log(err)
            const pasta = req.params.pastaID
            const p = await PastaModel.pasta.findById(pasta).lean()
            res.render('view', { delta: JSON.stringify(p.delta), pasta: JSON.stringify(p), id: pasta })
        }
    )
    
    app.post('/save', 
        passport.authenticate('jwt', {session: false, failWithError: true}),
        async (req, res, next) => {
            const { user } = req
            console.log(user['username'])
            let p, _id;
            const delta = req.body.delta
            const name = req.body.name
            console.log(req.body)
            const isOwner = await UserModel.methods.ownsPasta(user.username, req.body.id)
            console.log("isOwnser: "+isOwner)
            if(isOwner){
                console.log("OWN DA PASTA")
                _id = req.body.id
                
                p = await PastaModel.pasta.findOneAndUpdate({_id:_id}, 
                    {
                        delta:delta,
                        name:name,
                        lastUpdated: new Date(Date.now()),
                    }, 
                    {upsert: true}
                ).exec()

            } else {
                _id = mongoose.Types.ObjectId();
                p = new PastaModel.pasta({
                    _id:_id,
                    delta:delta,
                    name:name,
                    createdAt: new Date(Date.now()),
                    lastUpdated: new Date(Date.now()),
                })
                await p.save()
                const full_user = await UserModel.user.findOne({username: user.username}).exec();
                full_user.pastas.push(`${_id}`)
                console.log(full_user.pastas);
                await UserModel.user.findOneAndUpdate({username:user.username},
                    {
                        pastas: full_user.pastas
                    },
                    {upsert: true}
                ).exec()
            }

            res.send( {id: _id})
        },
        async (err, req, res, next) => {
            const delta = req.body.delta
            const name = req.body.name
            const _id = mongoose.Types.ObjectId();
            const p = new PastaModel.pasta({
                _id:_id,
                delta:delta,
                name:name,
                createdAt: new Date(Date.now()),
                lastUpdated: new Date(Date.now()),
            })
            await p.save()
            res.send( {id: _id})
        }
    )
}

module.exports = router

