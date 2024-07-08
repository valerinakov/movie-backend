const mongoose = require("mongoose")

const diarySchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    // unique: true,
  },
  name: String,
  passwordHash: String,
  watchlist: [
    {
      type: String,
    },
  ],
  diary: [diarySchema],
})

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toHexString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

diarySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toHexString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
