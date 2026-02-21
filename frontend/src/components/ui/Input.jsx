const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base rounded-xl border border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-800 
        text-gray-900 dark:text-gray-100
        focus:ring-2 focus:ring-primary focus:outline-none transition-all ${className}`}
      />
    </div>
  );
};

export default Input;