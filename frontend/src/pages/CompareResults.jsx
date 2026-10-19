
import { Link, useNavigate } from "react-router-dom";
import {
  getCompareProducts,
  removeCompareProduct,
  clearCompareProducts,
} from "../utils/productComparison";

const getPrice = (product) =>
  Number(product.price ?? product.sellingPrice ?? 0);

const getCategory = (product) =>
  typeof product.category === "object"
    ? product.category?.name || "Uncategorized"
    : product.category || "Uncategorized";

const getImage = (product) => {
  if (typeof product.image === "string") return product.image;
  if (product.image?.url) return product.image.url;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const image = product.images[0];
    return typeof image === "string" ? image : image?.url || "";
  }

  return "";
};

const CompareResults = () => {
  const navigate = useNavigate();
  const products = getCompareProducts();

  const removeProduct = (id) => {
    removeCompareProduct(id);
    navigate("/compare");
  };

  const clearAll = () => {
    clearCompareProducts();
    navigate("/compare");
  };

  if (products.length < 2) {
    return (
      <section className="text-center py-16">
        <h1 className="text-3xl font-bold">Compare Products</h1>
        <p className="text-gray-500 mt-3">
          Select at least 2 products before viewing the comparison.
        </p>
        <Link
          to="/compare"
          className="inline-block mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Choose Products
        </Link>
      </section>
    );
  }

  const rows = [
    {
      label: "Price",
      render: (product) => (
        <span className="text-lg font-bold text-blue-600">
          ₹{getPrice(product).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      label: "Category",
      render: (product) => getCategory(product),
    },
    {
      label: "Rating",
      render: (product) =>
        product.rating ?? product.averageRating ?? "Not available",
    },
    {
      label: "Stock",
      render: (product) => {
        const stock = product.stock ?? product.countInStock;

        if (stock === undefined || stock === null) {
          return "Not available";
        }

        return Number(stock) > 0
          ? `${stock} available`
          : "Out of stock";
      },
    },
    {
      label: "Description",
      render: (product) => product.description || "Not available",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6 sm:p-8">
        <p className="text-sm uppercase tracking-widest text-blue-100">
          Your comparison
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold mt-2">
          Compare Products
        </h1>

        <p className="text-blue-100 mt-3">
          Compare prices, ratings, availability and product details side by side.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/compare"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-5 py-3 font-semibold hover:bg-blue-700 transition-colors"
            >
            ← Edit Selection
            </Link>

          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-white/50 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Clear All
          </button>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="sticky left-0 z-[1] min-w-36 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4">
                Features
              </th>

              {products.map((product) => (
                <th
                  key={product._id}
                  className="min-w-56 border-b border-gray-200 dark:border-gray-700 p-4 align-top"
                >
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex h-40 items-center justify-center rounded-lg bg-white p-3">
                      <img
                        src={getImage(product) || "https://placehold.co/220x160?text=Product"}
                        alt={product.name || product.title || "Product"}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <p className="font-bold text-base">
                      {product.name || product.title || "Product"}
                    </p>

                    <Link
                      to={`/products/${product._id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeProduct(product._id)}
                      className="text-left text-sm text-red-500 hover:underline"
                    >
                      Remove product
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th className="sticky left-0 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 align-top font-semibold">
                  {row.label}
                </th>

                {products.map((product) => (
                  <td
                    key={product._id}
                    className="border-b border-gray-200 dark:border-gray-700 p-4 align-top"
                  >
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tip: On smaller screens, swipe horizontally to compare every product.
      </p>
    </div>
  );
};

export default CompareResults;
