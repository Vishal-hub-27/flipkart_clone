
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
import { getUserId } from "@/app/lib/auth";

// PLACE ORDER
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { message: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Prepare order items
    let totalAmount = 0;

    const orderItems = cart.items.map((item: any) => {
      const product = item.product;

      if (!product) {
        throw new Error("A cart product no longer exists");
      }

      const price = product.price;
      const quantity = item.quantity;

      totalAmount += price * quantity;

      return {
        product: product._id,
        name: product.name,
        price,
        quantity
      };
    });

    // Create order
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: "Placed"
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );

    return NextResponse.json({
      message: "Order placed successfully",
      order
    }, { status: 201 });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Order placement failed" },
      { status: 500 }
    );
  }
}

// GET USER ORDERS
// GET USER ORDERS
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const orders = await Order.find({ userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error("Fetch orders error:", error);

    return NextResponse.json(
      { message: "Unable to fetch orders" },
      { status: 500 }
    );
  }
}