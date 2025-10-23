const readingListsRouter = require('express').Router();
const { ReadingList, Blog } = require('../models');
const { tokenExtractor, userExtractor } = require('../utils/middleware');

readingListsRouter.post(
  '/',
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    try {
      const { blogId } = request.body;
      const userId = request.user.id;

      if (!blogId) {
        return response.status(400).json({ error: 'blogId is required' });
      }

      const blog = await Blog.findByPk(blogId);
      if (!blog) {
        return response.status(404).json({ error: 'Blog not found' });
      }

      const existingEntry = await ReadingList.findOne({
        where: { userId, blogId },
      });

      if (existingEntry) {
        return response
          .status(400)
          .json({ error: 'Blog already in reading list' });
      }

      const readingListEntry = await ReadingList.create({
        userId,
        blogId,
        read: false,
      });

      response.status(201).json(readingListEntry);
    } catch (error) {
      console.error('Error adding to reading list:', error);
      response.status(500).json({ error: error.message });
    }
  }
);

readingListsRouter.put(
  '/:id',
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    try {
      const { read } = request.body;
      const userId = request.user.id;
      const readingListId = request.params.id;

      if (typeof read !== 'boolean') {
        return response
          .status(400)
          .json({ error: 'read field is required and must be boolean' });
      }

      const readingListEntry = await ReadingList.findByPk(readingListId);

      if (!readingListEntry) {
        return response
          .status(404)
          .json({ error: 'Reading list entry not found' });
      }

      if (readingListEntry.userId !== userId) {
        return response.status(403).json({ error: 'Access denied' });
      }

      const updatedEntry = await readingListEntry.update({ read });

      response.json(updatedEntry);
    } catch (error) {
      console.error('Error updating reading list:', error);
      response.status(500).json({ error: error.message });
    }
  }
);

module.exports = readingListsRouter;
