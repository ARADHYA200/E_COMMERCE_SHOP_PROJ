import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import Button from "../components/ui/Button";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const { data } = await API.get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Invalid or expired token.");
      }
    };

    if (token) {
      verifyEmailToken();
    }
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 text-center space-y-6">
        {status === "loading" && (
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-bounce"></div>
            <h2 className="text-xl font-semibold">Verifying Email...</h2>
            <p className="text-gray-500">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Success!</h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✕
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="text-red-500 font-medium">{message}</p>
            <div className="pt-4">
              <Link to="/register">
                <Button variant="secondary" className="w-full">
                  Back to Registration
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
