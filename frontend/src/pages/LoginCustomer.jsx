import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import API from "../services/api";

const LoginCustomer = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", formData);

      localStorage.setItem("user", JSON.stringify(data));

      toast.success("Login Successful ✅");

      window.location.href = "/";

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Invalid credentials"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-xl shadow-md space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Login</h1>

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <Button
          variant="primary"
          className="w-full"
          disabled={loading}
          onClick={handleLogin}
        >
          {
            loading
              ? "Signing In..."
              : "Login"
          }
        </Button>

        <p className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </p>

        <p className="text-center text-xs sm:text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginCustomer;