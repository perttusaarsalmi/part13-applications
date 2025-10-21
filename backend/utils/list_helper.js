const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + (blog?.likes ?? 0), 0)
}

const favouriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  return blogs.reduce((max, blog) => {
    return (blog.likes || 0) > (max.likes || 0) ? blog : max
  }, blogs[0])
}

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  const groupedByAuthor = _.groupBy(blogs, 'author')
  const blogCounts = _.map(groupedByAuthor, (blogs, author) => ({
    author,
    blogs: blogs.length,
  }))
  return _.maxBy(blogCounts, 'blogs')
}

const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) return null
  const groupedByAuthor = _.groupBy(blogs, 'author')
  const likesByAuthor = _.map(groupedByAuthor, (blogs, author) => ({
    author,
    likes: _.sumBy(blogs, 'likes'),
  }))
  return _.maxBy(likesByAuthor, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}
