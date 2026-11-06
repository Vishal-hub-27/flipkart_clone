
"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  image: string;
  description: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  // 1. Fetch products from MongoDB API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // 2. Read category and search from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setCategory(params.get("category") || "All");
    setSearch(params.get("search") || "");
  }, []);

  // 3. Filter products
  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // 4. Sort products
  if (sort === "low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.price - b.price
    );
  }

  if (sort === "high") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.price - a.price
    );
  }

  return (
    <div className="listing-layout">
      <aside className="filters">
        <h2>Filters</h2>

        <h4>Categories</h4>

        {["All", "Electronics", "Fashion"].map((item) => (
          <button
            key={item}
            className={category === item ? "active-filter" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <section className="listing-content">
        <div className="listing-header">
          <div>
            <h2>All Products</h2>
            <p>
              {loading ? "Loading products..." : `${filteredProducts.length} products found`}
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Sort By: Recommended</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        <div className="product-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  id: product._id,
                }}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
