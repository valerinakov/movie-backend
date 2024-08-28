const { test, describe, beforeEach } = require("node:test")
const assert = require("node:assert")
const User = require("../models/user")
const app = require("../app")
const supertest = require("supertest")
const helper = require("./test_helper")

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  for (let user of helper.users) {
    const userObject = new User(user)
    await userObject.save()
  }
})

describe("when testing users api", () => {
  describe("and we are viewing users", () => {
    test("users are returned as json", async () => {
      await api
        .get("/api/users")
        .expect(200)
        .expect("Content-Type", /application\/json/)
    })
  })

  describe("and we are creating users", () => {
    test("if username is not there user is not created", async () => {
      const usersAtStart = await helper.usersInDb()

      const userWithoutUsername = {
        name: "nameless",
        password: "123123",
      }

      await api.post("/api/users").send(userWithoutUsername).expect(400)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("if username is not unique user is not created", async () => {
      const usersAtStart = await helper.usersInDb()

      const userWithDuplicateUsername = {
        username: "test",
        name: "John Doe",
        password: "123",
      }

      const result = await api
        .post("/api/users")
        .send(userWithDuplicateUsername)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()

      assert(result.body.error.includes("expected `username` to be unique"))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("if password is not there user is not created", async () => {
      const usersAtStart = await helper.usersInDb()

      const userWithoutPassword = {
        username: "test username",
        name: "John Doe",
      }

      const result = await api
        .post("/api/users")
        .send(userWithoutPassword)
        .expect(401)

      const usersAtEnd = await helper.usersInDb()

      assert(
        result.body.error.includes(
          "Password is required and must be at least 3 characters long"
        )
      )
    })

    test("if password is too short user is not created", async () => {
      const usersAtStart = await helper.usersInDb()

      const userWithInvalidPassword = {
        username: "test username",
        name: "John Doe",
        password: "12",
      }

      const result = await api
        .post("/api/users")
        .send(userWithInvalidPassword)
        .expect(401)

      const usersAtEnd = await helper.usersInDb()

      assert(
        result.body.error.includes(
          "Password is required and must be at least 3 characters long"
        )
      )
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("if user is valid, user is added to db", async () => {
      const usersAtStart = await helper.usersInDb()

      const validUser = {
        username: "Testing",
        name: "Mary Jane",
        password: "12313",
      }

      await api.post("/api/users").send(validUser).expect(201)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    })
  })
})
