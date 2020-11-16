const mongoose = require('mongoose')

const User = mongoose.model("User", {
    username: { type: String, index: true, unique: true, dropDups: true, required: true},
    passwordHash: {type: String, required: true}
})

module.exports = User;