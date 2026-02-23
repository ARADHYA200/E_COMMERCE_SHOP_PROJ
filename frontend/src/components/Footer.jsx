import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const location = useLocation();

  // ✅ AUTO SCROLL TO TOP ON ROUTE CHANGE
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);
    setTimeout(() => {
      toast.success("🎉 Successfully subscribed!");
      setEmail("");
      setSubscribing(false);
    }, 800);
  };

  const handleFooterLinks = (msg) => {
    toast.info(msg);
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 mt-20 transition-colors">

      {/* ================= NEWSLETTER ================= */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 py-12 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
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
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            ECOMMERCE<span className="text-primary">_SHOP</span>
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Your trusted wholesale & retail e-commerce platform delivering
            premium products with unmatched reliability.
          </p>

          <div className="flex gap-4 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition">🌐</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition">𝕏</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary transition">📷</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition">💼</a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-5 text-gray-900 dark:text-white">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-primary transition">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary transition">Browse Products</Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary transition">My Orders</Link>
            </li>
            <li>
              <button
                onClick={() => handleFooterLinks("📞 support@ecommerce.com | +91 9876543210")}
                className="hover:text-primary transition"
              >
                Contact Us
              </button>
            </li>
            <li>
              <button
                onClick={() => handleFooterLinks("❓ FAQ launching soon")}
                className="hover:text-primary transition"
              >
                FAQ
              </button>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold mb-5 text-gray-900 dark:text-white">Support</h4>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => handleFooterLinks("💬 24/7 Help Center")} className="hover:text-primary transition">Help Center</button></li>
            <li><button onClick={() => handleFooterLinks("🚚 Free shipping above ₹500")} className="hover:text-primary transition">Shipping Info</button></li>
            <li><button onClick={() => handleFooterLinks("↩️ 30-day easy returns")} className="hover:text-primary transition">Returns & Refunds</button></li>
            <li><button onClick={() => handleFooterLinks("📍 Track via order confirmation email")} className="hover:text-primary transition">Track Order</button></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold mb-5 text-gray-900 dark:text-white">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => handleFooterLinks("🔒 Privacy protected")} className="hover:text-primary transition">Privacy Policy</button></li>
            <li><button onClick={() => handleFooterLinks("📜 Terms apply")} className="hover:text-primary transition">Terms of Service</button></li>
            <li><button onClick={() => handleFooterLinks("🍪 Cookie usage")} className="hover:text-primary transition">Cookie Policy</button></li>
            <li><button onClick={() => handleFooterLinks("♿ Accessibility first")} className="hover:text-primary transition">Accessibility</button></li>
          </ul>
        </div>
      </div>

      {/* ================= PAYMENT ================= */}
      <div className="border-t border-gray-300 dark:border-gray-800 py-10">
        <h4 className="text-center font-semibold mb-6 text-gray-900 dark:text-white">
          Secure Payment Methods
        </h4>

        <div className="flex justify-center gap-12 text-4xl opacity-80">
          <span>💳</span>
          <span>🅿️</span>
          <span>🏦</span>
          <span>💰</span>
        </div>
      </div>

      {/* ================= CONTACT ================= */}
      <div className="border-t border-gray-300 dark:border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">📞 Phone</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">+91 98765 43210</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">📧 Email</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">support@ecommerce.com</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">📍 Location</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">New Delhi, India</p>
          </div>
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