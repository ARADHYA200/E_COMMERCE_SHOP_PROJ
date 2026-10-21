
import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { name: "All", icon: "✦" },
  { name: "Electronics", icon: "⌘" },
  { name: "Clothing", icon: "♧" },
  { name: "Books", icon: "▤" },
  { name: "Accessories", icon: "◇" },
];

const PAGE_SIZE = 12;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(false);

        const url =
          category === "All"
            ? "/products"
            : `/products?category=${encodeURIComponent(category)}`;

        const { data } = await API.get(url);

        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);

        if (!cancelled) {
          setError(true);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const description = (product.description || "").toLowerCase();

      return name.includes(query) || description.includes(query);
    });

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price-high":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "name":
        result.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        );
        break;

      default:
        break;
    }

    return result;
  }, [products, search, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sortBy]);

  const changeCategory = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const changePage = (page) => {
    setCurrentPage(page);

    document
      .getElementById("product-catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-gray-50/80 pb-12 dark:bg-gray-950">
      {/* Hero / Header */}
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Discover your favourites
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Find your next{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  favourite.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                Explore our collection of electronics, clothing, books and
                everyday essentials.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Products available
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : filteredProducts.length}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Categories
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  04
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-7 max-w-3xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products by name or description..."
              aria-label="Search products"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      <div
        id="product-catalog"
        className="mx-auto max-w-[1500px] scroll-mt-24 px-4 pt-7 sm:px-6 lg:px-8"
      >
        {/* Category navigation */}
        <div className="mb-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Browse Categories
            </h2>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              Choose a category
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((item) => {
              const active = category === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => changeCategory(item.name)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-500"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name === "All" ? "All Products" : item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results heading / sorting */}
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {category === "All" ? "All Products" : category}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {loading
                ? "Loading your collection..."
                : `${filteredProducts.length} product${
                    filteredProducts.length === 1 ? "" : "s"
                  } found`}
              {search ? ` for "${search}"` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="product-sort"
              className="shrink-0 text-sm text-gray-500 dark:text-gray-400"
            >
              Sort by
            </label>

            <select
              id="product-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:min-w-[190px]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
        </div>

        {/* Product grid */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-white px-5 py-16 text-center dark:border-red-900 dark:bg-gray-900">
            <div className="text-4xl">⚠️</div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
              Couldn't load products
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => changeCategory(category)}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="mt-5 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-3 h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-5 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="text-5xl">⌕</div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
              No products found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try another search or choose a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                changeCategory("All");
                setSortBy("featured");
              }}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View All Products
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-9 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:px-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(safePage - 1) * PAGE_SIZE + 1}–
                    {Math.min(
                      safePage * PAGE_SIZE,
                      filteredProducts.length
                    )}
                  </span>{" "}
                  of {filteredProducts.length} products
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(safePage - 1)}
                    disabled={safePage === 1}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    ← Previous
                  </button>

                  <span className="min-w-[90px] text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => changePage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom note */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You're browsing our{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {category === "All" ? "complete collection" : category}
              </span>
              . Happy shopping!
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Products;
