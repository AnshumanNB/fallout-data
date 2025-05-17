const {addGame, readGame, updateGame, deleteGame} = require("../controller/gamescontroller")

const route = require("express").Router()

route.get("/", readGame)
route.post("/", addGame)
route.put("/:id", updateGame)
route.delete("/:id", deleteGame)

module.exports = route