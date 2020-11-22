const mongoose = require('mongoose')
const PastaModel = require('../models/pasta')

const User = mongoose.model('User', {
  username: { type: String, index: true, unique: true, dropDups: true, required: true },
  passwordHash: { type: String, required: true },
  pastas: { type: Array }
})

const methods = {}

const ownsPasta = async (username, id) => {
  const user = await User.findOne({ username: username }).exec()
  if (user.pastas.includes(`${id}`)) {
    return true
  }
  return false
}
methods.ownsPasta = ownsPasta

const getPastas = async (username) => {
  const pastas = []
  const user = await User.findOne({ username: username }).exec()
  const pastaIDs = user.pastas
  for (const index in pastaIDs) {
    const pasta = await PastaModel.Pasta.findOne({ _id: pastaIDs[index] }).exec()
    pastas.push(pasta)
  }
  return pastas
}
methods.getPastas = getPastas

const userExists = async (username) => {
  const count = await User.countDocuments({ username: username })
  return count !== 0
}
methods.userExists = userExists

module.exports = { User: User, methods: methods }
