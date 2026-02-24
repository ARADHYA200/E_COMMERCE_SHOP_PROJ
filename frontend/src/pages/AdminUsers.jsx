import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Make Admin
  const makeAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to make this user Admin?"))
      return;

    try {
      await API.put(`/admin/users/${id}/make-admin`);
      toast.success("User promoted to Admin");
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  // ✅ Remove Admin
  const removeAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to remove Admin rights?"))
      return;

    try {
      await API.put(`/admin/users/${id}/remove-admin`);
      toast.success("Admin rights removed");
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  // ✅ Delete User
  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "This action cannot be undone. Are you sure you want to delete this user?"
      )
    )
      return;

    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Information</h1>
        <span className="text-sm bg-primary/10 text-primary px-4 py-1 rounded-full">
          Total Users: {users.length}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading Users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No customers found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl shadow-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th> {/* ✅ Added */}
                <th className="px-6 py-4 text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="px-6 py-4 font-semibold">
                    {user.name}
                  </td>

                  <td className="px-6 py-4">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {/* ✅ ACTION BUTTONS */}
                  <td className="px-6 py-4 space-x-2">

                    {user.role === "admin" ? (
                      <button
                        onClick={() => removeAdmin(user._id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Remove Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => makeAdmin(user._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Make Admin
                      </button>
                    )}

                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;