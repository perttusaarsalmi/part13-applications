const Button = (props) => (
  <button onClick={props.onClick} type={props.type}>
    {props.text}
  </button>
)

export default Button
