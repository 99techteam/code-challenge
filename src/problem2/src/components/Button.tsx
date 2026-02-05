const Button = (props: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={props.className}
    >
      {props.children}
    </button>
  );
};

export default Button;
