import { motion as Motion } from "framer-motion";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) => {
  const baseStyle =
    "px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-300 focus:outline-none text-sm sm:text-base";

  const variants = {
    primary: "bg-primary text-white hover:opacity-90 shadow-md",
    secondary:
      "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:opacity-90",
    danger: "bg-danger text-white hover:opacity-90",
    success: "bg-success text-white hover:opacity-90",
  };

  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  return (
    <Motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabledClass} ${className}`}
    >
      {children}
    </Motion.button>
  );
};

export default Button;