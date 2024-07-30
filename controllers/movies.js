require("dotenv").config()
const { MovieDb } = require("moviedb-promise")
const movieRouter = require("express").Router()
const User = require("./../models/user")

const moviedb = new MovieDb(process.env.MOVIEDB_KEY)

movieRouter.get("/search/:page/:title", async (request, response) => {
  if (isNaN(request.params.page)) {
    return response.status(401).json({
      error: "Page identifier must be a number",
    })
  }

  const parameters = {
    query: request.params.title,
    page: request.params.page,
  }
  const movies = await moviedb.searchMovie(parameters)
  response.send(movies)
})

movieRouter.get("/info/:id", async (request, response) => {
  const movieInfo = await moviedb.movieInfo(request.params.id)
  if (movieInfo) {
    return response.send(movieInfo)
  }
})

movieRouter.post("/addmovie/diary/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to add a movie to your diary",
    })
  }

  const movieInfo = await moviedb.movieInfo(request.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path !== null ? movieInfo.poster_path : "",
    rating: 2,
    review: "test",
  }

  const foundInWatchlist = request.user.watchlist.find(
    (w) => w.movieId === request.params.id
  )

  const foundInWatched = request.user.watched.find(
    (w) => w.movieId === request.params.id
  )

  if (foundInWatchlist) {
    request.user.watchlist = request.user.watchlist.filter(
      (w) => w.movieId !== request.params.id
    )
  }
  if (!foundInWatched) {
    request.user.watched = request.user.watched.concat({
      movieId: movieInfo.id,
      poster: movieInfo.poster_path !== null ? movieInfo.poster_path : "",
      rating: 2,
    })
  }

  request.user.diary = request.user.diary.concat(movieToBeSaved)

  await request.user.save()

  return response.send(movieToBeSaved)
})

movieRouter.post("/addmovie/watched/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to add a movie to your watched",
    })
  }

  const movieInfo = await moviedb.movieInfo(request.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path,
    rating: 2,
  }

  const foundInWatchlist = request.user.watchlist.find(
    (w) => w.movieId === request.params.id
  )

  const foundInWatched = request.user.watched.find(
    (w) => w.movieId === request.params.id
  )

  if (foundInWatchlist) {
    request.user.watchlist = request.user.watchlist.filter(
      (w) => w.movieId !== request.params.id
    )
  }

  if (foundInWatched) {
    return response.status(400).json({
      error: "Movie is already in your watched",
    })
  }

  request.user.watched = request.user.watched.concat(movieToBeSaved)

  await request.user.save()

  return response.send(movieToBeSaved)
})

movieRouter.post("/addmovie/watchlist/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to add a movie to your watchlist",
    })
  }

  const movieInfo = await moviedb.movieInfo(request.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path,
  }

  const foundInWatchlist = request.user.watchlist.find(
    (w) => w.movieId === request.params.id
  )

  if (foundInWatchlist) {
    return response.status(400).json({
      error: "Movie is already in your watchlist",
    })
  }

  request.user.watchlist = request.user.watchlist.concat(movieToBeSaved)
  await request.user.save()

  return response.send(movieToBeSaved)
})

module.exports = movieRouter
