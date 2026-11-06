
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { products } from "@/lib/products";

export async function POST() {
  try {
    await connectDB();

    // Check whether products already exist
    const count = await Product.countDocuments();

    if (count > 0) {
      return NextResponse.json({
        success: false,
        message: "Products already exist in database",
        totalProducts: count,
      });
    }

    // Remove frontend IDs before inserting
    const productData = products.map(({ id, ...product }) => product);

    // Insert all products into MongoDB
    const result = await Product.insertMany(productData);

    return NextResponse.json({
      success: true,
      message: "Products inserted successfully!",
      totalProducts: result.length,
      products: result,
    });
  } catch (error) {
    console.error("Seed error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to insert products",
      },
      { status: 500 }
    );
  }
}

