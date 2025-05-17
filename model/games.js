const mongoose = require("mongoose")
const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    dev: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
})
module.exports = mongoose.model("game", gameSchema)