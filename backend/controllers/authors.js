const authorsRouter = require('express').Router();
const { Blog } = require('../models');
const { fn, col } = require('sequelize');

authorsRouter.get('/', async (request, response) => {
  const authors = await Blog.findAll({
    attributes: [
      'author',
      [fn('COUNT', col('id')), 'articles'],
      [fn('SUM', col('likes')), 'likes'],
    ],
    group: ['author'],
    order: [[fn('SUM', col('likes')), 'DESC']],
  });

  response.json(authors);
});

module.exports = authorsRouter;
