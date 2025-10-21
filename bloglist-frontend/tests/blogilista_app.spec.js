const { test, beforeEach, describe, expect } = require('@playwright/test')
const { loginWith } = require('./helper')
const { createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3002/api/testing/reset')
    await request.post('http://localhost:3002/api/users', {
      data: {
        name: 'Perttu Saarsalmi',
        username: 'saarper',
        password: 'Blastbeat666',
      },
    })
    test.setTimeout(10000)
    await page.goto('http://localhost:5173')
  })
  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText('Log into application')
    await expect(locator).toBeVisible()
    const usernameElement = page.getByLabel('username')
    const passwordElement = page.getByLabel('password')
    await expect(usernameElement).toBeVisible()
    await expect(passwordElement).toBeVisible()
  })
  describe('Login', () => {
    test('fails with wrong password', async ({ page }) => {
      await loginWith(page, 'saarper', 'wrong')

      await expect(page.getByText('wrong credentials')).toBeVisible()
    })
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'saarper', 'Blastbeat666')

      await expect(page.getByText('Perttu Saarsalmi logged in')).toBeVisible()
    })
  })
  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'saarper', 'Blastbeat666')
    })

    test('a new blog can be created', async ({ page }) => {
      const createNewButton = page.getByRole('button', { name: 'create new' })
      await expect(createNewButton).toBeVisible()
      await createNewButton.click()
      await createBlog(page, 'Test title', 'Test Author', 'test.com')
      const submitElement = page.getByRole('button', { name: 'create' })
      await submitElement.click()
      await expect(
        page.getByText('a new blog Test title by Test Author added')
      ).toBeVisible()
      const blogLementOnList = page.getByText('Test title Test Author')
      expect(blogLementOnList).toBeVisible()
    })

    test('a new blog can be liked', async ({ page }) => {
      const createNewButton = page.getByRole('button', { name: 'create new' })
      await createNewButton.click()
      await createBlog(page, 'Test title', 'Test Author', 'test.com')
      const submitElement = page.getByRole('button', { name: 'create' })
      await submitElement.click()
      const viewButton = page.getByRole('button', { name: 'view' })
      await viewButton.click()
      const likeButton = page.getByRole('button', { name: 'like' })
      await expect(likeButton).toBeVisible()
      const likesBefore = page.getByText('likes 0')
      await expect(likesBefore).toBeVisible()
      await likeButton.click()
      const likesAfter = page.getByText('likes 1')
      await expect(likesAfter).toBeVisible()
    })
    test('a blog can be deleted by the user who added it', async ({ page }) => {
      const createNewButton = page.getByRole('button', { name: 'create new' })
      await createNewButton.click()
      await createBlog(page, 'Test title', 'Test Author', 'test.com')
      const submitElement = page.getByRole('button', { name: 'create' })
      await submitElement.click()
      const viewButton = page.getByRole('button', { name: 'view' })
      await viewButton.click()
      const removeButton = page.getByRole('button', { name: 'remove' })
      await expect(removeButton).toBeVisible()
      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm')
        expect(dialog.message()).toBe(
          'Remove blog "Test title" by Test Author?'
        )
        await dialog.accept()
      })
      await removeButton.click()
      await expect(page.getByText('Test title Test Author')).toHaveCount(0)
    })

    test('only the user who added the blog sees the remove button', async ({
      page,
      request,
    }) => {
      const createNewButton = page.getByRole('button', { name: 'create new' })
      await createNewButton.click()
      await createBlog(page, 'Test title', 'Test Author', 'test.com')
      const submitElement = page.getByRole('button', { name: 'create' })
      await submitElement.click()
      const blogElement = page.getByText('Test title Test Author')
      await expect(blogElement).toBeVisible()
      const viewButton = page.getByRole('button', { name: 'view' })
      await viewButton.click()
      const removeButton = page.getByRole('button', { name: 'remove' })
      await expect(removeButton).toBeVisible()
      const logoutButton = page.getByRole('button', { name: 'logout' })
      await logoutButton.click()
      await request.post('http://localhost:3002/api/users', {
        data: {
          name: 'Käyttäjä2',
          username: 'kayttaja2',
          password: '12345',
        },
      })
      await page.getByLabel('username').fill('kayttaja2')
      await page.getByLabel('password').fill('12345')
      const loginButton = page.getByRole('button', { name: 'login' })
      await loginButton.click()
      const viewButtonUser2 = page.getByRole('button', { name: 'view' })
      await viewButtonUser2.click()
      await expect(page.getByRole('button', { name: 'remove' })).toHaveCount(0)
    })

    test('blogs are ordered by likes in descending order', async ({ page }) => {
      // create blogs
      await page.getByRole('button', { name: 'create new blog' }).click()
      await createBlog(page, 'Blog 1', 'Author 1', 'url1.com')
      await page.getByRole('button', { name: 'create' }).click()

      await createBlog(page, 'Blog 2', 'Author 2', 'url2.com')
      await page.getByRole('button', { name: 'create' }).click()

      await createBlog(page, 'Blog 3', 'Author 3', 'url3.com')
      await page.getByRole('button', { name: 'create' }).click()

      const blogs = page.locator('.blog')
      const blog1 = blogs.filter({ hasText: 'Blog 1 Author 1' })
      const blog2 = blogs.filter({ hasText: 'Blog 2 Author 2' })
      const blog3 = blogs.filter({ hasText: 'Blog 3 Author 3' })

      await blog1.getByRole('button', { name: 'view' }).click()
      await blog2.getByRole('button', { name: 'view' }).click()
      await blog3.getByRole('button', { name: 'view' }).click()

      for (let i = 0; i < 3; i++) {
        await blog1.getByRole('button', { name: 'like' }).click()
      }
      for (let i = 0; i < 6; i++) {
        await blog2.getByRole('button', { name: 'like' }).click()
      }
      await blog3.getByRole('button', { name: 'like' }).click()

      const blogTexts = await blogs.allTextContents()
      expect(blogTexts[0]).toContain('Blog 2 Author 2')
      expect(blogTexts[1]).toContain('Blog 1 Author 1')
      expect(blogTexts[2]).toContain('Blog 3 Author 3')
    })
  })
})
