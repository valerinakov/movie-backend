require("dotenv").config()
const { MovieDb } = require("moviedb-promise")
const movieRouter = require("express").Router()
const User = require("./../models/user")

const moviedb = new MovieDb(process.env.MOVIEDB_KEY)

movieRouter.get("/search/:page/:title", async (req, res) => {
  const parameters = {
    query: req.params.title,
    page: req.params.page,
  }
  const movies = await moviedb.searchMovie(parameters)
  res.send(movies)
})

movieRouter.get("/info/:id", async (req, res) => {
  const movieInfo = await moviedb.movieInfo(req.params.id)
  res.send(movieInfo)
})

movieRouter.post("/addmovie/diary/:id", async (req, res) => {
  if (!req.user) {
    console.log("must be logged add a movie to diary")
    res.end()
  }

  const movieInfo = await moviedb.movieInfo(req.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path,
    rating: 2,
    review: "test",
  }

  req.user.diary = req.user.diary.concat(movieToBeSaved)

  const foundInWatchlist = req.user.watchlist.find(
    (w) => w.movieId === req.params.id
  )

  if (foundInWatchlist) {
    req.user.watchlist = req.user.watchlist.filter(
      (w) => w.movieId !== req.params.id
    )
  }

  await req.user.save()

  res.send(movieToBeSaved)
})

movieRouter.post("/addmovie/watched/:id", async (req, res) => {
  if (!req.user) {
    console.log("must be logged add a movie to watched")
    res.end()
  }

  const movieInfo = await moviedb.movieInfo(req.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path,
    rating: 2,
  }

  req.user.watched = req.user.watched.concat(movieToBeSaved)

  const foundInWatchlist = req.user.watchlist.find(
    (w) => w.movieId === req.params.id
  )

  if (foundInWatchlist) {
    req.user.watchlist = req.user.watchlist.filter(
      (w) => w.movieId !== req.params.id
    )
  }

  await req.user.save()

  res.send(movieToBeSaved)
})

movieRouter.post("/addmovie/watchlist/:id", async (req, res) => {
  if (!req.user) {
    console.log("must be logged add a movie to watchlist")
    res.end()
  }

  const movieInfo = await moviedb.movieInfo(req.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path,
  }

  req.user.watchlist = req.user.watchlist.concat(movieToBeSaved)
  await req.user.save()

  res.send(movieToBeSaved)
})

// export const searchMovie = async (req) => {
//   const parameters = {
//     query: req.query.name,
//     page: 1,
//   }
//   try {
//     const res = await moviedb.searchMovie(parameters)
//     return res.results
//   } catch (error) {
//     return newError(error)
//   }
// }

// export const searchPerson = async (req) => {
//   const parameters = {
//     query: req.query.name,
//     page: 1,
//   }
//   try {
//     const res = await moviedb.searchPerson(parameters)
//     return res.results
//   } catch (error) {
//     return newError(error)
//   }
// }

// export const movieKeywords = async (req) => {
//   try {
//     const res = await moviedb.movieKeywords({ query: req.query.name })
//     return res.results
//   } catch (error) {
//     return newError(error)
//   }
// }

module.exports = movieRouter
