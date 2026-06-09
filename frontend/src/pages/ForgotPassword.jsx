import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API from "../services/api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/forgot-password",
        { email }
      );

      toast.success(data.message);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">
          Forgot Password
        </h1>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <Button
          className="w-full mt-4"
          onClick={handleForgotPassword}
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </Button>

        <p className="text-center mt-4 text-sm">
          <Link
            to="/login"
            className="text-primary hover:underline"
          >
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ForgotPassword;