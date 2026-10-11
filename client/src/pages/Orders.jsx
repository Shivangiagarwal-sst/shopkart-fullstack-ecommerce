import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get("/orders");
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    setError(data.message || "Failed to load orders");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

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
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">View and track all your ShopKart orders</p>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl border border-red-200 p-10 text-center shadow-sm my-8">
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Failed to load orders</h2>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button
                            type="button"
                            onClick={() => { setLoading(true); setError(""); }}
                            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                            📦
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 text-sm mb-8">You haven't placed any orders. Start shopping!</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md"
                        >
                            <span>Browse Products</span>
                            <span>→</span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Order ID</p>
                                        <p className="text-sm font-mono text-gray-700">{order._id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-gray-400 font-medium">Date</p>
                                        <p className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 shrink-0">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{order.paymentStatus}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-indigo-600">₹{order.totalAmount}</span>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-4 py-1.5 rounded-lg transition"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Orders;
