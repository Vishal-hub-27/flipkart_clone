"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link href={`/products/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />

        <h3>{product.name}</h3>
      </Link>

      <div className="rating">
        ★ {product.rating}
      </div>

      <div className="price">
        ₹{product.price.toLocaleString("en-IN")}
      </div>

      <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>

      <button
        className="add-btn"
        onClick={() => addToCart(product)}
      >
        <ShoppingCart size={17} />
        Add to Cart
      </button>
    </div>
  );
}