
"use client";

import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");

  const { cart, clearCart } = useCart();

  const { user, isLoggedIn, loading, logout } = useAuth();

  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    window.location.href =
      `/products?search=${encodeURIComponent(search)}`;
  }

  const handleLogout = () => {
    logout();
    clearCart();
    router.push("/");
  };
  
  console.log("Navbar state:", {
  user,
  isLoggedIn,
  loading,
});

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

          <Link href="/products">
            Products
          </Link>

          <Link href="/cart" className="cart-link">
            <ShoppingCart size={20} />

            Cart (
              {cart.reduce(
                (sum, item) => sum + item.quantity,
                0
              )}
            )
          </Link>

          {/* Authentication */}
          {loading ? (
            <span>Loading...</span>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="font-medium">
                Hello, {user?.name}
              </span>

              <Link href="/profile" className="hover:text-blue-600">
                Profile
              </Link>

              <Link href="/orders" className="hover:text-blue-600">
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hover:text-blue-600">
                Login
              </Link>

              <Link href="/register" className="hover:text-blue-600">
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
