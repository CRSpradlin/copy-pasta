const mongoose = require('mongoose')
const UserModel = require('../models/user')
const PastaModel = require('../models/pasta')

const router = (app, passport) => {
  app.get('/',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      res.render('pasta', { user: user })
    },
    async (err, req, res, next) => {
      console.log(err)
      res.status(200)
      res.render('pasta')
    }
  )

  app.get('/pasta/:pastaID',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      const pasta = req.params.pastaID
      const p = await PastaModel.Pasta.findById(pasta).lean()

      if (await UserModel.methods.ownsPasta(user.username, pasta)) {
        res.render('pasta', { pasta: JSON.stringify(p), id: pasta, user: user })
      } else {
        res.render('view', { pasta: JSON.stringify(p), id: pasta, user: user })
      }
    },
    async (err, req, res, next) => {
      console.log(err)
      res.status(200)
      const { user } = req
      const pasta = req.params.pastaID
      const p = await PastaModel.Pasta.findById(pasta).lean()
      res.render('view', { pasta: JSON.stringify(p), id: pasta, user: user })
    }
  )

  app.get('/pasta',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      const pastas = await UserModel.methods.getPastas(user.username)
      res.render('list', { pastaList: pastas, user: user })
    },
    async (err, req, res, next) => {
      console.log(err)
      res.status(200)
      res.redirect('/login')
    }
  )

  app.post('/save',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      console.log(user.username)
      let p, _id
      const delta = req.body.delta
      const name = req.body.name
      console.log(req.body)
      const isOwner = await UserModel.methods.ownsPasta(user.username, req.body.id)
      console.log('isOwnser: ' + isOwner)
      if (isOwner) {
        _id = req.body.id

        p = await PastaModel.Pasta.findOneAndUpdate({ _id: _id },
          {
            delta: delta,
            name: name,
            lastUpdated: new Date(Date.now())
          },
          { upsert: true }
        ).exec()
      } else {
        _id = mongoose.Types.ObjectId()
        p = new PastaModel.Pasta({
          _id: _id,
          delta: delta,
          name: name,
          createdAt: new Date(Date.now()),
          lastUpdated: new Date(Date.now())
        })
        await p.save()
        const fullUser = await UserModel.User.findOne({ username: user.username }).exec()
        fullUser.pastas.push(`${_id}`)
        console.log(fullUser.pastas)
        await UserModel.User.findOneAndUpdate({ username: user.username },
          {
            pastas: fullUser.pastas
          },
          { upsert: true }
        ).exec()
      }

      res.send({ id: _id })
    },
    async (err, req, res, next) => {
      console.log(err)
      const delta = req.body.delta
      const name = req.body.name
      const _id = mongoose.Types.ObjectId()
      const p = new PastaModel.Pasta({
        _id: _id,
        delta: delta,
        name: name,
        createdAt: new Date(Date.now()),
        lastUpdated: new Date(Date.now())
      })
      await p.save()
      res.send({ id: _id })
    }
  )
}

module.exports = router
