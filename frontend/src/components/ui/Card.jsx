const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 sm:p-6 
      transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;