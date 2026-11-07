"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, ShieldCheck, Package, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function ProfilePage() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();

  // Protect profile page
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [loading, isLoggedIn, router]);

  function handleLogout() {
    logout();
    clearCart();
    router.replace("/");
  }

  if (loading || !isLoggedIn) {
    return (
      <div className="profile-page">
        <p className="profile-loading">Loading profile...</p>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-big-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="profile-section">
          <h2>Account Information</h2>

          <div className="profile-row">
            <User size={20} />
            <div>
              <span>Full Name</span>
              <strong>{user?.name}</strong>
            </div>
          </div>

          <div className="profile-row">
            <Mail size={20} />
            <div>
              <span>Email Address</span>
              <strong>{user?.email}</strong>
            </div>
          </div>

          <div className="profile-row">
            <ShieldCheck size={20} />
            <div>
              <span>Account Status</span>
              <strong className="profile-active">Active</strong>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="profile-links">
          <Link href="/orders" className="profile-link-card">
            <Package size={22} />
            <span>My Orders</span>
          </Link>

          <Link href="/cart" className="profile-link-card">
            <ShoppingCart size={22} />
            <span>My Cart ({cartCount})</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <Link href="/" className="profile-btn profile-btn-primary">
            Continue Shopping
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="profile-btn profile-btn-danger"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}