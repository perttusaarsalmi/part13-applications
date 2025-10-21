import { useState } from 'react'
import Button from './Button'
import blogService from '../services/blogs'

const Blog = ({ blog, blogs, setBlogs, user, onLike }) => {
  const blogStyle = {
    marginTop: 10,
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const deleteBlog = () => {
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      blogService.deleteBlog(blog.id).then(() => {
        const updatedBlogs = blogs.filter((b) => b.id !== blog.id) // Remove the deleted blog
        setBlogs(updatedBlogs)
      })
    }
  }

  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} {blog.author}{' '}
        <Button onClick={toggleVisibility} text={visible ? 'hide' : 'view'} />
      </div>

      {visible && (
        <div>
          <a href={blog.url} target="_blank" rel="noopener noreferrer">
            {blog.url}
          </a>
          <div>
            likes {blog.likes} <Button onClick={() => onLike(blog)} text="like" />
          </div>
          <div>{blog.user.name}</div>
          {blog.user.id === user.id && (
            <Button onClick={deleteBlog} text="remove" />
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
