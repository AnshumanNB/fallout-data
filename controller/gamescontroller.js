const Game = require("../model/games")

exports.addGame = async (req, res) => {
    try {
        const data = await Game.create(req.body)
        return res.json({ errors: false, data: data })
    } catch (error) {
        return res.status(500).json({ errors: true, message: error.message })
    }
}

exports.updateGame = async (req, res) => {
    try {
        const data = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json({ errors: false, data: data })
    } catch (error) {
        return res.status(500).json({ errors: true, message: error.message })
    }
}

exports.readGame = async (req, res) => {
    try {
        const data = await Game.find()
        return res.json({ errors: false, data: data })
    } catch (error) {
        return res.status(500).json({ errors: true, message: error.message })
    }
}

exports.deleteGame = async (req, res) => {
    try {
        const data = await Game.findByIdAndDelete()
        return res.json({ errors: false, data: data})
    } catch (error) {
        return res.status(500).json({errors: true, message: error.message})
    }
}