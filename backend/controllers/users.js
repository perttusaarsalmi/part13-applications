const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const { User, Blog, ReadingList } = require('../models');

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: ['title', 'author', 'url', 'likes'],
    },
  });
  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  const { read } = request.query;

  const readingListWhere = {};
  if (read !== undefined) {
    readingListWhere.read = read === 'true';
  }

  const user = await User.findByPk(request.params.id, {
    attributes: ['name', 'username'],
    include: [
      {
        model: ReadingList,
        where:
          Object.keys(readingListWhere).length > 0
            ? readingListWhere
            : undefined,
        include: {
          model: Blog,
          attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
        },
      },
    ],
  });

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  const formattedUser = {
    name: user.name,
    username: user.username,
    readings: user.readingLists.map((readingList) => ({
      ...readingList.blog.toJSON(),
      readinglists: [
        {
          read: readingList.read,
          id: readingList.id,
        },
      ],
    })),
  };

  response.json(formattedUser);
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

usersRouter.put('/:username', async (request, response, next) => {
  const { username: currentUsername } = request.params;
  const { username: newUsername } = request.body;

  if (!newUsername) {
    return response.status(400).json({
      error: 'New username is required',
    });
  }

  if (newUsername.length < 3) {
    return response.status(400).json({
      error: 'Username should be at least three characters long',
    });
  }

  try {
    const user = await User.findOne({
      where: { username: currentUsername },
    });

    if (!user) {
      return response.status(404).json({
        error: 'User not found',
      });
    }

    const updatedUser = await user.update({
      username: newUsername,
    });

    response.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
