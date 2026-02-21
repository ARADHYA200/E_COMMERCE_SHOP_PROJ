import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
  // Read user synchronously from localStorage to avoid flicker
  const userInfo = JSON.parse(localStorage.getItem("user") || "null");

  // Determine admin flag in a safe way. Prefer explicit `isAdmin`,
  // fall back to role === 'admin' when `isAdmin` isn't present.
  const isAdmin = Boolean(
    userInfo?.isAdmin === true || userInfo?.role === "admin"
  );

  // Buttons visible when no user OR when a non-admin customer is logged in
  const showHeroButtons = !isAdmin;

  return (
    <div className="space-y-16">

      {/* Hero Section */}
      <section className="text-center py-8 sm:py-12 md:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Modern Wholesale & Retail <br className="hidden sm:inline" />
          <span className="text-primary">E-Commerce Platform</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Scalable, professional and enterprise-ready e-commerce system
          designed for both wholesale and retail businesses.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          {showHeroButtons && (
            <>
              <Button variant="primary" className="w-full sm:w-auto" onClick={() => navigate("/products")}>Shop Now</Button>
              <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate("/products")}>Explore Products</Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Quick and secure shipping with professional logistics.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-2">Wholesale Pricing</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Competitive pricing tailored for distributors and retailers.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enterprise-grade security and encrypted transactions.
          </p>
        </Card>
      </section>

    </div>
  );
};

export default Home;