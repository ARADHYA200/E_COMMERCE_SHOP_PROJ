import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const ServerError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4 sm:space-y-6 px-4 sm:px-6">
      <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-danger">500</div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Server Error</h1>
      <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-md">
        Oops! Something went wrong on our end. Our team has been notified and is working on a fix.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-secondary text-white rounded-lg hover:opacity-90 transition text-sm sm:text-base"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default ServerError;
