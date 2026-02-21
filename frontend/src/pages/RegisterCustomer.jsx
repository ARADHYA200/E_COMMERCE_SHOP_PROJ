import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import API from "../services/api";

const RegisterCustomer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill all fields");
        return;
    }

    try {
        const { data } = await API.post("/auth/register", formData);
        localStorage.setItem("user", JSON.stringify(data));
        toast.success("Registration successful");
        window.location.href = "/";
    } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
    }
    };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-xl shadow-md space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Register</h1>

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <Input
          label="Email"
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

        <Button variant="primary" className="w-full" onClick={handleRegister}>
          Register
        </Button>

        <p className="text-center text-xs sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCustomer;