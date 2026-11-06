
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";

type Context = {
  params: Promise<{ id: string }>;
};

// GET SINGLE PRODUCT
export async function GET(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });

  } catch (error) {
    return NextResponse.json(
      { message: "Unable to fetch product" },
      { status: 500 }
    );
  }
}

// UPDATE PRODUCT
export async function PUT(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Product update failed" },
      { status: 500 }
    );
  }
}

// DELETE PRODUCT
export async function DELETE(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Product deletion failed" },
      { status: 500 }
    );
  }
}
