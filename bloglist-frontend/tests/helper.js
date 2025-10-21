const loginWith = async (page, username, password)  => {
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
      const enterTitleElement = page.getByPlaceholder('Enter title')
      const enterAuthorElement = page.getByPlaceholder('Enter author')
      const enterUrlElement = page.getByPlaceholder('Enter URL')
      await enterTitleElement.fill(title)
      await enterAuthorElement.fill(author)
      await enterUrlElement.fill(url)
}

export { loginWith, createBlog }