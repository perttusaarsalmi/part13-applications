import Notification from './Notification'

const LoginForm = ({
  username,
  password,
  setUsername,
  setPassword,
  handleLogin,
  notification,
}) => {
  return (
    <form onSubmit={handleLogin}>
      <h2>Log into application</h2>
      {notification && <Notification notification={notification} />}
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )
}

export default LoginForm
