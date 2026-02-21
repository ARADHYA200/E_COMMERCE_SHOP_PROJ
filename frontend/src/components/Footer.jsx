import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }

    setSubscribing(true);
    try {
      toast.success("Subscribed to newsletter!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleFooterLinks = (type) => {
    switch (type) {
      case "contact":
        toast.info("📞 Contact: support@ecommerce.com | +1 (555) 123-4567");
        break;
      case "faq":
        toast.info("❓ FAQ: Check back soon for detailed FAQs!");
        break;
      case "help":
        toast.info("💬 Help Center: Email support@ecommerce.com for assistance");
        break;
      case "shipping":
        toast.info("🚚 Shipping: Free shipping on orders over ₹500");
        break;
      case "returns":
        toast.info("↩️ Returns available within 30 days of purchase");
        break;
      case "track":
        toast.info("📍 Track your order using the email confirmation");
        break;
      case "privacy":
        toast.info("🔒 Privacy Policy: Your data is secure with us");
        break;
      case "terms":
        toast.info("📋 Terms of Service: Please review before shopping");
        break;
      case "cookies":
        toast.info("🍪 We use cookies to enhance your experience");
        break;
      case "accessibility":
        toast.info("♿ Accessibility: We strive for inclusive design");
        break;
      default:
        break;
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-100 mt-16">
      {/* Newsletter Section */}
      <div className="bg-primary py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-200 mb-6 text-sm sm:text-base">
            Subscribe to our newsletter for exclusive deals and product updates.
          </p>
          <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm sm:text-base"
            >
              {subscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">
              ECOMMERCE_SHOP
            </h3>
            <p className="text-gray-400 mb-4">
              Your trusted wholesale & retail e-commerce platform.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
              >
                <span className="text-2xl">f</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
              >
                <span className="text-2xl">𝕏</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
              >
                <span className="text-2xl">📷</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
              >
                <span className="text-2xl">in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-primary transition"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-primary transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("contact")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("faq")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleFooterLinks("help")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("shipping")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("returns")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("track")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Track Order
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleFooterLinks("privacy")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("terms")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("cookies")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinks("accessibility")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  Accessibility
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-700 py-8 mb-8">
          <h4 className="text-lg font-semibold mb-4 text-center">
            Secure Payment Methods
          </h4>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="text-center">
              <span className="text-3xl">💳</span>
              <p className="text-sm text-gray-400 mt-1">Credit Card</p>
            </div>
            <div className="text-center">
              <span className="text-3xl">🅿️</span>
              <p className="text-sm text-gray-400 mt-1">PayPal</p>
            </div>
            <div className="text-center">
              <span className="text-3xl">🏦</span>
              <p className="text-sm text-gray-400 mt-1">Bank Transfer</p>
            </div>
            <div className="text-center">
              <span className="text-3xl">💰</span>
              <p className="text-sm text-gray-400 mt-1">Cash on Delivery</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div>
              <p className="text-gray-400">📞 Phone</p>
              <p className="text-primary font-semibold">+1 (555) 123-4567</p>
            </div>
            <div>
              <p className="text-gray-400">📧 Email</p>
              <p className="text-primary font-semibold">support@ecommerce.com</p>
            </div>
            <div>
              <p className="text-gray-400">📍 Location</p>
              <p className="text-primary font-semibold">123 Commerce St, City, Country</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>© 2026 ECOMMERCE_SHOP. All rights reserved. | Built with ❤️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;