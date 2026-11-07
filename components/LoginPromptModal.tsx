"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Popup shown when a visitor who is not logged in tries to add a product to the cart
export default function LoginPromptModal() {
  const { loginPromptOpen, closeLoginPrompt } = useCart();

  // Close with Escape key
  useEffect(() => {
    if (!loginPromptOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLoginPrompt();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loginPromptOpen, closeLoginPrompt]);

  if (!loginPromptOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeLoginPrompt}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={closeLoginPrompt}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="modal-icon">
          <ShoppingCart size={30} />
        </div>

        <h2 id="login-prompt-title">Login Required</h2>

        <p>
          Please login or create an account to add products to your cart.
        </p>

        <div className="modal-actions">
          <Link
            href="/login"
            className="modal-btn modal-btn-primary"
            onClick={closeLoginPrompt}
          >
            Login
          </Link>

          <Link
            href="/register"
            className="modal-btn modal-btn-secondary"
            onClick={closeLoginPrompt}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}