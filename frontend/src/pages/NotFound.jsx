import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4 sm:space-y-6 px-4 sm:px-6">
      <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-primary">404</div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Page Not Found</h1>
      <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-md">
        Sorry! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
        <Link to="/products">
          <Button variant="secondary">Browse Products</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
