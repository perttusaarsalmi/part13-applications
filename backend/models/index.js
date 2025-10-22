const User = require('./user');
const Blog = require('./blog');

User.hasMany(Blog, { foreignKey: 'userId' });
Blog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Blog,
};
