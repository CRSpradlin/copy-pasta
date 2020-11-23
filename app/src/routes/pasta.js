const mongoose = require('mongoose')
const UserModel = require('../models/user')
const PastaModel = require('../models/pasta')

const router = (app, passport) => {
  app.get('/about',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      res.render('about', { user: user })
    },
    async (err, req, res, next) => {
      if (err) {
        res.status(200)
        res.render('about')
      } else {
        res.status(500).send()
      }
    }
  )

  app.get('/',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      res.render('pasta', { user: user })
    },
    async (err, req, res, next) => {
      if (err) {
        res.status(200)
        res.render('pasta')
      } else {
        res.status(500).send()
      }
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
      if (err) {
        res.status(200)
        const { user } = req
        const pasta = req.params.pastaID
        const p = await PastaModel.Pasta.findById(pasta).lean()
        res.render('view', { pasta: JSON.stringify(p), id: pasta, user: user })
      } else {
        res.status(500).send()
      }
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
      if (err) {
        res.status(200)
        res.redirect('/login')
      } else {
        res.status(500).send()
      }
    }
  )

  app.get('/delete/:pastaID',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const { user } = req
      const id = req.params.pastaID
      const pasta = await PastaModel.Pasta.findOne({ _id: id })
      if (pasta) {
        const isOwner = await UserModel.methods.ownsPasta(user.username, id)
        if (isOwner) {
          const response = await PastaModel.Pasta.deleteOne({ _id: id })
          if (response.deletedCount === 1) {
            const fullUser = await UserModel.User.findOne({ username: user.username })
            const pastaArray = fullUser.pastas
            const index = pastaArray.indexOf(id)
            if (index !== -1) {
              pastaArray.splice(index, 1)
            }
            fullUser.pastas = pastaArray
            await fullUser.save()
            res.status(200)
            res.render('delete', { pastaName: pasta.name })
          } else {
            res.redirect('/pasta')
          }
        } else {
          res.redirect('/pasta')
        }
      } else {
        res.redirect('/pasta')
      }
    }
  )

  app.post('/save',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req, res, next) => {
      const { user } = req
      let p, _id
      const delta = req.body.delta
      const name = req.body.name

      const isOwner = await UserModel.methods.ownsPasta(user.username, req.body.id)

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
      if (err) {
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
      } else {
        res.status(500).send()
      }
    }
  )
}

module.exports = router
