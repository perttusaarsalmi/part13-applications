import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'
import { expect } from 'vitest'

test('renders content', () => {
  const blog = {
    title: 'testTitle',
    author: 'PS',
    url: 'https://fi.wikipedia.org/wiki/Ohjelmointi',
    likes: 2,
    user: {
      username: 'PerttuS',
      name: 'superUser',
      id: '68c02202ead2e43840efc74f',
    },
    id: '68c2adc9f10af560f98cf9e4',
  }

  const user = {
    username: 'PerttuS',
    name: 'superUser',
    id: '68c02202ead2e43840efc74f',
  }

  render(<Blog blog={blog} user={user} />)
  screen.debug()
  const titleElement = screen.getByText('testTitle', { exact: false })
  const authorElement = screen.getByText('PS', { exact: false })
  expect(titleElement).toBeVisible()
  expect(authorElement).toBeVisible()

  const urlElement = screen.queryByText(
    'https://fi.wikipedia.org/wiki/Ohjelmointi'
  )
  expect(urlElement).toBeNull()
  const likesElement = screen.queryByText('2')
  expect(likesElement).toBeNull()
  expect(screen.queryByText(blog.user.name)).toBeNull()
})

test('pressing the view button will show more info', async () => {
  const blog = {
    title: 'testTitle2',
    author: 'PS',
    url: 'https://fi.wikipedia.org/wiki/Ohjelmointi',
    likes: 2,
    user: {
      username: 'PerttuS',
      name: 'superUser',
      id: '68c02202ead2e43840efc74f',
    },
    id: '68c2adc9f10af560f98cf9e4',
  }

  const user = {
    username: 'PerttuS',
    name: 'superUser',
    id: '68c02202ead2e43840efc74f',
  }

  render(<Blog blog={blog} user={user} />)

  const userMock = userEvent.setup()
  const viewButton = screen.getByText('view')
  await userMock.click(viewButton)

  expect(screen.getByText(blog.url)).toBeVisible()
  expect(screen.getByText(`${blog.likes}`)).toBeVisible()
  expect(screen.getByText(blog.user.name)).toBeVisible()
})

test('pressing the like button twice calls the event handler twice', async () => {
  const blog = {
    title: 'testTitle3',
    author: 'PS',
    url: 'https://fi.wikipedia.org/wiki/Ohjelmointi',
    likes: 2,
    user: {
      username: 'PerttuS',
      name: 'superUser',
      id: '68c02202ead2e43840efc74f',
    },
    id: '68c2adc9f10af560f98cf9e4',
  }

  const user = {
    username: 'PerttuS',
    name: 'superUser',
    id: '68c02202ead2e43840efc74f',
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} user={user} onLike={mockHandler} />)

  const userMock = userEvent.setup()

  const viewButton = screen.getByText('view')
  await userMock.click(viewButton)

  const likeButton = screen.getByText('like')
  await userMock.click(likeButton)
  await userMock.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})

test('calls the callback function with correct data when a new blog is created', async () => {
  const mockCreateBlog = vi.fn() // Mockataan createBlog-funktio

  render(<BlogForm addBlog={mockCreateBlog} />)

  const user = userEvent.setup()

  const titleInput = screen.getByPlaceholderText('Enter title')
  const authorInput = screen.getByPlaceholderText('Enter author')
  const urlInput = screen.getByPlaceholderText('Enter URL')

  await user.type(titleInput, 'Test Blog Title')
  await user.type(authorInput, 'Test Author')
  await user.type(urlInput, 'https://testblog.com')

  const createButton = screen.getByText('create')
  await user.click(createButton)

  expect(mockCreateBlog).toHaveBeenCalledTimes(1)
  expect(mockCreateBlog).toHaveBeenCalledWith(
    expect.any(Object), // Tämä on event
    'Test Blog Title',
    'Test Author',
    'https://testblog.com'
  )
})
