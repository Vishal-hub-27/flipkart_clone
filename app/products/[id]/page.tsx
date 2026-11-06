
"use client";

import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  image: string;
  description: string;
}

function ProductDetailsContent() {
  const params = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch product using MongoDB ID
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setProduct(data.product || data);
        }
      } catch (error) {
        console.error("Product fetching error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return <div className="empty-message">Loading product...</div>;
  }

  if (!product) {
    return <div className="empty-message">Product not found.</div>;
  }

  return (
    <div className="details-container">
      <div className="details-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="details-info">
        <p className="breadcrumb">
          <Link href="/">Home</Link> /{" "}
          <Link href="/products">Products</Link>
        </p>

        <h1>{product.name}</h1>

        <div className="rating">
          ★ {product.rating} Rating
        </div>

        <h2>
          ₹{product.price.toLocaleString("en-IN")}
        </h2>

        <del>
          ₹{product.oldPrice.toLocaleString("en-IN")}
        </del>

        <p>{product.description}</p>

        <p className="stock">✓ In Stock</p>

        <div className="details-buttons">
          <button
            className="add-btn"
            onClick={() =>
              addToCart({
                ...product,
                id: product._id,
              })
            }
          >
            Add to Cart
          </button>

          <Link href="/cart" className="buy-btn">
            Go to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  return (
    <Suspense fallback={<div className="empty-message">Loading product...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}
