
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";

// GET ALL PRODUCTS
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const search = req.nextUrl.searchParams.get("search");
    const category = req.nextUrl.searchParams.get("category");

    const filter: any = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({
      createdAt: -1
    });

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Unable to fetch products" },
      { status: 500 }
    );
  }
}

// ADD NEW PRODUCT
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      name,
      category,
      price,
      oldPrice,
      image,
      description
    } = body;

    if (!name || !category || price == null || !image) {
      return NextResponse.json(
        { message: "Required product fields are missing" },
        { status: 400 }
      );
    }

    if (Number(price) < 0) {
      return NextResponse.json(
        { message: "Price cannot be negative" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      oldPrice: Number(oldPrice || 0),
      image,
      description
    });

    return NextResponse.json({
      message: "Product added successfully",
      product
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { message: "Product creation failed" },
      { status: 500 }
    );
  }
}
