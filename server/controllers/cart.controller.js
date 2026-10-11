import mongoose from "mongoose";
import { CustomerModel } from "../models/customer.model.js";
import { ProductModel } from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        const user = await CustomerModel.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!Array.isArray(user.cart)) {
            user.cart = [];
        }

        const itemIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            if (user.cart[itemIndex].quantity + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity exceeds available stock"
                });
            }
            user.cart[itemIndex].quantity += 1;
        } else {
            user.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await user.save();
        await user.populate("cart.product");

        const validCart = (user.cart || []).filter(
            (item) => item && item.product && item.product._id
        );

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = await CustomerModel.findById(req.user._id).populate("cart.product");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const validCart = (user.cart || []).filter(
            (item) => item && item.product && item.product._id
        );

        return res.status(200).json({
            success: true,
            count: validCart.length,
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const parsedQuantity = Number(quantity);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (parsedQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock"
            });
        }

        const user = await CustomerModel.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!Array.isArray(user.cart)) {
            user.cart = [];
        }

        const itemIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        user.cart[itemIndex].quantity = parsedQuantity;
        await user.save();
        await user.populate("cart.product");

        const validCart = (user.cart || []).filter(
            (item) => item && item.product && item.product._id
        );

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update cart"
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const user = await CustomerModel.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!Array.isArray(user.cart)) {
            user.cart = [];
        }

        const itemIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        user.cart.splice(itemIndex, 1);
        await user.save();
        await user.populate("cart.product");

        const validCart = (user.cart || []).filter(
            (item) => item && item.product && item.product._id
        );

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: validCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to remove product from cart"
        });
    }
};
