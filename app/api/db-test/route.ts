import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "MongoDB Connection Failed",
      },
      { status: 500 }
    );
  }
}