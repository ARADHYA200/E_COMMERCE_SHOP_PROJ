
import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Button from "../components/ui/Button";
import { toast } from "react-toastify";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Accessories"];
const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  price: "",
  description: "",
  image: "",
  stock: "",
  category: "Electronics",
};

const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const AdminProducts = () => {
  const user = getAdminUser();

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [editingId, setEditingId] = useState(null);

  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    try {
      setFetching(true);
      const { data } = await API.get("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "admin") {
      toast.error("Admin access required");
      return;
    }

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setImagePreview(formData.image || "");
  }, [imageFile, formData.image]);

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setImageFile(null);
    setEditingId(null);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStockFilter("All");
    setSortBy("name-asc");
    setCurrentPage(1);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      formData.price === "" ||
      formData.stock === ""
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid product price");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative whole number");
      return;
    }

    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    try {
      setSubmitting(true);

      let imageUrl = formData.image;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);

        const { data } = await API.post("/upload", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = data.imageUrl;
      }

      const payload = {
        ...formData,
        name: formData.name.trim(),
        image: imageUrl,
        price,
        stock,
      };

      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await API.post("/products", payload);
        toast.success("Product added successfully");
      }

      resetForm();
      await fetchProducts();
      setActiveTab("browse");
      setCurrentPage(1);
    } catch (error) {
      console.error("Product operation failed:", error);
      toast.error(
        error.response?.data?.message || "Could not save product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      price: String(product.price ?? ""),
      description: product.description || "",
      image: product.image || "",
      stock: String(product.stock ?? ""),
      category: product.category || "Electronics",
    });

    setImageFile(null);
    setEditingId(product._id);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab("browse");
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product._id);
      await API.delete(`/products/${product._id}`);

      toast.success("Product deleted successfully");

      setProducts((previous) =>
        previous.filter((item) => item._id !== product._id)
      );

      if (editingId === product._id) {
        resetForm();
        setActiveTab("browse");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(
        error.response?.data?.message || "Could not delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalCategories = new Set(
    products.map((product) => product.category || "Electronics")
  ).size;

  // Same Low Stock rule as Admin Dashboard: stock < 10.
  const lowStockCount = products.filter(
    (product) => Number(product.stock) < 10
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) <= 0
  ).length;

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch = (product.name || "")
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "All" ||
        (product.category || "Electronics") === categoryFilter;

      const stock = Number(product.stock) || 0;

      // Keep filter condition identical to dashboard's stock < 10 rule.
      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Low Stock" && stock < 10) ||
        (stockFilter === "Out of Stock" && stock <= 0) ||
        (stockFilter === "In Stock" && stock >= 10);

      return matchesSearch && matchesCategory && matchesStock;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "stock-asc":
          return Number(a.stock) - Number(b.stock);
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return result;
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (user?.role !== "admin") {
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Admin privileges required
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900";

  const tabClass = (isActive) =>
    `rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Admin Workspace
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Product Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Manage your catalog, product details and inventory.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setActiveTab("form");
          }}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          + Add Product
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Products",
            value: products.length,
            icon: "▦",
            color: "text-indigo-600",
            background: "bg-indigo-50 dark:bg-indigo-950/40",
          },
          {
            label: "Categories",
            value: totalCategories,
            icon: "◇",
            color: "text-violet-600",
            background: "bg-violet-50 dark:bg-violet-950/40",
          },
          {
            label: "Low Stock (Below 10)",
            value: lowStockCount,
            icon: "!",
            color: "text-amber-600",
            background: "bg-amber-50 dark:bg-amber-950/40",
          },
          {
            label: "Out of Stock",
            value: outOfStockCount,
            icon: "×",
            color: "text-red-600",
            background: "bg-red-50 dark:bg-red-950/40",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                {card.label}
              </p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold ${card.color} ${card.background}`}
              >
                {card.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("browse")}
            className={tabClass(activeTab === "browse")}
          >
            Browse & Manage
            <span className="ml-2 opacity-80">({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (editingId) resetForm();
              setActiveTab("form");
            }}
            className={tabClass(activeTab === "form")}
          >
            {editingId ? "Edit Product" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Browse tab */}
      {activeTab === "browse" && (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Browse & Manage Products
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search, filter, sort and manage your catalog from one place.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                  ⌕
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products by name..."
                  aria-label="Search products by name"
                  className={`${inputClass} pl-11`}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by category"
                className={inputClass}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(event) => {
                  setStockFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by stock"
                className={inputClass}
              >
                <option value="All">All Stock Statuses</option>
                <option value="In Stock">In Stock (10+)</option>
                <option value="Low Stock">Low Stock (Below 10)</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Sort products"
                className={inputClass}
              >
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredProducts.length === 0
                    ? 0
                    : (safePage - 1) * PAGE_SIZE + 1}
                  {"–"}
                  {Math.min(safePage * PAGE_SIZE, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredProducts.length}
                </span>{" "}
                matching products
              </p>

              {(search ||
                categoryFilter !== "All" ||
                stockFilter !== "All" ||
                sortBy !== "name-asc") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:px-5">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Product Catalog
              </h3>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {filteredProducts.length} results
              </span>
            </div>

            {fetching && products.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500">
                Loading products...
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl">⌕</div>
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try a different search or clear your filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 font-semibold text-indigo-600"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/70 dark:text-gray-400">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Product</th>
                        <th className="px-4 py-4 font-semibold">Category</th>
                        <th className="px-4 py-4 font-semibold">Price</th>
                        <th className="px-4 py-4 font-semibold">Stock</th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {paginatedProducts.map((product) => {
                        const stock = Number(product.stock) || 0;

                        return (
                          <tr
                            key={product._id}
                            className="transition hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                          >
                            <td className="px-5 py-4">
                              <div className="flex min-w-0 items-center gap-3">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    loading="lazy"
                                    className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-contain dark:border-gray-700 dark:bg-gray-800"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                                    📦
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="max-w-xs truncate font-semibold text-gray-900 dark:text-white">
                                    {product.name}
                                  </p>
                                  <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                                    {product.description || "No description"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {product.category || "Electronics"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900 dark:text-white">
                              {formatPrice(product.price)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  stock <= 0
                                    ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                    : stock < 10
                                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                }`}
                              >
                                {stock <= 0
                                  ? "Out of stock"
                                  : stock < 10
                                    ? `${stock} left`
                                    : `${stock} in stock`}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  onClick={() => handleEdit(product)}
                                  disabled={fetching || submitting || !!deletingId}
                                  className="text-xs"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => handleDelete(product)}
                                  disabled={fetching || submitting || !!deletingId}
                                  className="text-xs"
                                >
                                  {deletingId === product._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-3 md:hidden">
                  {paginatedProducts.map((product) => {
                    const stock = Number(product.stock) || 0;

                    return (
                      <article
                        key={product._id}
                        className="rounded-xl border border-gray-100 p-3 dark:border-gray-800"
                      >
                        <div className="flex gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="h-20 w-20 shrink-0 rounded-lg bg-gray-50 object-contain dark:bg-gray-800"
                            />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                              📦
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="break-words font-semibold text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {product.category || "Electronics"}
                            </p>
                            <p className="mt-2 font-bold text-indigo-600">
                              {formatPrice(product.price)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Stock: {stock}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <div className="flex-1">
                            <Button
                              variant="secondary"
                              onClick={() => handleEdit(product)}
                              disabled={fetching || submitting || !!deletingId}
                              className="w-full text-xs"
                            >
                              Edit
                            </Button>
                          </div>
                          <div className="flex-1">
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(product)}
                              disabled={fetching || submitting || !!deletingId}
                              className="w-full text-xs"
                            >
                              {deletingId === product._id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Page {safePage} of {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={safePage <= 1}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={safePage >= totalPages}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Add/Edit form tab */}
      {activeTab === "form" && (
        <section className="mx-auto max-w-4xl space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editingId
                ? "Update the selected product's details below."
                : "Enter product information to add it to your catalog."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 lg:p-8"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="product-name"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Product Name *
                </label>
                <input
                  id="product-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="product-price"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Price (₹) *
                </label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="product-stock"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Stock Quantity *
                </label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Enter available stock"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="product-category"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Category *
                </label>
                <select
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="product-image"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Product Image
                </label>

                <div className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:text-gray-300 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                  />

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Maximum image size: 2MB. Leave unchanged to preserve the
                    existing image while editing.
                  </p>

                  {imagePreview && (
                    <div className="mt-4 flex items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-24 w-24 rounded-xl border border-gray-200 bg-gray-50 object-contain dark:border-gray-700 dark:bg-gray-800"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Image preview
                        </p>
                        {imageFile && (
                          <p className="mt-1 break-all text-xs text-gray-500">
                            {imageFile.name}
                          </p>
                        )}
                        {imageFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              document.getElementById("product-image").value =
                                "";
                            }}
                            className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
                          >
                            Remove selected image
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="product-description"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Product Description
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the product..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row">
              <Button
                variant="primary"
                type="submit"
                disabled={submitting || fetching}
                className="w-full sm:w-auto"
              >
                {submitting
                  ? "Processing..."
                  : editingId
                    ? "Save Changes"
                    : "Add Product"}
              </Button>

              <Button
                variant="secondary"
                type="button"
                onClick={editingId ? handleCancelEdit : resetForm}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default AdminProducts;
