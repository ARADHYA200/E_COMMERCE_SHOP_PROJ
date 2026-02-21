import { useEffect, useState } from "react";
import API from "../services/api";
import Button from "../components/ui/Button";
import { toast } from "react-toastify";

const AdminProducts = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verify user is admin
    if (user?.role !== "admin") {
      toast.error("Admin access required");
      return;
    }
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      stock: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await API.post("/products", payload);
        toast.success("Product added successfully");
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Operation failed:", error);
      if (error.response?.status === 403) {
        toast.error("Admin access required");
      } else {
        toast.error(error.response?.data?.message || "Operation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "",
      stock: product.stock,
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      await fetchProducts();
    } catch (error) {
      console.error("Delete failed:", error);
      if (error.response?.status === 403) {
        toast.error("Admin access required to delete products");
      } else {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Admin privileges required
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Manage Products</h1>

      {/* Product Form */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <input
          name="name"
          placeholder="Product Name *"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg dark:bg-gray-800"
        />

        <input
          name="price"
          type="number"
          placeholder="Price (₹) *"
          value={formData.price}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg dark:bg-gray-800"
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock Quantity *"
          value={formData.stock}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg dark:bg-gray-800"
        />

        <input
          name="image"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg dark:bg-gray-800"
        />

        <textarea
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg dark:bg-gray-800"
        />

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="primary" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Processing..." : editingId ? "Update Product" : "Add Product"}
          </Button>

          {editingId && (
            <Button variant="secondary" onClick={resetForm} disabled={loading} className="w-full sm:w-auto">
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          Products ({products.length})
        </h2>
        {loading && products.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-600">No products yet. Add your first product!</p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 sm:items-center bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-lg truncate">{product.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                  <span className="text-primary font-bold">₹{product.price}</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(product)}
                  disabled={loading}
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  onClick={() => handleDelete(product._id)}
                  disabled={loading}
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProducts;