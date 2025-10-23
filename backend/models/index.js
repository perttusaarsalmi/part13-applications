const User = require('./user');
const Blog = require('./blog');
const ReadingList = require('./readingList');

// User-Blog relationship (one-to-many: user owns blogs)
User.hasMany(Blog, { foreignKey: 'userId' });
Blog.belongsTo(User, { foreignKey: 'userId' });

// Many-to-many relationship through ReadingList (users can add blogs to reading list)
User.belongsToMany(Blog, {
  through: ReadingList,
  foreignKey: 'userId',
  otherKey: 'blogId',
  as: 'readingListBlogs',
});
Blog.belongsToMany(User, {
  through: ReadingList,
  foreignKey: 'blogId',
  otherKey: 'userId',
  as: 'readingListUsers',
});

// Direct associations to ReadingList
User.hasMany(ReadingList, { foreignKey: 'userId' });
ReadingList.belongsTo(User, { foreignKey: 'userId' });
Blog.hasMany(ReadingList, { foreignKey: 'blogId' });
ReadingList.belongsTo(Blog, { foreignKey: 'blogId' });

module.exports = {
  User,
  Blog,
  ReadingList,
};
