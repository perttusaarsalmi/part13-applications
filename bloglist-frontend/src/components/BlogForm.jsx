import { useState } from 'react'
import blogService from '../services/blogs'

const BlogForm = ({ addBlog }) => {
  const [newBlogTitle, setNewBlogTitle] = useState('')
  const [newBlogAuthor, setNewBlogAuthor] = useState('')
  const [newBlogUrl, setNewBlogUrl] = useState('')

  const handleBlogTitleChange = (event) => setNewBlogTitle(event.target.value)
  const handleBlogAuthorChange = (event) => setNewBlogAuthor(event.target.value)
  const handleBlogUrlChange = (event) => setNewBlogUrl(event.target.value)

  const handleSubmit = (event) => {
    event.preventDefault()
    addBlog(event, newBlogTitle, newBlogAuthor, newBlogUrl)
    setNewBlogTitle('')
    setNewBlogAuthor('')
    setNewBlogUrl('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          title:{' '}
          <input
            placeholder="Enter title"
            value={newBlogTitle}
            onChange={handleBlogTitleChange}
          />
        </div>
        <div>
          author:{' '}
          <input
            placeholder="Enter author"
            value={newBlogAuthor}
            onChange={handleBlogAuthorChange}
          />
        </div>
        <div>
          url:{' '}
          <input
            placeholder="Enter URL"
            value={newBlogUrl}
            onChange={handleBlogUrlChange}
          />
        </div>
        <button type="submit">
          create
        </button>
      </form>
    </div>
  )
}

export default BlogForm
