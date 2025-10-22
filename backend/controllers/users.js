const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const { User, Blog } = require('../models');

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: ['title', 'author', 'url', 'likes'],
    },
  });
  response.json(users);
});

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).json({
      error:
        'Password is required and it should be at least three characters long',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const savedUser = await User.create({
      username,
      name,
      passwordHash,
    });
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
