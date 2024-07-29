const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("./../models/user")
const mongoose = require("mongoose")

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

usersRouter.post("/addfriend/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to add a friend",
    })
  }

  const doesUserExist = await User.findById(request.params.id)
  if (!doesUserExist) {
    return response.status(401).json({
      error: "User you want to add as friend does not exist",
    })
  }

  const foundInFriendList = await User.findOne({ friends: request.params.id })
  if (foundInFriendList) {
    return response.status(401).json({
      error: "This user has already been added to your friend list",
    })
  }
  request.user.friends = request.user.friends.concat(request.params.id)
  await request.user.save()

  const updatedUser = await User.findById(request.user.id).populate("friends", {
    username: 1,
    name: 1,
  })

  return response.status(201).json(updatedUser)
})
usersRouter.delete("/deletefriend/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to delete a friend",
    })
  }

  const doesUserExist = await User.findById(request.params.id)
  if (!doesUserExist) {
    return response.status(401).json({
      error: "User you want to add as friend does not exist",
    })
  }

  const foundInFriendList = await User.findOne({ friends: request.params.id })
  if (!foundInFriendList) {
    return response.status(401).json({
      error: "This user is not on your friendlist",
    })
  }
  request.user.friends = request.user.friends.filter((f) => {
    f._id.toString() !== request.params.id
  })

  await request.user.save()
  return response.end()
})

usersRouter.get("/friends/", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to see your friends",
    })
  }

  const user = await User.findById(request.user._id.toString()).populate(
    "friends",
    {
      username: 1,
      name: 1,
    }
  )
  return response.json(user.friends)
})

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("friends", {
    username: 1,
    name: 1,
  })
  return response.json(users)
})

usersRouter.get("/:id", async (request, response) => {
  const id = request.params.id

  const user = await User.findById(id).populate("friends", {
    username: 1,
    name: 1,
  })

  if (user) {
    return response.json(user)
  } else {
    return response.status(400).json({
      error: "User does not exist",
    })
  }
})

module.exports = usersRouter
