import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
import { getUserId } from "@/app/lib/auth";

// Clean a text value coming from the client
function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

// PLACE ORDER  (cart items + shipping address -> Order collection)
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    await connectDB();

    // 1. Validate the shipping address
    const body = await req.json();
    const address = body?.shippingAddress || {};

    const shippingAddress = {
      fullName: clean(address.fullName),
      phone: clean(address.phone),
      pincode: clean(address.pincode),
      addressLine: clean(address.addressLine),
      city: clean(address.city),
      state: clean(address.state),
      addressType: address.addressType === "Work" ? "Work" : "Home",
    };

    if (
      !shippingAddress.fullName ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state
    ) {
      return NextResponse.json(
        { message: "Please fill in all address fields." },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(shippingAddress.phone)) {
      return NextResponse.json(
        { message: "Enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      return NextResponse.json(
        { message: "Enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    // 2. Load the user's cart (the cart schema field is "productId")
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { message: "Your cart is empty." },
        { status: 400 }
      );
    }

    // 3. Build order items using prices from the database (not from the browser)
    let totalAmount = 0;

    const orderItems = cart.items
      .filter((item: any) => item.productId)
      .map((item: any) => {
        const product = item.productId;

        totalAmount += product.price * item.quantity;

        return {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        };
      });

    if (orderItems.length === 0) {
      return NextResponse.json(
        { message: "Products in your cart are no longer available." },
        { status: 400 }
      );
    }

    // 4. Save order
    const order = await Order.create({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: "Cash on Delivery",
      totalAmount,
      status: "Placed",
    });

    // 5. Empty the cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    return NextResponse.json(
      { success: true, message: "Order placed successfully.", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Place order error:", error);

    return NextResponse.json(
      { message: "Order placement failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET LOGGED-IN USER'S ORDERS
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}