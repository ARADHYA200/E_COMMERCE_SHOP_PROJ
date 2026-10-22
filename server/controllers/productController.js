import Product from "../models/Product.js";
import Review from "../models/Review.js";
import notifyProductChange from "../utils/priceAlertService.js";

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).lean();

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({ product: product._id });

        const averageRating =
          reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

        return {
          ...product,
          averageRating,
          reviewCount: reviews.length,
        };
      })
    );

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    res.json({
      ...product,
      averageRating,
      reviewCount: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Create product failed" });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldPrice = oldProduct.price;
    const oldStock = oldProduct.stock;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Trigger notifications without making the product update depend on email.
    void notifyProductChange({
      product: updatedProduct,
      oldPrice,
      newPrice: updatedProduct.price,
      oldStock,
      newStock: updatedProduct.stock,
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ message: "Failed to update product" });
  }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id).lean();

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const products = await Product.find({
      _id: { $ne: currentProduct._id },
      stock: { $gt: 0 },
    }).lean();

    const tokenize = (text = "") =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 1);

    const buildVector = (product) => {
      const text = [
        product.name,
        product.description,
        product.category,
      ]
        .filter(Boolean)
        .join(" ");

      const words = tokenize(text);
      const vector = {};

      for (const word of words) {
        vector[word] = (vector[word] || 0) + 1;
      }

      return vector;
    };

    const cosineSimilarity = (a, b) => {
      let dot = 0;
      let normA = 0;
      let normB = 0;

      for (const [word, value] of Object.entries(a)) {
        normA += value * value;

        if (b[word] !== undefined) {
          dot += value * b[word];
        }
      }

      for (const value of Object.values(b)) {
        normB += value * value;
      }

      if (!normA || !normB) return 0;

      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const currentVector = buildVector(currentProduct);

    const recommendations = products
      .map((product) => {
        const similarity = cosineSimilarity(
          currentVector,
          buildVector(product)
        );

        const sameCategory =
          product.category === currentProduct.category;

        const currentPrice = Number(currentProduct.price) || 0;
        const candidatePrice = Number(product.price) || 0;

        const priceSimilarity =
          currentPrice > 0 && candidatePrice > 0
            ? Math.min(currentPrice, candidatePrice) /
              Math.max(currentPrice, candidatePrice)
            : 0;

        const score =
          similarity * 0.65 +
          (sameCategory ? 0.25 : 0) +
          priceSimilarity * 0.1;

        return {
          product,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ product }) => product);

    return res.json(recommendations);
  } catch (error) {
    console.error("Recommendation error:", error);

    return res.status(500).json({
      message: "Failed to fetch recommendations",
    });
  }
};
