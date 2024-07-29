const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: false,
  },
  review: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  passwordHash: String,
  watchlist: [movieSchema],
  diary: [movieSchema],
  watched: [movieSchema],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
})

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject._id) {
      returnedObject.id = returnedObject._id.toHexString()
    }
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

movieSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toHexString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
