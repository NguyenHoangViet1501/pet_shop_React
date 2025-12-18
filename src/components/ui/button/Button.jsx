import { useState } from "react";
import "./button.css";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary-custom",
  className = "",
  disabled = false,
  isLoading = false,
  debounceTime = 300, // Mặc định chặn click liên tiếp trong 300ms
  style,
  ...props
}) {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleClick = (e) => {
    // Nếu đang disabled, loading hoặc đang trong thời gian debounce thì không làm gì
    if (disabled || isLoading || isDebouncing) {
      e.preventDefault();
      return;
    }

    // Gọi hàm onClick gốc
    if (onClick) {
      onClick(e);
    }

    // Kích hoạt debounce nếu có debounceTime
    if (debounceTime > 0) {
      setIsDebouncing(true);
      setTimeout(() => {
        setIsDebouncing(false);
      }, debounceTime);
    }
  };

  // Button sẽ bị disable nếu: prop disabled=true HOẶC đang loading HOẶC đang debounce
  const shouldDisable = disabled || isLoading || isDebouncing;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={shouldDisable}
      style={style}
      className={`
        btn 
        btn-${variant}
        ${shouldDisable ? "btn-disabled-custom" : ""}
        ${className}
        d-inline-flex align-items-center justify-content-center gap-2
      `}
      {...props}
    >
      {isLoading && (
        <span 
          className="spinner-border spinner-border-sm" 
          role="status" 
          aria-hidden="true"
        ></span>
      )}
      {children}
    </button>
  );
}
