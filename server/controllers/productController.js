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

// GET RECOMMENDED PRODUCTS
export const getRecommendedProducts = async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const recommendations = await Product.find({
      _id: { $ne: currentProduct._id },
      category: currentProduct.category,
    })
      .limit(4)
      .lean();

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch recommendations",
    });
  }
};

