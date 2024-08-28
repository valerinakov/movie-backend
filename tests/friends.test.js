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

describe("when testing friends api", () => {
  describe("and we are viewing friends", () => {
    test("friends are returned as json", async () => {
      const userLogin = {
        username: "john",
        password: "123",
      }
      const login = await api
        .post("/api/login")
        .send(userLogin)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      const test = await api
        .get("/api/users/friends")
        .set("Authorization", "Bearer ".concat(login.body.token))
        .expect(200)
        .expect("Content-Type", /application\/json/)
    })
  })
  describe("and we add a friend", () => {
    test("friend is added if it is not in our friend list", async () => {
      const usersAtStart = await helper.usersInDb()

      const userLogin = {
        username: "test",
        password: "123",
      }
      const login = await api
        .post("/api/login")
        .send(userLogin)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      await api
        .post(`/api/users/addfriend/${usersAtStart[1].id}`)
        .set("Authorization", "Bearer ".concat(login.body.token))
        .expect(201)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd[0].friends[1].toString(), usersAtEnd[1].id)
    })

    test("friend is not added if it is in our friend list", async () => {
      const usersAtStart = await helper.usersInDb()

      const userLogin = {
        username: "test",
        password: "123",
      }
      const login = await api
        .post("/api/login")
        .send(userLogin)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      await api
        .post(`/api/users/addfriend/${usersAtStart[2].id}`)
        .set("Authorization", "Bearer ".concat(login.body.token))
        .expect(401)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(
        usersAtEnd[0].friends.length,
        usersAtStart[0].friends.length
      )
    })
  })
  describe("and we delete a friend", () => {
    test("if friend is in our friends list it is deleted", async () => {
      const usersAtStart = await helper.usersInDb()

      const userLogin = {
        username: "test",
        password: "123",
      }
      const login = await api
        .post("/api/login")
        .send(userLogin)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      await api
        .delete(`/api/users/deletefriend/${usersAtStart[2].id}`)
        .set("Authorization", "Bearer ".concat(login.body.token))
        .expect(204)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(
        usersAtEnd[0].friends.length,
        usersAtStart[0].friends.length - 1
      )
    })
  })
})
