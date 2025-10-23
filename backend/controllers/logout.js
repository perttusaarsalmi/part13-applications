const logoutRouter = require('express').Router();
const { Session } = require('../models');
const { tokenExtractor } = require('../utils/middleware');

logoutRouter.delete('/', tokenExtractor, async (request, response) => {
  const token = request.token;

  if (!token) {
    return response.status(401).json({ error: 'token missing' });
  }

  try {
    const session = await Session.findOne({
      where: { token: token },
    });

    if (session) {
      await session.destroy();
      response.status(200).json({ message: 'logged out successfully' });
    } else {
      response
        .status(200)
        .json({ message: 'session not found, already logged out' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    response.status(500).json({ error: 'logout failed' });
  }
});

module.exports = logoutRouter;
