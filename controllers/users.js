const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("./../models/user")

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body

  if (!password || password.length < 3) {
    return response.status(401).json({
      error: "Password is required and must be at least 3 characters long",
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const newUser = new User({
    username: username,
    name: name,
    passwordHash: passwordHash,
  })

  const savedUser = await newUser.save()

  await response.status(201).send(savedUser)
})

usersRouter.get("/", async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.get("/:id", async (request, response) => {
  const id = request.params.id

  const user = await User.findById(id)
  response.json(user)
})

module.exports = usersRouter
