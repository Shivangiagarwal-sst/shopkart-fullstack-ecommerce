import mongoose from "mongoose";
import { ProductModel } from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "shopkart/products" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(buffer);
  });
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedDesc = typeof description === "string" ? description.trim() : "";
    const trimmedCategory = typeof category === "string" ? category.trim() : "";

    if (
      !trimmedName ||
      !trimmedDesc ||
      price === undefined ||
      price === "" ||
      !trimmedCategory ||
      stock === undefined ||
      stock === "" ||
      (!req.file && (!req.body.image || !req.body.image.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "All product fields are required",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price or stock",
      });
    }

    let image = req.body.image ? req.body.image.trim() : "";

    if (req.file) {
      image = await uploadToCloudinary(req.file.buffer);
    }

    const product = await ProductModel.create({
      name: trimmedName,
      description: trimmedDesc,
      price: numericPrice,
      category: trimmedCategory,
      image,
      stock: numericStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: "i" } },
        { description: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    if (category && category.trim()) {
      const sanitizedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.category = {
        $regex: `^${sanitizedCategory}$`,
        $options: "i",
      };
    }

    const products = await ProductModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    product.image = imageUrl;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product image updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload product image",
    });
  }
};