"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
  addressType?: string;
}

interface OrderData {
  _id: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { token, isLoggedIn, loading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [justPlaced, setJustPlaced] = useState(false);

  // Show success banner after placing an order (/orders?success=1)
  useEffect(() => {
    setJustPlaced(new URLSearchParams(window.location.search).get("success") === "1");
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          logout();
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch orders");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchOrders();
  }, [authLoading, isLoggedIn, token, router, logout]);

  if (authLoading || loadingOrders) {
    return (
      <div className="orders-page">
        <p className="page-loading">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {justPlaced && (
        <div className="order-success">
          <CheckCircle2 size={22} />
          <div>
            <strong>Order placed successfully!</strong>
            <p>Thank you for shopping with us. Your order is being processed.</p>
          </div>
        </div>
      )}

      {error && <p className="auth-error">{error}</p>}

      {orders.length === 0 && !error ? (
        <div className="empty-cart">
          <h3>No orders found</h3>
          <p>You have not placed any orders yet.</p>
          <Link href="/products" className="hero-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-head">
                <div>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <small>
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </small>
                </div>

                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    {item.image && <img src={item.image} alt={item.name} />}

                    <div className="order-item-info">
                      <p>{item.name}</p>
                      <small>
                        Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                      </small>
                    </div>

                    <strong>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-foot">
                {order.shippingAddress && (
                  <div className="order-address">
                    <small>Delivering to ({order.shippingAddress.addressType || "Home"})</small>
                    <p>
                      <strong>{order.shippingAddress.fullName}</strong> ·{" "}
                      {order.shippingAddress.phone}
                    </p>
                    <p>
                      {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                )}

                <div className="order-total">
                  <small>{order.paymentMethod || "Cash on Delivery"}</small>
                  <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}