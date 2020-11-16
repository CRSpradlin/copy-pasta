const mongoose = require('mongoose')

const Pasta = mongoose.model("Pasta", {
    name: {type: String, default: ""},
    language: {type: String, default: "Plain Text"},
    delta: Object,
})

module.exports = Pasta