import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
    const {
        cartItems,
        loading,
        error,
        fetchCart,
        updateCartQuantity,
        removeFromCart,
        totalQuantity,
        subtotal
    } = useCart();

    const navigate = useNavigate();

    const [updatingId, setUpdatingId] = useState(null);
    const [actionMessage, setActionMessage] = useState("");
    const [brokenImages, setBrokenImages] = useState(new Set());

    const handleImageError = (productId) => {
        setBrokenImages((prev) => new Set(prev).add(productId));
    };

    const handleIncrease = async (item) => {
        if (updatingId) return;
        if (item.quantity >= item.product.stock) return;

        setUpdatingId(item.product._id);
        setActionMessage("");

        try {
            await updateCartQuantity(item.product._id, item.quantity + 1);
        } catch (err) {
            setActionMessage(
                err.response?.data?.message || "Failed to update quantity. Please try again."
            );
            setTimeout(() => setActionMessage(""), 3500);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDecrease = async (item) => {
        if (updatingId) return;
        if (item.quantity <= 1) return;

        setUpdatingId(item.product._id);
        setActionMessage("");

        try {
            await updateCartQuantity(item.product._id, item.quantity - 1);
        } catch (err) {
            setActionMessage(
                err.response?.data?.message || "Failed to update quantity. Please try again."
            );
            setTimeout(() => setActionMessage(""), 3500);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (productId) => {
        if (updatingId) return;

        setUpdatingId(productId);
        setActionMessage("");

        try {
            await removeFromCart(productId);
        } catch (err) {
            setActionMessage(
                err.response?.data?.message || "Failed to remove product. Please try again."
            );
            setTimeout(() => setActionMessage(""), 3500);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <span>Shopping Cart</span>
                            <span className="text-2xl">🛒</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Review your selected items and proceed to checkout
                        </p>
                    </div>

                    {!loading && !error && cartItems.length > 0 && (
                        <span className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm self-start sm:self-auto">
                            {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in cart
                        </span>
                    )}
                </div>

                {actionMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
                        <span>{actionMessage}</span>
                        <button
                            type="button"
                            onClick={() => setActionMessage("")}
                            className="text-red-500 hover:text-red-700 font-bold ml-4"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Loading your cart...
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Fetching your cart items</p>
                    </div>
                ) : error && cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-red-200 p-10 text-center max-w-md mx-auto shadow-sm my-8">
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Unable to load your cart.
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            We couldn't retrieve your cart details. Please check your network and try again.
                        </p>
                        <button
                            type="button"
                            onClick={fetchCart}
                            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
                        >
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                            🛒
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Your cart is empty 🛒
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-sm mx-auto">
                            Looks like you haven't added anything yet.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                        >
                            <span>Browse Products</span>
                            <span>→</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const isItemUpdating = updatingId === item.product._id;
                                const isBroken = brokenImages.has(item.product._id);
                                const isMaxStock = item.quantity >= item.product.stock;
                                const isMinQuantity = item.quantity <= 1;
                                const itemSubtotal = item.product.price * item.quantity;

                                return (
                                    <div
                                        key={item.product._id}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm transition hover:shadow-md flex flex-col sm:flex-row gap-5 items-stretch sm:items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {!isBroken && item.product.image ? (
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        onError={() => handleImageError(item.product._id)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-xs text-center p-2">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/products/${item.product._id}`}
                                                    className="text-base sm:text-lg font-bold text-gray-900 hover:text-indigo-600 transition truncate block"
                                                    title={item.product.name}
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                                                    ₹{item.product.price}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        Stock: {item.product.stock}
                                                    </span>
                                                    {isMaxStock && (
                                                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                            Max available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecrease(item)}
                                                    disabled={isItemUpdating || isMinQuantity}
                                                    title={isMinQuantity ? "Minimum quantity is 1 (use Remove)" : "Decrease quantity"}
                                                    className="w-9 h-9 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    -
                                                </button>

                                                <span className="w-10 text-center font-bold text-gray-800 text-sm sm:text-base">
                                                    {isItemUpdating ? (
                                                        <span className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => handleIncrease(item)}
                                                    disabled={isItemUpdating || isMaxStock}
                                                    title={isMaxStock ? "Maximum stock reached" : "Increase quantity"}
                                                    className="w-9 h-9 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right min-w-[90px]">
                                                <p className="text-xs text-gray-400 font-medium">Item Total</p>
                                                <p className="text-base sm:text-lg font-black text-gray-900">
                                                    ₹{itemSubtotal}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.product._id)}
                                                disabled={isItemUpdating}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                                title="Remove product"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                                Order Summary
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Units</span>
                                    <span className="font-semibold text-gray-900">{totalQuantity}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Product Rows</span>
                                    <span className="font-semibold text-gray-900">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-emerald-600">FREE</span>
                                </div>

                                <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-baseline">
                                    <span className="text-base font-bold text-gray-900">Subtotal</span>
                                    <span className="text-2xl font-black text-indigo-600">₹{subtotal}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/checkout")}
                                className="w-full mt-6 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <span>Proceed to Checkout</span>
                                <span>→</span>
                            </button>

                            <Link
                                to="/products"
                                className="block text-center mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Cart;
