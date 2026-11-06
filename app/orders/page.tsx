
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();

  const { isLoggedIn, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.replace("/login");
      setLoadingOrders(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch orders");
        }

        setOrders(data.orders || []);

      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [authLoading, isLoggedIn, router]);

  if (authLoading || loadingOrders) {
    return (
      <div className="p-10 text-center">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-6">
        My Orders
      </h1>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-3">
            No orders found
          </h2>

          <p className="text-gray-500 mb-5">
            You have not placed any orders yet.
          </p>

          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">

          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-5 shadow-sm"
            >

              <div className="flex flex-wrap justify-between gap-3 mb-4">

                <div>
                  <p className="font-semibold">
                    Order ID: {order._id}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <span className="text-green-600 font-semibold">
                  {order.status}
                </span>

              </div>

              <div className="border-t border-b py-4 space-y-3">

                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}

              </div>

              <div className="flex justify-between mt-4 font-bold">
                <span>Total Amount</span>

                <span>
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
