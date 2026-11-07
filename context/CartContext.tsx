"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  total: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  cartLoaded: boolean;
  loginPromptOpen: boolean;
  closeLoginPrompt: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const router = useRouter();
  const { token: authToken, loading: authLoading, logout } = useAuth();

  const clearCart = () => {
    setCart([]);
  };

  // Get token from localStorage
  function getToken() {
    return localStorage.getItem("token");
  }

  // Fetch logged-in user's cart
  async function refreshCart() {
    const token = getToken();

    if (!token) {
      setCart([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        // Token expired / invalid -> log the user out completely
        setCart([]);
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      const items = data.cart?.items || [];

      const formattedCart = items
        .filter((item: any) => item.productId)
        .map((item: any) => ({
          id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          quantity: item.quantity,
        }));

      setCart(formattedCart);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
      setCartLoaded(true);
    }
  }

  // Load cart on start, and whenever the user logs in or out
  useEffect(() => {
    if (authLoading) return;

    if (!authToken) {
      setCart([]);
      setCartLoaded(true);
      return;
    }

    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, authLoading]);

  // Add product to cart
  async function addToCart(product: any) {
    const token = getToken();

    // Not logged in -> show the "please login" popup
    if (!token) {
      setLoginPromptOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id || product.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setCart([]);
          logout();
          router.push("/login");
        }

        throw new Error(data.message || "Unable to add product");
      }

      await refreshCart();

      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  // Remove product from cart
  async function removeFromCart(id: string) {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/cart?productId=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove product");
      }

      await refreshCart();
    } catch (error) {
      console.error("Remove cart error:", error);
    }
  }

  // Update product quantity
  async function updateQuantity(id: string, quantity: number) {
    const token = getToken();

    if (!token || quantity < 1) return;

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update quantity");
      }

      await refreshCart();
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  }

  // Calculate total price
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        total,
        loading,
        refreshCart,
        clearCart,
        cartLoaded,
        loginPromptOpen,
        closeLoginPrompt: () => setLoginPromptOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}