const User = require("../models/user")
const mongoose = require("mongoose")
const newId = new mongoose.mongo.ObjectId("660c50b78900bc2bd698d05a")

const users = [
  {
    _id: "668b39ee8320099a8195b59f",
    username: "test",
    name: "tester",
    passwordHash:
      "$2b$10$k/8.a0BNm9KrPO4Z30kkcOkqgoshGCcl5v3j94zKNVixhdpLcKXk.",
    watchlist: [],
    diary: [
      {
        movieId: "1127166",
        poster: "/uoBHsxSgfc3PQsSn98RfnbePHOy.jpg",
        rating: "2",
        review: "test",
        _id: "66b3d247b8b8e433aaa957a1",
        createdAt: "1723060807116",
      },
    ],
    __v: "69",
    friends: [new mongoose.mongo.ObjectId("66bd1fc06a623f66c563bf62")],
    watched: [
      {
        movieId: "1127166",
        poster: "/uoBHsxSgfc3PQsSn98RfnbePHOy.jpg",
        rating: "5",
        _id: "66b3d247b8b8e433aaa957a0",
        createdAt: "1723060807114",
      },
    ],
  },
  {
    _id: "66bd111d538e5ff959e17010",
    username: "john",
    name: "John Doe",
    passwordHash:
      "$2b$10$MXE54Ws4ZQKmwh3lOO02deKEYJunTR5uSEF7vJJt0mpJZyS9GfRJe",
    friends: [],
    watchlist: [],
    diary: [],
    watched: [],
    __v: "0",
  },
  {
    _id: "66bd1fc06a623f66c563bf62",
    username: "jane",
    name: "Jane Doe",
    passwordHash:
      "$2b$10$sTO3161L303bN8BhevrbXOCmEjJ4RPrhSt1I2IoLQTKKi4etUmsH.",
    friends: [],
    watchlist: [],
    diary: [],
    watched: [],
    __v: "0",
  },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = { users, usersInDb }
