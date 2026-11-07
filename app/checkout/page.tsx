"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, isLoggedIn, loading: authLoading, logout } = useAuth();
  const { cart, total, cartLoaded, loading: cartLoading, refreshCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work">("Home");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Becomes true once the order is saved (prevents the "empty cart" redirect)
  const orderPlaced = useRef(false);

  // Pre-fill the name from the logged-in user
  useEffect(() => {
    if (user?.name) setFullName((prev) => prev || user.name);
  }, [user]);

  // Protect page: login required, cart must not be empty
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (cartLoaded && !cartLoading && cart.length === 0 && !orderPlaced.current) {
      router.replace("/cart");
    }
  }, [authLoading, isLoggedIn, cartLoaded, cartLoading, cart.length, router]);

  async function handleConfirmOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName,
            phone,
            pincode,
            addressLine,
            city,
            state,
            addressType,
          },
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to place order.");
        return;
      }

      orderPlaced.current = true;

      // Cart was emptied on the server -> refresh it, then show My Orders
      await refreshCart();
      router.replace("/orders?success=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !isLoggedIn || !cartLoaded || cartLoading) {
    return (
      <div className="checkout-page">
        <p className="page-loading">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        {/* Address form */}
        <section className="checkout-main">
          <h1>Delivery Address</h1>
          <p className="checkout-sub">Where should we deliver your order?</p>

          <form id="checkout-form" onSubmit={handleConfirmOrder} className="checkout-form">
            <div className="form-row">
              <div className="auth-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="phone">Mobile Number</label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="addressLine">Address (House No, Building, Street, Area)</label>
              <textarea
                id="addressLine"
                rows={3}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>

            <div className="form-row">
              <div className="auth-field">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit pincode"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / District"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                required
              />
            </div>

            <div className="auth-field">
              <label>Address Type</label>
              <div className="radio-row">
                {(["Home", "Work"] as const).map((type) => (
                  <label key={type} className={`radio-pill ${addressType === type ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="addressType"
                      checked={addressType === type}
                      onChange={() => setAddressType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="payment-box">
              <strong>Payment Method</strong>
              <span>Cash on Delivery</span>
            </div>

            {error && <p className="auth-error">{error}</p>}
          </form>
        </section>

        {/* Order summary */}
        <aside className="checkout-summary">
          <h3>Order Summary</h3>

          <div className="summary-items">
            {cart.map((item) => (
              <div className="summary-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <small>Qty: {item.quantity}</small>
                </div>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <hr />

          <div className="summary-line">
            <span>Delivery Charges</span>
            <span className="free">FREE</span>
          </div>

          <div className="summary-line summary-total">
            <strong>Total Amount</strong>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="auth-submit confirm-btn"
          >
            {submitting ? "Placing Order..." : "Confirm Order"}
          </button>

          <Link href="/cart" className="back-to-cart">
            ← Back to Cart
          </Link>
        </aside>
      </div>
    </div>
  );
}