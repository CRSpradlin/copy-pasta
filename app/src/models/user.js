const mongoose = require('mongoose')

const User = mongoose.model("User", {
    username: { type: String, index: true, unique: true, dropDups: true, required: true},
    passwordHash: {type: String, required: true},
    pastas: {type: Array},
})

const methods = {}
const ownsPasta = async (username, id) => {
    const user = await User.findOne({username: username}).exec();
    console.log(username + ' is owner of id?: '+id+ ' ' +user.pastas.includes(`${id}`))
    if(user.pastas.includes(`${id}`)){
        return true;
    }
    return false;
}
methods.ownsPasta = ownsPasta

module.exports = { user: User, methods: methods }