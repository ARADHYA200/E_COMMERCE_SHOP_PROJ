import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { WishlistContext } from "../context/WishlistContext.jsx";
import API from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("user") || "null");

  const isLoggedIn = !!userInfo;
  const isAdmin =
    userInfo?.isAdmin === true || userInfo?.role === "admin";

  const showHeroButtons = !isAdmin;

  const products = [
    {
      id: 1,
      image: "https://imgs.search.brave.com/pU5r8T1LU1OqHDIpsD3Z0xgar2VAkE-2iF0Mu6JTTs8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2Rpc2NvdW50LmNv/bS9wZHQyLzMvMS84/LzEvMzAweDMwMC9h/YWFwbzg3MzE4L3J3/L3NtYXJ0cGhvbmUt/LS1yZWFsbWUtMTQt/cHJvLTVnLmpwZw",
      name: "Smartphone Pro",
    },
    {
      id: 2,
      image: "https://imgs.search.brave.com/CY6ww4rBrFjgcPKRNaF6MhV6u9mBCyQ6D4479sewGE4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG9ydHJvbmljcy5j/b20vY2RuL3Nob3Av/ZmlsZXMvUG9ydHJv/bmljc19NdWZmc19N/Nl9XaXJlbGVzc19I/ZWFkcGhvbmVzX2Zv/cl9kYWlseV9saXN0/ZW5pbmcuanBnP3Y9/MTc2NTQ1MDIwOCZ3/aWR0aD01MzM",
      name: "Wireless Headphones",
    },
    {
      id: 3,
      image: "https://imgs.search.brave.com/oDrhh6QlmqYWyVDvaNippm5i31LIJkqMT7v57L12qIU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF2V0ZnYm9mWUwu/anBn",
      name: "Smart Fitness Watch",
    },
    {
      id: 4,
      image: "https://imgs.search.brave.com/mzgWXWACHO-SvojXEQlhJ3xpDykM39oTtnoTqoUO6YM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c3R1ZmYudHYvd3At/Y29udGVudC91cGxv/YWRzL3NpdGVzLzIv/MjAyMi8wNC9TdHVm/Zi1CZXN0LUxhcHRv/cC1NaWNyb3NvZnQt/U3VyZmFjZS1TdHVk/aW8ucG5nP3c9MTAy/NA",
      name: "Premium Laptop",
    },
  ];

  const { wishlistItems } = useContext(WishlistContext);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      if (!userInfo || isAdmin) {
        setRecommendedProducts([]);
        return;
      }

      setLoadingRecommendations(true);

      try {
        const { data } = await API.get("/products");
        const allProducts = Array.isArray(data) ? data : [];

        const wishlistCategories = wishlistItems
          .map((item) => item.category)
          .filter(Boolean);

        const wishlistWords = wishlistItems
          .map((item) => `${item.name || ""} ${item.description || ""}`)
          .join(" ")
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length > 2);

        const ranked = allProducts
          .filter(
            (product) =>
              !wishlistItems.some((item) => item._id === product._id) &&
              Number(product.stock) > 0
          )
          .map((product) => {
            const text =
              `${product.name || ""} ${product.description || ""} ${product.category || ""}`
                .toLowerCase();

            const wordScore = wishlistWords.reduce(
              (score, word) => score + (text.includes(word) ? 1 : 0),
              0
            );

            const categoryScore = wishlistCategories.includes(product.category)
              ? 3
              : 0;

            return {
              ...product,
              recommendationScore: wordScore + categoryScore,
            };
          })
          .sort(
            (a, b) =>
              b.recommendationScore - a.recommendationScore
          )
          .slice(0, 4);

        if (!cancelled) setRecommendedProducts(ranked);
      } catch (error) {
        console.error("Could not load recommendations:", error);
        if (!cancelled) setRecommendedProducts([]);
      } finally {
        if (!cancelled) setLoadingRecommendations(false);
      }
    };

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [wishlistItems, isAdmin, userInfo?.token]);

  

  return (
    <div className="overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="py-24 bg-gradient-to-br 
        from-indigo-50 via-white to-blue-100 
        dark:from-gray-900 dark:via-gray-950 dark:to-black">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight 
              text-gray-900 dark:text-white">
              Modern Wholesale &
              <span className="text-primary block">
                Retail Commerce
              </span>
            </h1>

            <p className="text-lg max-w-xl 
              text-gray-600 dark:text-gray-400">
              Built for next-gen businesses with scalable infrastructure,
              powerful inventory management and secure transactions.
            </p>

            {showHeroButtons && (
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:scale-105 transition"
                >
                  Explore Collection
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="bg-gray-200 text-gray-800 
                    dark:bg-gray-800 dark:text-white
                    px-8 py-3 rounded-xl hover:scale-105 transition"
                >
                  Register Now
                </button>
              </div>
            )}

            <div className="flex gap-6 text-sm pt-2 
              text-gray-500 dark:text-gray-400 flex-wrap">
              <span>✔ 10K+ Customers</span>
              <span>✔ Secure Payments</span>
              <span>✔ Fast Delivery</span>
              <span>✔ 24/7 Support</span>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>

            <img
              src="https://imgs.search.brave.com/8GG5sMAF0xBRBfVMM6ARfZ1hy6QOtGDrBBBRqapXCOw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9lLWNv/bW1lcmNlLWNvbmNl/cHQtZmVtYWxlLWhh/bmQtdG91Y2hpbmct/cG9pbnRpbmctZmlu/YW5jaWFsLWljb25z/LWlzb2xhdGVkLXdo/aXRlLWJhY2tncm91/bmQtMzI4NDQ1MTQu/anBn"
              alt="Ecommerce"
              className="relative rounded-3xl shadow-2xl w-96"
            />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">

        {[
          { icon: "🚚", title: "Fast Delivery", desc: "Quick and secure shipping powered by professional logistics partners." },
          { icon: "💰", title: "Wholesale Pricing", desc: "Competitive bulk pricing tailored for retailers and distributors." },
          { icon: "🔒", title: "Secure Payments", desc: "Enterprise-grade security and fully encrypted checkout system." },
        ].map((item, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl transition hover:-translate-y-2
              bg-white shadow-md
              dark:bg-gray-900 dark:shadow-none"
          >
            <div className="text-3xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2
              text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ================= TRENDING ================= */}
      <section className="py-20 bg-gray-50 dark:bg-black">

        <h2 className="text-3xl font-bold text-center mb-12
          text-gray-900 dark:text-white">
          Trending Products
        </h2>

        <div className="overflow-hidden">
          <div className="flex gap-10 animate-scroll w-max">

            {[...products, ...products].map((product, index) => (
              <div
                key={index}
                className="w-80 rounded-2xl overflow-hidden
                  shadow-md transition hover:-translate-y-3
                  bg-white dark:bg-gray-900"
              >

                {/* Image Container */}
                <div className="h-72 flex items-center justify-center
                  bg-gray-100 dark:bg-gray-800 p-6">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />

                </div>

                {/* Title */}
                <div className="p-6 text-center">
                  <h4 className="font-semibold
                    text-gray-900 dark:text-white">
                    {product.name}
                  </h4>
                </div>

              </div>
            ))}

          </div>
        </div>

      </section>

      {/* ============== CUSTOMER RECOMMENDATIONS ============== */}
      {isLoggedIn && !isAdmin && (
        <section className="py-16 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            Recommended for You ✨
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Products selected using your wishlist preferences.
          </p>

          {loadingRecommendations ? (
            <p className="text-gray-500">Finding products for you...</p>
          ) : recommendedProducts.length === 0 ? (
            <p className="text-gray-500">
              Add products to your wishlist to get personalized suggestions.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-md"
                >
                  <img
                    src={product.image || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800 p-4"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>

                    <p className="text-primary font-bold mt-2">
                      ₹{product.price}
                    </p>

                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="w-full mt-4 bg-primary text-white py-2 rounded-lg"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= CTA ================= */}
      {!isLoggedIn && (
        <section className="py-20 text-center bg-primary">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-white/90 mb-8">
            Join thousands of wholesalers and retailers using our
            enterprise-grade commerce system.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Create an Account
          </button>
        </section>
      )}

      {/* ============== SCROLL ANIMATION ============== */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Home;