const blogsRouter = require('express').Router();
const { Blog, User } = require('../models');
const { Op } = require('sequelize');
const { tokenExtractor, userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const where = {};

  if (request.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${request.query.search}%`,
        },
      },
      {
        author: {
          [Op.iLike]: `%${request.query.search}%`,
        },
      },
    ];
  }
  const blogs = await Blog.findAll({
    include: {
      model: User,
      attributes: ['name', 'username'],
    },
    where,
    order: [['likes', 'DESC']],
  });
  response.json(blogs);
});

blogsRouter.post(
  '/',
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const body = request.body;
    const user = request.user;

    if (!body.title || !body.url) {
      return response.status(400).json({ error: 'Title and URL are required' });
    }

    const savedBlog = await Blog.create({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      userId: user.id,
    });

    response.status(201).json(savedBlog);
  }
);

blogsRouter.delete(
  '/:id',
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const user = request.user;
    const blog = await Blog.findByPk(request.params.id);

    if (!blog) {
      return response.status(404).json({ error: 'blog not found' });
    }

    if (blog.userId !== user.id) {
      return response
        .status(401)
        .json({ error: 'blog does not belong to user' });
    }

    await blog.destroy();
    response.status(204).end();
  }
);

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'Title and URL are required' });
  }

  const blog = await Blog.findByPk(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' });
  }

  const updatedBlog = await blog.update({
    title: body.title,
    url: body.url,
    author: body.author,
    likes: body.likes,
  });

  response.json(updatedBlog);
});

module.exports = blogsRouter;
