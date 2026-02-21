import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
    });
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Connect to backend API
      // const response = await fetch('/api/users/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      //   body: JSON.stringify(formData),
      // });

      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
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
      // const response = await fetch('/api/users/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      //   body: JSON.stringify(passwordData),
      // });

      toast.success("Password updated successfully!");
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-bold">{user.name || "User"}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Member Since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Role:</strong> {user.role === "admin" ? "Administrator" : "Customer"}
              </p>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card className="md:col-span-2">
          <h3 className="text-2xl font-bold mb-6">Edit Profile</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
              placeholder="Enter your full name"
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleProfileChange}
              placeholder="Enter your phone number"
            />
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <Card>
          <h3 className="text-2xl font-bold mb-6">Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-2 border-danger">
        <h3 className="text-2xl font-bold mb-4 text-danger">Danger Zone</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure? This action cannot be undone."
              )
            ) {
              localStorage.removeItem("user");
              toast.success("Account deleted successfully");
              navigate("/");
            }
          }}
        >
          Delete Account
        </Button>
      </Card>
    </div>
  );
};

export default UserProfile;
