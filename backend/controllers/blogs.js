const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { tokenExtractor, userExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    name: 1,
    username: 1,
  })
  response.json(blogs)
})

blogsRouter.post(
  '/',
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const body = request.body
    const user = request.user

    if (!body.title || !body.url) {
      return response.status(400).json({ error: 'Title and URL are required' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  }
)

blogsRouter.delete(
  '/:id',
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    if (blog.user.toString() !== user._id.toString()) {
      return response
        .status(401)
        .json({ error: 'blog does not belong to user' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
)

blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'Title and URL are required' })
  }

  const update = {
    title: body.title,
    url: body.url,
    author: body.author,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(request.params.id, update, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedBlog) => {
      if (updatedBlog) {
        response.json(updatedBlog)
      } else {
        response.status(404).json({ error: 'blog not found' })
      }
    })
    .catch((error) => next(error))
})

module.exports = blogsRouter
