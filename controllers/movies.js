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
  if (request.body.rating) {
    if (isNaN(request.body.rating)) {
      return response.status(400).json({
        error: "Rating must be a number",
      })
    }
    if (request.body.rating % 1 != 0) {
      return response.status(400).json({
        error: "Rating must be a whole number",
      })
    }
    if (request.body.rating < 0 || request.body.rating > 10) {
      return response.status(400).json({
        error: "Rating must be between 0 and 10",
      })
    }
  }
  console.log(request.body)

  const movieInfo = await moviedb.movieInfo(request.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path !== null ? movieInfo.poster_path : "",
    rating: parseInt(request.body.rating) || 0,
    review: request.body.review.toString() || "",
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
      rating: parseInt(request.body.rating) || 0,
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

  if (request.body.rating) {
    if (isNaN(request.body.rating)) {
      return response.status(400).json({
        error: "Rating must be a number",
      })
    }
    if (request.body.rating % 1 != 0) {
      return response.status(400).json({
        error: "Rating must be a whole number",
      })
    }
    if (request.body.rating < 0 || request.body.rating > 10) {
      return response.status(400).json({
        error: "Rating must be between 0 and 10",
      })
    }
  }

  const movieInfo = await moviedb.movieInfo(request.params.id)

  const movieToBeSaved = {
    movieId: movieInfo.id,
    poster: movieInfo.poster_path,
    rating: parseInt(request.body.rating) || 0,
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

movieRouter.delete("/deletemovie/watchlist/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to delete a movie from your watchlist",
    })
  }

  const foundInWatchlist = request.user.watchlist.find(
    (w) => w.movieId === request.params.id
  )

  if (!foundInWatchlist) {
    return response.status(400).json({
      error: "Movie is not in your watchlist",
    })
  }

  if (foundInWatchlist) {
    request.user.watchlist = request.user.watchlist.filter(
      (w) => w.movieId !== request.params.id
    )
  }

  await request.user.save()

  return response.end()
})

movieRouter.delete("/deletemovie/diary/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to delete a movie from your diary",
    })
  }

  const foundInDiary = request.user.diary.find(
    (d) => d.id === request.params.id
  )

  if (!foundInDiary) {
    return response.status(400).json({
      error: "This diary entry was not found in your diary",
    })
  }

  if (foundInDiary) {
    request.user.diary = request.user.diary.filter(
      (d) => d.id !== request.params.id
    )
  }

  await request.user.save()

  return response.end()
})

movieRouter.delete("/deletemovie/watched/:id", async (request, response) => {
  if (!request.user) {
    return response
      .status(401)
      .json({ error: "Must be logged in to delete a movie from your watched" })
  }

  const foundInWatched = request.user.watched.find(
    (w) => w.movieId === request.params.id
  )

  const foundInDiary = request.user.diary.find(
    (d) => d.movieId === request.params.id
  )

  if (!foundInWatched) {
    return response
      .status(400)
      .json({ error: "This movie is not in your watched movies" })
  }

  request.user.watched = request.user.watched.filter(
    (w) => w.movieId !== request.params.id
  )

  if (foundInDiary) {
    request.user.diary = request.user.diary.filter(
      (d) => d.movieId !== request.params.id
    )
  }

  await request.user.save()

  return response.end()
})

movieRouter.put("/updatemovie/watched/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to update a movie from your watched",
    })
  }

  const foundInWatched = request.user.watched.find(
    (w) => w.movieId === request.params.id
  )

  if (!foundInWatched) {
    return response.status(400).json({
      error: "Movie you are trying to update is not in your watched movies",
    })
  }

  if (request.body.rating) {
    if (isNaN(request.body.rating)) {
      return response.status(400).json({
        error: "Rating must be a number",
      })
    }
    if (request.body.rating % 1 != 0) {
      return response.status(400).json({
        error: "Rating must be a whole number",
      })
    }
    if (request.body.rating < 0 || request.body.rating > 10) {
      return response.status(400).json({
        error: "Rating must be between 0 and 10",
      })
    }
  } else {
    return response.status(400).json({
      error: "Must provide rating to update watched movie",
    })
  }

  request.user.watched.map((w) => {
    if (w.movieId === request.params.id) {
      w.rating = request.body.rating
      return w
    } else {
      return w
    }
  })

  await request.user.save()

  return response.end()
})

movieRouter.put("/updatemovie/diary/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({
      error: "Must be logged in to update a movie from your watched",
    })
  }

  const foundInDiary = request.user.diary.find(
    (d) => d.id === request.params.id
  )

  if (!foundInDiary) {
    return response.status(400).json({
      error: "Diary entry you are trying to update is not in your diary",
    })
  }

  if (request.body.rating) {
    if (isNaN(request.body.rating)) {
      return response.status(400).json({
        error: "Rating must be a number",
      })
    }
    if (request.body.rating % 1 != 0) {
      return response.status(400).json({
        error: "Rating must be a whole number",
      })
    }
    if (request.body.rating < 0 || request.body.rating > 10) {
      return response.status(400).json({
        error: "Rating must be between 0 and 10",
      })
    }
  }

  request.user.diary.map((d) => {
    if (d.id === request.params.id) {
      d.rating = request.body.rating ? request.body.rating : foundInDiary.rating
      d.review = request.body.review ? request.body.review : foundInDiary.review
      return d
    } else {
      return d
    }
  })

  await request.user.save()

  return response.end()
})

module.exports = movieRouter
