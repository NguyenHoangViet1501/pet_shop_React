import "./button.css";
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  style,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        btn 
        btn-${variant}
        ${disabled ? "btn-disabled" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
