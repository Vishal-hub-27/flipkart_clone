"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, LogOut, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { cart, clearCart } = useCart();
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products?search=${encodeURIComponent(search)}`);
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    clearCart();
    router.replace("/");
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const firstName = user?.name?.split(" ")[0] || "Account";

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link href="/" className="logo">
          Flipkart<span>Lite</span>
          <small>Explore Plus</small>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Navigation */}
        <div className="nav-links">
          <Link href="/products">Products</Link>

          <Link href="/cart" className="cart-link">
            <ShoppingCart size={20} />
            Cart ({cartCount})
          </Link>

          {/* Authentication */}
          {loading ? (
            <span className="nav-muted">...</span>
          ) : isLoggedIn ? (
            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <span className="profile-avatar">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="profile-name">{firstName}</span>
                <span className="profile-caret">▾</span>
              </button>

              {menuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-head">
                    <strong>{user?.name}</strong>
                    <small>{user?.email}</small>
                  </div>

                  <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>

                  <Link href="/orders" onClick={() => setMenuOpen(false)}>
                    <Package size={16} /> My Orders
                  </Link>

                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="login-btn">
                Login
              </Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}