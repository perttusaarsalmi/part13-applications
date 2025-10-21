const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert') // Import assert
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await User.deleteMany({})
  const userObjects = await Promise.all(
    helper.testUsers.map(async (user) => {
      const passwordHash = await bcrypt.hash(user.password, 10)
      return new User({
        username: user.username,
        name: user.name,
        passwordHash,
      })
    })
  )
  const promiseArray = userObjects.map((user) => user.save())
  await Promise.all(promiseArray)
})
describe('GET users list backend tests', () => {
  test('users are returned as json and the amount is corect', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length, 2)
  })
  test('test that the objects from database have a correct id identifier', async () => {
    const response = await api.get('/api/users')
    response.body.forEach((user) => {
      assert.ok(user.id, 'User should have an "id" property')
      assert.strictEqual(
        user._id,
        undefined,
        'User should not have an "_id" property'
      )
    })
  })
})

describe('addition of a new user', () => {
  test('succeeds with valid data', async () => {
    const user = {
      username: 'User3',
      name: 'superUser3',
      password: 'topSecret3',
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, helper.testUsers.length + 1)
  })
  test('adding a new user with invalid data fails', async () => {
    const newUser1 = {
      username: 'NewUser1',
      name: 'superUser1',
      password: 'to',
    }
    await api.post('/api/users').send(newUser1).expect(400)
    const newUser2 = {
      username: 'NewUser1',
      name: 'superUser2',
      password: '',
    }
    await api.post('/api/users').send(newUser2).expect(400)
    const newUser4 = {
      username: 'Us',
      name: 'superUser4',
      password: 'topSecret666',
    }
    await api.post('/api/users').send(newUser4).expect(400)
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: 'User1',
      name: 'Superuser',
      password: 'salainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('Username must be unique'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
