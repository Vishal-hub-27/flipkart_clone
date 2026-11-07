"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save token + user in AuthContext (updates the Navbar instantly)
      login(data.token, data.user);

      router.replace("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left banner */}
        <div className="auth-side">
          <h1>Welcome Back!</h1>
          <p>
            Login to view your cart, track your orders and enjoy a faster
            checkout.
          </p>
          <ul>
            <li>✔ Easy order tracking</li>
            <li>✔ Saved cart across devices</li>
            <li>✔ Exclusive offers</li>
          </ul>
          <div className="auth-side-emoji">🛒</div>
        </div>

        {/* Form */}
        <div className="auth-form-wrap">
          <h2>Login</h2>
          <p className="auth-subtitle">Enter your account details</p>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            New to Flipkart Lite? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}