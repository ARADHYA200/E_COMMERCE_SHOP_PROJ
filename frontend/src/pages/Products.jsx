import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <h2 className="text-lg sm:text-xl font-semibold">Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">
        All Products
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;