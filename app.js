const { MONGODB_URI } = require("./utils/config")
const express = require("express")
const User = require("./models/user")

const mongoose = require("mongoose")

const app = express()

mongoose.set("strictQuery", false)

console.log("connecting to", MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message)
  })

app.get("/", async (req, res) => {
  //   const newUser = new User({
  //     username: "test",
  //     diary: [
  //       {
  //         movieId: "12",
  //         rating: 5,
  //         review: "Great day!",
  //       },
  //     ],
  //   })

  //   const savedUser = await newUser.save()
  res.send("hello")
})

module.exports = app
