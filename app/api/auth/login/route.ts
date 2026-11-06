import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { createToken } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    // 1. Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // 2. Find user and include password field
    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Generate JWT token
    const token = createToken(user._id.toString());

    // 5. Return successful response
    return NextResponse.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}