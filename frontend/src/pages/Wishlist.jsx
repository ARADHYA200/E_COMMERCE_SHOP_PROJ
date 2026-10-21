
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { CartContext } from "../context/CartContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { toast } from "react-toastify";
import API from "../services/api";

const DEFAULT_SETTINGS = {
  priceDropEnabled: true,
  targetPrice: "",
  backInStockEnabled: true,
};

const getSettingsFromState = (state, productId) =>
  state[productId] || { ...DEFAULT_SETTINGS };

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } =
    useContext(WishlistContext);

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [alertSettings, setAlertSettings] = useState({});
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [savingProduct, setSavingProduct] = useState(null);

  // Load alert settings using the existing Axios API service.
  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      try {
        const { data } = await API.get("/price-alerts");

        if (cancelled) return;

        const settings = {};

        data.forEach((alert) => {
          const productId =
            typeof alert.product === "object"
              ? alert.product?._id
              : alert.product;

          if (!productId) return;

          settings[productId] = {
            priceDropEnabled: alert.priceDropEnabled ?? true,
            targetPrice:
              alert.targetPrice == null
                ? ""
                : String(alert.targetPrice),
            backInStockEnabled: alert.backInStockEnabled ?? true,
          };
        });

        setAlertSettings(settings);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load price alert settings:",
            error.response?.data || error.message
          );

          // A missing alert document is normal for a new wishlist.
          if (error.response?.status !== 401) {
            toast.error("Could not load alert settings");
          }
        }
      } finally {
        if (!cancelled) setLoadingAlerts(false);
      }
    };

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  const getSettings = (productId) =>
    getSettingsFromState(alertSettings, productId);

  const updateLocalSetting = (productId, field, value) => {
    setAlertSettings((previous) => ({
      ...previous,
      [productId]: {
        ...getSettingsFromState(previous, productId),
        [field]: value,
      },
    }));
  };

  const saveAlertSettings = async (product) => {
    const settings = getSettings(product._id);
    const targetText = String(settings.targetPrice).trim();

    let targetPrice = null;

    if (targetText !== "") {
      targetPrice = Number(targetText);

      if (!Number.isFinite(targetPrice) || targetPrice < 0) {
        toast.error("Enter a valid non-negative target price.");
        return;
      }
    }

    setSavingProduct(product._id);

    try {
      await API.put(`/price-alerts/${product._id}`, {
        priceDropEnabled: settings.priceDropEnabled,
        targetPrice,
        backInStockEnabled: settings.backInStockEnabled,
      });

      toast.success("Alert preferences saved!");
    } catch (error) {
      console.error(
        "Failed to save alert settings:",
        error.response?.data || error.message
      );

      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message ||
            "Failed to save alert preferences"
        );
      }
    } finally {
      setSavingProduct(null);
    }
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    toast.success(`${product.name} moved to cart!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❤️</div>

        <h1 className="text-3xl font-bold mb-4">
          Your Wishlist is Empty
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Add items to your wishlist to save them for later!
        </p>

        <Button
          variant="primary"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold">
          My Wishlist
        </h1>

        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm("Clear all items from wishlist?")) {
              clearWishlist();
              toast.success("Wishlist cleared!");
            }
          }}
          className="w-full sm:w-auto"
        >
          Clear All
        </Button>
      </div>

      {loadingAlerts && (
        <p className="text-sm text-gray-500">
          Loading your alert preferences...
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {wishlistItems.map((product) => {
          const settings = getSettings(product._id);

          return (
            <Card
              key={product._id}
              className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all"
            >
              <div className="relative mb-4">
                <img
                  src={product.image || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
                />

                <button
                  onClick={() => {
                    removeFromWishlist(product._id);
                    toast.success("Removed from wishlist");
                  }}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  ❌
                </button>
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center mb-3">
                {product.rating && product.rating > 0 ? (
                  <>
                    <div className="flex text-yellow-500 text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= Math.round(product.rating) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>

                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {product.rating.toFixed(1)} (
                      {product.reviews || 0} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No Reviews Yet
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                {product.description?.substring(0, 90)}...
              </p>

              <div className="space-y-4 mt-auto">
                <p className="text-xl font-bold text-primary">
                  ₹{product.price}
                </p>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-4">
                  <h4 className="font-semibold">
                    🔔 Product Alerts
                  </h4>

                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>Price Drop Alert</span>
                    <input
                      type="checkbox"
                      checked={settings.priceDropEnabled}
                      onChange={(event) =>
                        updateLocalSetting(
                          product._id,
                          "priceDropEnabled",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-pink-600"
                    />
                  </label>

                  {settings.priceDropEnabled && (
                    <div>
                      <label
                        htmlFor={`target-price-${product._id}`}
                        className="block text-sm mb-1"
                      >
                        Target Price (₹, optional)
                      </label>

                      <input
                        id={`target-price-${product._id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 999"
                        value={settings.targetPrice}
                        onChange={(event) =>
                          updateLocalSetting(
                            product._id,
                            "targetPrice",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to get notified about any price drop.
                      </p>
                    </div>
                  )}

                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>Back-in-Stock Alert</span>
                    <input
                      type="checkbox"
                      checked={settings.backInStockEnabled}
                      onChange={(event) =>
                        updateLocalSetting(
                          product._id,
                          "backInStockEnabled",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-pink-600"
                    />
                  </label>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => saveAlertSettings(product)}
                    disabled={savingProduct === product._id}
                  >
                    {savingProduct === product._id
                      ? "Saving..."
                      : "Save Alert Preferences"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleMoveToCart(product)}
                  >
                    Add to Cart
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
