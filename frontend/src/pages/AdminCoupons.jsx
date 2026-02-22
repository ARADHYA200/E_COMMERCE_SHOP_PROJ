import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    expiresAt: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/coupons");
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post("/coupons", formData);
      toast.success("Coupon created successfully");
      fetchCoupons();
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: "",
        expiresAt: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Manage Coupons</h1>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            name="code"
            placeholder="Coupon Code (e.g. SUMMER10)"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            required
          />
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 focus:outline-none"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
          <input
            name="discountValue"
            type="number"
            placeholder="Discount Value"
            value={formData.discountValue}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            required
          />
          <input
            name="minOrderAmount"
            type="number"
            placeholder="Min Order Amount"
            value={formData.minOrderAmount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
          <input
            name="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
            required
          />
          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <Button type="submit" variant="primary" className="w-full">
              Create Coupon
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4">Active Coupons ({coupons.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500">No coupons available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <th className="p-3">Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Expires At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 font-mono font-bold">{coupon.code}</td>
                    <td className="p-3 capitalize">{coupon.discountType}</td>
                    <td className="p-3">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="p-3">₹{coupon.minOrderAmount || 0}</td>
                    <td className="p-3">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button variant="danger" className="text-xs px-3" onClick={() => handleDelete(coupon._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
