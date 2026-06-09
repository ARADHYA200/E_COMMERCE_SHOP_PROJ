import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API from "../services/api";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleResetPassword =
    async () => {

      if (
        !password ||
        !confirmPassword
      ) {
        toast.error(
          "Please fill all fields"
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        toast.error(
          "Passwords do not match"
        );
        return;
      }

      try {

        setLoading(true);

        const { data } =
          await API.post(
            `/auth/reset-password/${token}`,
            {
              password,
            }
          );

        toast.success(
          data.message
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);

      } catch (error) {

        toast.error(
          error.response?.data?.message ||
            "Reset failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">

      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">
          Reset Password
        </h1>

        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />

        <Button
          className="w-full mt-4"
          onClick={
            handleResetPassword
          }
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Password"}
        </Button>

      </div>

    </div>
  );
};

export default ResetPassword;