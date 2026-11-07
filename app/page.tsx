import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { connection } from "next/server";
import { Suspense } from "react";
import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";

async function getProducts() {
  try {
    // Read directly from MongoDB (no HTTP call to localhost, works on any host)
    await connectDB();

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Convert ObjectId / Date values to plain JSON for the components
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Product fetching error:", error);
    return [];
  }
}


async function HomeContent() {
  await connection();
  const products = await getProducts();

  return (
    <div>
      <section className="hero">
        <div>
          <h1>Big Shopping Days!</h1>
          <p>Discover amazing products at amazing prices.</p>

          <Link href="/products" className="hero-btn">
            Shop Now
          </Link>
        </div>

        <div className="hero-offer">
          <span>UP TO</span>
          <strong>50%</strong>
          <span>OFF</span>
        </div>
      </section>

      <section className="categories">
        <h2>Shop By Category</h2>

        <div className="category-list">
          <Link href="/products?category=Electronics">
            <span>📱</span>
            Electronics
          </Link>

          <Link href="/products?category=Fashion">
            <span>👕</span>
            Fashion
          </Link>

          <Link href="/products">
            <span>💻</span>
            Laptops
          </Link>

          <Link href="/products">
            <span>⌚</span>
            Accessories
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Best Deals For You</h2>
          <Link href="/products">View All →</Link>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((product: any) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                id: product._id,
              }}
            />
          ))}
        </div>
      </section>

      <section className="offer-banner">
        <h2>Upgrade Your Lifestyle</h2>
        <p>Best products. Best prices. Best experience.</p>
        <Link href="/products">Explore Products</Link>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Popular Products</h2>
          <Link href="/products">View All →</Link>
        </div>

        <div className="product-grid">
          {products.slice(4, 8).map((product: any) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                id: product._id,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<p>Loading products...</p>}>
      <HomeContent />
    </Suspense>
  );
}