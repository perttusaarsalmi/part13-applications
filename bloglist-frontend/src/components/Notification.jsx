const Notification = ({ notification }) => {
  if (notification.text === null) {
    return null
  }

  if (notification.isError) {
    return <div className="notification errorMessage">{notification.text}</div>
  } else {
    return (
      <div className="notification successMessage">{notification.text}</div>
    )
  }
}

export default Notification
