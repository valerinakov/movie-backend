require("dotenv").config()
const { MovieDb } = require("moviedb-promise")
const movieRouter = require("express").Router()

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
