import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <h3>Flipkart Lite</h3>
        <p>Your one-stop shopping destination.</p>
      </div>

      <div>
        <h4>Quick Links</h4>
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
      </div>

      <p className="copyright">
        © 2026 Flipkart Lite. Educational clone project.
      </p>
    </footer>
  );
}