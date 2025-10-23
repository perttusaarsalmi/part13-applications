const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const { User, Session } = require('../models');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = await User.scope('withPasswordHash').findOne({
    where: { username },
  });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    });
  }

  if (user.disabled) {
    return response.status(401).json({
      error: 'account disabled, please contact admin',
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  await Session.create({
    userId: user.id,
    token: token,
  });

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
