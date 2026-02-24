import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Footer = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("newsletterSubscribed") === "true";
  });

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Subscribe
  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);

    setTimeout(() => {
      localStorage.setItem("newsletterSubscribed", "true");
      setIsSubscribed(true);
      setEmail("");
      setSubscribing(false);
      toast.success("🎉 Successfully subscribed!");
    }, 800);
  };

  // Unsubscribe
  const handleUnsubscribe = () => {
    localStorage.removeItem("newsletterSubscribed");
    setIsSubscribed(false);
    toast.info("You have unsubscribed.");
  };

  const handleFooterLinks = (msg) => {
    toast.info(msg);
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 mt-20 transition-colors border-t border-gray-300 dark:border-gray-800">

      {/* ================= NEWSLETTER ================= */}
      {user && (
        <div className="bg-gradient-to-r from-primary to-indigo-600 py-12 text-white border-b border-white/20">
          <div className="max-w-5xl mx-auto px-6 text-center">

            {!isSubscribed ? (
              <>
                <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                <p className="mb-6 text-white/90">
                  Subscribe to receive exclusive discounts & new product launches.
                </p>

                <form
                  onSubmit={handleNewsletterSubscribe}
                  className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {subscribing ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-3">
                  ✅ You are subscribed!
                </h2>

                <p className="text-white/90 mb-6">
                  You'll now receive updates about offers & new arrivals.
                </p>

                <button
                  onClick={handleUnsubscribe}
                  className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Unsubscribe
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= MAIN GRID ================= */}
  <div className="w-full border-b border-gray-300 dark:border-gray-800">
    <div
      className="
        max-w-7xl mx-auto
        px-6 sm:px-8 lg:px-12
        py-16
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
        gap-12 lg:gap-16
      "
    >

      {/* Column 1 */}
      <div className="flex flex-col space-y-5">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          ECOMMERCE<span className="text-primary">_SHOP</span>
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
          Your trusted wholesale & retail e-commerce platform delivering premium
          products with unmatched reliability.
        </p>
      </div>

      {/* Column 2 */}
      <div className="flex flex-col">
        <h4 className="font-semibold mb-6 text-gray-900 dark:text-white tracking-wide">
          Quick Links
        </h4>

        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <Link to="/" className="hover:text-primary transition">
              Home
            </Link>
          </li>

          <li>
            <Link to="/products" className="hover:text-primary transition">
              Browse Products
            </Link>
          </li>

          <li>
            <Link to="/orders" className="hover:text-primary transition">
              My Orders
            </Link>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks("📞 support@ecommerce.com")
              }
              className="hover:text-primary transition"
            >
              Contact
            </button>
          </li>
        </ul>
      </div>

      {/* Column 3 */}
      <div className="flex flex-col">
        <h4 className="font-semibold mb-6 text-gray-900 dark:text-white tracking-wide">
          Support
        </h4>

        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <button
              onClick={() =>
                handleFooterLinks("💬 24/7 Help Center")
              }
              className="hover:text-primary transition"
            >
              Help Center
            </button>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks("🚚 Free shipping above ₹500")
              }
              className="hover:text-primary transition"
            >
              Shipping Info
            </button>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks("↩️ 30-day easy returns")
              }
              className="hover:text-primary transition"
            >
              Returns & Refunds
            </button>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks(
                  "📍 Track via order confirmation email"
                )
              }
              className="hover:text-primary transition"
            >
              Track Order
            </button>
          </li>
        </ul>
      </div>

      {/* Column 4 */}
      <div className="flex flex-col">
        <h4 className="font-semibold mb-6 text-gray-900 dark:text-white tracking-wide">
          Legal
        </h4>

        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <button
              onClick={() =>
                handleFooterLinks("🔒 Privacy protected")
              }
              className="hover:text-primary transition"
            >
              Privacy Policy
            </button>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks("📜 Terms apply")
              }
              className="hover:text-primary transition"
            >
              Terms of Service
            </button>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks("🍪 Cookie usage")
              }
              className="hover:text-primary transition"
            >
              Cookie Policy
            </button>
          </li>

          <li>
            <button
              onClick={() =>
                handleFooterLinks("♿ Accessibility first")
              }
              className="hover:text-primary transition"
            >
              Accessibility
            </button>
          </li>
        </ul>
      </div>

    </div>
  </div>

      {/* ================= PAYMENT METHODS ================= */}
      <div className="border-b border-gray-300 dark:border-gray-800 py-10">
        <h4 className="text-center font-semibold mb-8 text-gray-900 dark:text-white">
          Secure Payment Methods
        </h4>

        <div className="flex flex-wrap justify-center items-center gap-10">

          {/* UPI */}
          <img
            src="https://imgs.search.brave.com/5i8nTOk_bQPbXmOHzJ-sCHfWm30Hs9-CK0d0zkkEPFc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbmdo/ZHByby5jb20vd3At/Y29udGVudC90aGVt/ZXMvcG5naGRwcm8v/ZG93bmxvYWQvc29j/aWFsLW1lZGlhLWFu/ZC1icmFuZHMvdXBp/LWxvZ28ucG5n"
            alt="UPI"
            className="h-12 object-contain"
          />

          {/* Visa */}
          <img
            src="https://imgs.search.brave.com/nXFNVEqc3NW6i2fhib4CGTHWekAbNXaEUuSIIEE10gU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZnJlZXBuZ2xvZ29z/LmNvbS91cGxvYWRz/L3ZlcmlmaWVkLWJ5/LXZpc2EtbG9nby1w/bmctMC5wbmc"
            alt="Visa"
            className="h-10 object-contain"
          />

          {/* Mastercard */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
            alt="Mastercard"
            className="h-10 object-contain"
          />

          {/* Razorpay */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
            alt="Razorpay"
            className="h-10 object-contain"
          />

        </div>
      </div>

      {/* ================= COPYRIGHT ================= */}
      <div className="border-t border-gray-300 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} ECOMMERCE_SHOP. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;