import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = category === "All" ? "/products" : `/products?category=${category}`;
        const { data } = await API.get(url);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <h2 className="text-lg sm:text-xl font-semibold">Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          All Products
        </h1>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map(product => (
          <div key={product._id} className="relative">
             <Link to={`/product/${product._id}`} className="absolute inset-0 z-0"></Link>
             <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;