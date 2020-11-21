const mongoose = require('mongoose')

const Pasta = mongoose.model('Pasta', {
  name: { type: String, default: 'Default Pasta Name' },
  language: { type: String, default: 'Plain Text' },
  delta: Object,
  createdAt: Date,
  lastUpdated: Date
})

module.exports = { Pasta: Pasta, methods: {} }
