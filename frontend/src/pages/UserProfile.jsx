import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import API from "../services/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: null,
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const BASE_URL =
    import.meta.env.VITE_SERVER_URL ||
    "https://e-commerce-shop-proj.onrender.com";

  /* =========================================
      FETCH PROFILE + STATS
  ========================================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await API.get("/users/profile");
        const wishlist = await API.get("/wishlist");
        const orders = await API.get("/orders/my");

        setUser(profile.data);
        setOrdersCount(orders.data.length);
        setWishlistCount(wishlist.data.length);

        setFormData({
          name: profile.data.name || "",
          email: profile.data.email || "",
          phone: profile.data.phone || "",
          profileImage: null,
        });
      } catch {
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  /* =========================================
        UPDATE PROFILE
  ========================================= */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      if (formData.profileImage) {
        form.append("profileImage", formData.profileImage);
      }

      await API.put("/users/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { data } = await API.get("/users/profile");
      setUser(data);

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
        CHANGE PASSWORD
  ========================================= */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      await API.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password updated!");
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred");
    }
  };

  if (!user)
    return <div className="text-center py-20 text-lg">Loading Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
        <p className="opacity-90 mt-1 text-sm">
          Manage your account, security & personal preferences
        </p>
      </div>

      

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* PROFILE SIDEBAR */}
        <Card className="shadow-xl p-8 rounded-2xl text-center">
          <div className="w-28 h-28 mx-auto mb-6 relative">
            <div className="rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-indigo-500/40">
              {user.profileImage ? (
                <img
                  src={`${BASE_URL}${user.profileImage}`}
                  alt="profile"
                  className="w-28 h-28 object-cover"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center text-4xl font-bold bg-indigo-600 text-white">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500 mt-1">{user.email}</p>
        </Card>

        {/* EDIT PROFILE */}
        <Card className="shadow-xl p-8 rounded-2xl lg:col-span-2">
          <h3 className="text-2xl font-semibold mb-6">Account Information</h3>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <div>
              <label className="block mb-2 text-sm font-medium">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profileImage: e.target.files[0],
                  })
                }
                className="block w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md"
              >
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

      {/* PASSWORD SECTION */}
      {showPasswordForm && (
        <Card className="shadow-xl p-8 rounded-2xl">
          <h3 className="text-2xl font-semibold mb-6">Security Settings</h3>

          <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-6">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
            />

            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />

            <Input
              label="Confirm Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />

            <Button type="submit" variant="primary">
              Update Password
            </Button>
          </form>
        </Card>
      )}

      {/* STATS SECTION */}
      {user.role === "admin" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <Card className="shadow-xl p-6 rounded-2xl">
            <h4 className="text-gray-500 text-sm">Role</h4>
            <p className="text-2xl font-bold text-purple-600 capitalize">
              {user.role}
            </p>
          </Card>

          <Card className="shadow-xl p-6 rounded-2xl">
            <h4 className="text-gray-500 text-sm">Member Since</h4>
            <p className="text-lg font-semibold">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </Card>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card className="shadow-xl p-6 rounded-2xl">
            <h4 className="text-gray-500 text-sm">Total Orders</h4>
            <p className="text-3xl font-bold text-indigo-600">{ordersCount}</p>
          </Card>

          <Card className="shadow-xl p-6 rounded-2xl">
            <h4 className="text-gray-500 text-sm">Wishlist Items</h4>
            <p className="text-3xl font-bold text-pink-600">{wishlistCount}</p>
          </Card>

          <Card className="shadow-xl p-6 rounded-2xl">
            <h4 className="text-gray-500 text-sm">Member Since</h4>
            <p className="text-lg font-semibold">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </Card>

        </div>
      )}

      {/* DANGER ZONE */}
      <Card className="bg-red-50 border-2 border-red-500 shadow-lg p-8 rounded-2xl">
        <h3 className="text-xl font-semibold text-red-600 mb-4">
          Danger Zone
        </h3>
        <Button
          variant="danger"
          onClick={async () => {
            if (window.confirm("Are you sure?")) {
              await API.delete("/users/profile");
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