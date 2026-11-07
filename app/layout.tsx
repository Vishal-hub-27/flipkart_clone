import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginPromptModal from "@/components/LoginPromptModal";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Flipkart Lite",
  description: "Simple e-commerce shopping website"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <LoginPromptModal />
        </CartProvider>
      </AuthProvider>
      </body>
    </html>
  );
}