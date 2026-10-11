import crypto from "crypto";
import mongoose from "mongoose";
import { CustomerModel } from "../models/customer.model.js";
import { ProductModel } from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";
import { razorpay } from "../config/razorpay.js";

const validateShippingAddress = (addr) => {
    if (!addr) return "Shipping address is required";
    if (!addr.fullName || !addr.fullName.trim()) return "Full name is required";
    if (!addr.phone || !addr.phone.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(addr.phone.trim())) return "Phone must be a valid 10-digit number";
    if (!addr.addressLine1 || !addr.addressLine1.trim()) return "Address line is required";
    if (!addr.city || !addr.city.trim()) return "City is required";
    if (!addr.state || !addr.state.trim()) return "State is required";
    if (!addr.pincode || !addr.pincode.trim()) return "Pincode is required";
    if (!/^\d{6}$/.test(addr.pincode.trim())) return "Pincode must be exactly 6 digits";
    return null;
};

export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        const addrError = validateShippingAddress(shippingAddress);
        if (addrError) {
            return res.status(400).json({ success: false, message: addrError });
        }

        const user = await CustomerModel.findById(req.user._id).populate("cart.product");
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const validCart = (user.cart || []).filter(
            (item) => item && item.product && item.product._id
        );

        if (validCart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of validCart) {
            const product = await ProductModel.findById(cartItem.product._id);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${cartItem.product.name}" is no longer available`
                });
            }
            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`
                });
            }
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image || ""
            });
            totalAmount += product.price * cartItem.quantity;
        }

        const sanitizedAddress = {
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            addressLine1: shippingAddress.addressLine1.trim(),
            city: shippingAddress.city.trim(),
            state: shippingAddress.state.trim(),
            pincode: shippingAddress.pincode.trim()
        };

        const shopKartOrder = await OrderModel.create({
            user: user._id,
            items: orderItems,
            shippingAddress: sanitizedAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        const amountInPaise = Math.round(totalAmount * 100);

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: shopKartOrder._id.toString()
        });

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order"
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment verification fields" });
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        const order = await OrderModel.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const user = await CustomerModel.findById(req.user._id);
        if (user) {
            user.cart = [];
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed"
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        const order = await OrderModel.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch order" });
    }
};
