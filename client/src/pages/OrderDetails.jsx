import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                if (data.success) {
                    setOrder(data.order);
                } else {
                    setError(data.message || "Order not found");
                }
            } catch (err) {
                if (err.response?.status === 403 || err.response?.status === 404) {
                    navigate("/orders", { replace: true });
                } else {
                    setError(err.response?.data?.message || "Failed to load order");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const statusColor = (status) => {
        const map = {
            PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
            PLACED: "bg-green-100 text-green-700",
            CONFIRMED: "bg-blue-100 text-blue-700",
            SHIPPED: "bg-indigo-100 text-indigo-700",
            DELIVERED: "bg-emerald-100 text-emerald-700"
        };
        return map[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="mb-6 flex items-center gap-3">
                    <Link to="/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition">← My Orders</Link>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading order...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl border border-red-200 p-10 text-center shadow-sm">
                        <p className="text-red-600 font-semibold mb-4">{error}</p>
                        <Link to="/orders" className="text-indigo-600 font-semibold text-sm hover:underline">Back to Orders</Link>
                    </div>
                ) : order && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-5">Order Details</h1>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Order ID</span>
                                    <span className="text-gray-700 font-mono text-xs">{order._id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Date</span>
                                    <span className="text-gray-700">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Order Status</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Payment Status</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{order.paymentStatus}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-100">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-black text-indigo-600">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Items Ordered</h2>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">₹{item.price} × {item.quantity}</p>
                                        </div>
                                        <p className="text-base font-black text-gray-900 shrink-0">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Shipping Address</h2>
                            <div className="space-y-1 text-sm text-gray-700">
                                <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to="/orders"
                                className="flex-1 text-center py-3 px-6 rounded-xl border border-indigo-600 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition"
                            >
                                My Orders
                            </Link>
                            <Link
                                to="/products"
                                className="flex-1 text-center py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-md"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OrderDetails;
