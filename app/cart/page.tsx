"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  return (
    <div className="cart-container">
      <section className="cart-products">
        <h2>My Shopping Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <h3>Your cart is empty!</h3>
            <p>Add some products to start shopping.</p>
            <Link href="/products" className="hero-btn">
              Shop Now
            </Link>
          </div>
        ) : (
          cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />

              <div className="cart-item-info">
                <h3>{item.name}</h3>

                <strong>
                  ₹{item.price.toLocaleString("en-IN")}
                </strong>

                <div className="quantity">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity === 1}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {cart.length > 0 && (
        <aside className="price-summary">
          <h3>Price Details</h3>

          <div>
            <span>Items ({cart.length})</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>

          <div>
            <span>Delivery Charges</span>
            <span className="free">FREE</span>
          </div>

          <hr />

          <div className="total-price">
            <strong>Total Amount</strong>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <button
            className="checkout-btn"
            onClick={() => alert("Checkout will be implemented later!")}
          >
            Place Order
          </button>
        </aside>
      )}
    </div>
  );
}