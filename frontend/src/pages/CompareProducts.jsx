
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  getCompareProducts,
  addCompareProduct,
  removeCompareProduct,
  clearCompareProducts,
  MAX_COMPARE_PRODUCTS,
} from "../utils/productComparison";

const getProductImage = (product) => {
  if (typeof product.image === "string") return product.image;

  if (product.image?.url) return product.image.url;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const image = product.images[0];
    return typeof image === "string" ? image : image?.url || "";
  }

  return "";
};

const getProductPrice = (product) =>
  Number(product.price ?? product.sellingPrice ?? 0);

const getCategoryName = (product) =>
  typeof product.category === "object"
    ? product.category?.name || "Uncategorized"
    : product.category || "Uncategorized";

const CompareProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(getCompareProducts);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load products for comparison:", err);
        setError("Products could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const isSelected = (id) =>
    selected.some((product) => product._id === id);

  const toggleProduct = (product) => {
    if (isSelected(product._id)) {
      removeCompareProduct(product._id);
      setSelected(getCompareProducts());
      return;
    }

    const result = addCompareProduct(product);

    if (!result.success) {
      window.alert(result.message);
      return;
    }

    setSelected(getCompareProducts());
  };

  const handleClear = () => {
    clearCompareProducts();
    setSelected([]);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || getCategoryName(product) === category;

    const name = product.name || product.title || "";
    const matchesSearch = name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6 sm:p-8">
        <p className="text-sm uppercase tracking-widest text-blue-100">
          Smart shopping
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold mt-2">
          Compare Products
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100">
          Choose your favourite products, compare their features and find
          the right product for you.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
            {selected.length} of {MAX_COMPARE_PRODUCTS} selected
          </span>

          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full border border-white/40 px-4 py-2 text-sm hover:bg-white/10"
            >
              Clear selection
            </button>
          )}
        </div>
      </section>

      {selected.length > 0 && (
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Your selected products</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Remove any product before comparing.
              </p>
            </div>

            <button
              type="button"
              disabled={selected.length < 2}
              onClick={() => navigate("/compare/results")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare {selected.length} Products →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {selected.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                <img
                  src={getProductImage(product) || "https://placehold.co/100x100?text=Product"}
                  alt={product.name || product.title || "Product"}
                  className="w-16 h-16 object-contain rounded-md bg-gray-50 dark:bg-gray-800"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm line-clamp-2">
                    {product.name || product.title || "Product"}
                  </p>
                  <p className="text-blue-600 font-semibold mt-1">
                    ₹{getProductPrice(product).toLocaleString("en-IN")}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleProduct(product)}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Choose Products</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Select at least 2 and up to 4 products to compare.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-lg">
            Loading products...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 p-6 text-center">
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-blue-600 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const chosen = isSelected(product._id);
              const limitReached =
                selected.length >= MAX_COMPARE_PRODUCTS && !chosen;

              return (
                <article
                  key={product._id}
                  className={`rounded-xl border bg-white dark:bg-gray-900 p-4 transition ${
                    chosen
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="h-44 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <img
                      src={getProductImage(product) || "https://placehold.co/300x220?text=Product"}
                      alt={product.name || product.title || "Product"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {getCategoryName(product)}
                    </p>

                    <h3 className="font-semibold text-lg mt-1 line-clamp-2 ">
                      {product.name || product.title || "Unnamed product"}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {Number(product.numReviews ?? product.reviews?.length ?? 0) > 0
                        ? `${product.numReviews ?? product.reviews.length} Reviews`
                        : "No Reviews Yet"}
                    </p>

                    <p className="text-xl font-bold text-blue-600 mt-2">
                    ₹{getProductPrice(product).toLocaleString("en-IN")}
                    </p>

                    
                    <div className="mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        Stock:{" "}
                    </span>

                    {(() => {
                        const stock = product.stock ?? product.countInStock;

                        if (stock === undefined || stock === null) {
                        return (
                            <span className="text-gray-500">
                            Not available
                            </span>
                        );
                        }

                        return Number(stock) > 0 ? (
                        <span className="font-semibold text-green-600">
                            {stock} units available
                        </span>
                        ) : (
                        <span className="font-semibold text-red-500">
                            Out of stock
                        </span>
                        );
                    })()}
                    </div>

                    <Link
                      to={`/products/${product._id}`}
                      className="inline-block text-sm text-blue-600 hover:underline mt-2"
                    >
                      View product details
                    </Link>

                    <button
                      type="button"
                      disabled={limitReached}
                      onClick={() => toggleProduct(product)}
                      className={`w-full rounded-lg px-4 py-3 mt-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        chosen
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {chosen
                        ? "✓ Selected — Remove"
                        : limitReached
                          ? "Maximum 4 Selected"
                          : "＋ Select for Comparison"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected.length >= 2 && (
        <div className="sticky bottom-4 z-10 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/compare/results")}
            className="rounded-full bg-blue-600 px-7 py-4 font-bold text-white shadow-xl hover:bg-blue-700"
          >
            ⚖️ Compare Selected Products ({selected.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default CompareProducts;
