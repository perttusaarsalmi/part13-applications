const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert') // Import assert
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('testpassword', 10)
  const testUser = new User({ username: 'testuser', passwordHash })
  const savedUser = await testUser.save()

  // Update the user field in mock blogs to reference the created user's _id
  const blogsWithUser = helper.biggerListOfBlogs.map((blog) => ({
    ...blog,
    user: savedUser._id, // Use the ObjectId of the created user
  }))

  const promiseArray = blogsWithUser.map((blog) => new Blog(blog).save())

  await Promise.all(promiseArray)
})
describe('GET blog list backend tests', () => {
  test('blogs are returned as json and the amount is corect', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length, 6) // Replace 5 with the expected number of blogs
  })
  test('test that the objects from database have a correct id identifier', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      assert.ok(blog.id, 'Blog should have an "id" property')
      assert.strictEqual(
        blog._id,
        undefined,
        'Blog should not have an "_id" property'
      )
    })
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const token = await helper.testloginAndGetToken() // Get the token
    const newBlog = {
      title: 'Pertun blogi',
      author: 'Perttu Saarsalmi',
      url: 'höpöhöpö2.org',
      likes: 1001,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.biggerListOfBlogs.length + 1)

    const titles = blogsAtEnd.map((n) => n.title)
    assert(titles.includes('Pertun blogi'))
  })
  test('the value of the likes is zero if not given in POST', async () => {
    const token = await helper.testloginAndGetToken() // Get the token
    const newBlog = {
      title: 'Pertun blogi 2',
      author: 'Perttu Saarsalmi',
      url: 'höpöhöpö2.org',
      likes: null,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
    const addedBlog = (await helper.blogsInDb()).find(
      (blog) => blog.title === 'Pertun blogi 2'
    )
    assert.strictEqual(addedBlog.likes, 0)
  })
  test('adding a new blog without url or title throws bad request error', async () => {
    const token = await helper.testloginAndGetToken() // Get the token

    const newBlog = {
      title: '',
      author: 'Perttu Saarsalmi',
      url: 'höpöhöpö2.org',
      likes: null,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
    const anotherBlog = {
      title: 'Pertun blogi 3',
      author: 'Perttu Saarsalmi',
      url: '',
      likes: null,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(anotherBlog)
      .expect(400)
  })
  test('adding a new blog without valid token throws 401 error', async () => {
    const newBlog = {
      title: '',
      author: 'Perttu Saarsalmi',
      url: 'höpöhöpö2.org',
      likes: null,
    }
    await api.post('/api/blogs').send(newBlog).expect(401)
  })
})

describe('Deletion of an existing blog', () => {
  test('succeeds with status code 204 if id is valid ', async () => {
    const token = await helper.testloginAndGetToken() // Get the token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map((n) => n.title)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, helper.biggerListOfBlogs.length - 1)
  })
})

describe('updating of the blog', () => {
  test('succeeds with valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const id = blogsAtStart[0].id
    const updatedBlog = {
      _id: id,
      title: 'höpöhöpö',
      author: 'Michael Chan',
      url: 'höpöhöpö.org',
      likes: 11,
    }

    await api
      .put(`/api/blogs/${id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.biggerListOfBlogs.length)

    const searchedUpdatedBlog = (await helper.blogsInDb()).find(
      (blog) => blog.title === 'höpöhöpö'
    )
    assert.strictEqual(searchedUpdatedBlog.likes, 11)
    assert.strictEqual(searchedUpdatedBlog.url, 'höpöhöpö.org')
  })
  test('fails with invalid id', async () => {
    const id = '123'
    const updatedBlog = {
      _id: id,
      title: 'höpöhöpö',
      author: 'Michael Chan',
      url: 'höpöhöpö.org',
      likes: 11,
    }

    await api.put(`/api/blogs/${id}`).send(updatedBlog).expect(400)
  })
  test('fails if title or url are missing', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const updatedBlog1 = {
      _id: blogsAtStart[0].id,
      title: '',
      author: 'Michael Chan',
      url: 'höpöhöpö.org',
      likes: 11,
    }
    await api
      .put(`/api/blogs/${blogsAtStart[0].id}`)
      .send(updatedBlog1)
      .expect(400)
    blogsAtStart.id
    const updatedBlog2 = {
      _id: blogsAtStart[0].id,
      title: 'höpöhöpö',
      author: 'Michael Chan',
      url: '',
      likes: 11,
    }
    await api
      .put(`/api/blogs/${blogsAtStart[0].id}`)
      .send(updatedBlog2)
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})
