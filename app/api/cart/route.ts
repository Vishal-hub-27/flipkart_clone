import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import { verifyToken } from "@/app/lib/auth";

import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";

function getUserId(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    return verifyToken(token).userId;
  } catch {
    return null;
  }
}

// GET: Fetch logged-in user's cart
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    return NextResponse.json({
      success: true,
      cart: cart || { userId, items: [] },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch cart." },
      { status: 500 }
    );
  }
}

// POST: Add product to cart
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectDB();

    const { productId } = await req.json();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: "Valid product ID is required." },
        { status: 400 }
      );
    }

    const productExists = await Product.findById(productId);

    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId,
        quantity: 1,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product added to cart successfully.",
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add To Cart Error:", error);

    return NextResponse.json(
      { message: "Failed to add product to cart." },
      { status: 500 }
    );
  }
}
// PATCH: Update product quantity
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectDB();

    const { productId, quantity } = await req.json();

    // Validate product ID and quantity
    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { message: "Valid product ID and quantity are required." },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart not found." },
        { status: 404 }
      );
    }

    const existingItem = cart.items.find(
      (item: any) => item.productId.toString() === productId
    );

    if (!existingItem) {
      return NextResponse.json(
        { message: "Product not found in cart." },
        { status: 404 }
      );
    }

    // Update quantity
    existingItem.quantity = quantity;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    return NextResponse.json({
      success: true,
      message: "Product quantity updated successfully.",
      cart: updatedCart,
    });

  } catch (error) {
    console.error("Update Cart Error:", error);

    return NextResponse.json(
      { message: "Failed to update product quantity." },
      { status: 500 }
    );
  }
}
// DELETE: Remove product from cart
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: "Valid product ID is required." },
        { status: 400 }
      );
    }

    // Remove product ID from cart items array
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      {
        $pull: {
          items: {
            productId: new mongoose.Types.ObjectId(productId),
          },
        },
      },
      { new: true }
    ).populate("items.productId");

    if (!updatedCart) {
      return NextResponse.json(
        { message: "Cart not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from cart successfully.",
      cart: updatedCart,
    });

  } catch (error) {
    console.error("Remove Cart Error:", error);

    return NextResponse.json(
      { message: "Failed to remove product from cart." },
      { status: 500 }
    );
  }
}