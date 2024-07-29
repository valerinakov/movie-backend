const { MONGODB_URI } = require("./utils/config")
const express = require("express")
require("express-async-errors")
const cors = require("cors")
const usersRouter = require("./controllers/users")
const loginRouter = require("./controllers/login")
const movieRouter = require("./controllers/movies")
const {
  errorHandler,
  tokenExtractor,
  userExtractor,
} = require("./utils/middleware")

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

app.use(express.json())
app.use(cors())
app.use(tokenExtractor)

app.use("/api/users", userExtractor, usersRouter)
app.use("/api/login", loginRouter)
app.use("/api/movies", userExtractor, movieRouter)

app.use(errorHandler)

module.exports = app
