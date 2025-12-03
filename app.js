const express = require("express")
const mongoose = require("mongoose")
require("dotenv/config")
const gamesRoute = require("./routes/gamesroute")

const app = express()

app.use(express.json())

app.get("/home", (req, res)=>{
    res.send("Fallout API")
})

app.get("/about",(req, res)=>{
    res.send("Developed by Anshumann Bele")
})

app.use("/api/games", gamesRoute)

app.listen(process.env.PORT)

async function dB() {
    try {
        const res = await mongoose.connect(process.env.DB)
        console.log(res.default.STATES.connected);
    } catch (error) {
        console.log(error.message);
    }
}

dB();