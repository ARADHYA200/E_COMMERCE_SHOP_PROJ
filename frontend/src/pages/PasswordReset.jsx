import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(token ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      // TODO: Connect to backend API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      toast.success("Reset link sent to your email!");
      setStep("check-email");
    } catch  {
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // TODO: Connect to backend API
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password: passwordData.newPassword }),
      // });

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch  {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-12">
      <Card className="w-full max-w-md">
        {step === "request" && (
          <form onSubmit={handleRequestReset} className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Forgot Password</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {step === "check-email" && (
          <div className="space-y-4 sm:space-y-6 text-center">
            <div className="text-4xl sm:text-6xl">📧</div>
            <h1 className="text-2xl sm:text-3xl font-bold">Check Your Email</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to <strong className="break-all">{email}</strong>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              The link will expire in 24 hours.
            </p>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => {
                setStep("request");
                setEmail("");
              }}
            >
              Didn't receive it? Try again
            </Button>
          </div>
        )}

        {step === "reset" && token && (
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Enter a new password for your account.
              </p>
            </div>

            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder="Enter new password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm new password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        {step === "success" && (
          <div className="space-y-4 sm:space-y-6 text-center">
            <div className="text-4xl sm:text-6xl">✅</div>
            <h1 className="text-2xl sm:text-3xl font-bold">Password Reset!</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your password has been successfully reset.
            </p>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PasswordReset;
