import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, subtotal, fetchCart } = useCart();

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(form.phone.trim())) {
            newErrors.phone = "Phone must be a valid 10-digit number";
        }
        if (!form.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";
        if (!form.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(form.pincode.trim())) {
            newErrors.pincode = "Pincode must be exactly 6 digits";
        }
        return newErrors;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById("razorpay-script")) {
                resolve(typeof window.Razorpay === "function");
                return;
            }
            const script = document.createElement("script");
            script.id = "razorpay-script";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setServerError("");

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setServerError("Failed to load Razorpay. Check your internet connection and try again.");
                setLoading(false);
                return;
            }

            const { data } = await api.post("/orders/create-payment-order", {
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    addressLine1: form.addressLine1.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim()
                }
            });

            if (!data.success) {
                setServerError(data.message || "Failed to create order");
                setLoading(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                order_id: data.razorpayOrderId,
                name: "ShopKart",
                description: "ShopKart Purchase",
                prefill: {
                    name: form.fullName.trim(),
                    contact: form.phone.trim()
                },
                handler: async (response) => {
                    try {
                        const verifyData = await api.post("/orders/verify-payment", {
                            shopKartOrderId: data.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        if (verifyData.data.success) {
                            await fetchCart();
                            navigate(`/order-success/${data.shopKartOrderId}`);
                        } else {
                            setServerError(verifyData.data.message || "Payment verification failed");
                            setLoading(false);
                        }
                    } catch (err) {
                        setServerError(err.response?.data?.message || "Payment verification failed");
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => {
                setServerError("Payment failed. Your cart is intact. Please try again.");
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                            🛒
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 text-sm mb-8">Add items to your cart before checking out.</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md"
                        >
                            <span>Browse Products</span>
                            <span>→</span>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
                    <p className="text-gray-500 text-sm mt-1">Complete your shipping details and place your order</p>
                </div>

                {serverError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
                        <span>{serverError}</span>
                        <button type="button" onClick={() => setServerError("")} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Shipping Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="fullName">Full Name</label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition ${errors.fullName ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-indigo-500"}`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="phone">Phone Number</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-indigo-500"}`}
                                        placeholder="10-digit mobile number"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="addressLine1">Address Line</label>
                                    <input
                                        id="addressLine1"
                                        name="addressLine1"
                                        type="text"
                                        value={form.addressLine1}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition ${errors.addressLine1 ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-indigo-500"}`}
                                        placeholder="House no., Street, Locality"
                                    />
                                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="city">City</label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={form.city}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition ${errors.city ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-indigo-500"}`}
                                        placeholder="City"
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="state">State</label>
                                    <input
                                        id="state"
                                        name="state"
                                        type="text"
                                        value={form.state}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition ${errors.state ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-indigo-500"}`}
                                        placeholder="State"
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="pincode">Pincode</label>
                                    <input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition ${errors.pincode ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-indigo-500"}`}
                                        placeholder="6-digit pincode"
                                    />
                                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h2>
                            <div className="space-y-3 mb-4">
                                {cartItems.map((item) => (
                                    <div key={item.product._id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                                            {item.product.image ? (
                                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 shrink-0">₹{item.product.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-emerald-600">FREE</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-black text-indigo-600">₹{subtotal}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <Link
                                to="/cart"
                                className="block text-center mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                ← Back to Cart
                            </Link>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default Checkout;
