const User = require('./user');
const Blog = require('./blog');
const ReadingList = require('./readingList');
const Session = require('./session');

User.hasMany(Blog, { foreignKey: 'userId' });
Blog.belongsTo(User, { foreignKey: 'userId' });

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

User.hasMany(ReadingList, { foreignKey: 'userId' });
ReadingList.belongsTo(User, { foreignKey: 'userId' });
Blog.hasMany(ReadingList, { foreignKey: 'blogId' });
ReadingList.belongsTo(Blog, { foreignKey: 'blogId' });

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Blog,
  ReadingList,
  Session,
};
