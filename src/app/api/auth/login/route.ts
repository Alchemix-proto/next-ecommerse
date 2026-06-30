
import pool from "@/src/lib/db"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server"
import { log } from "node:console";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return new TextEncoder().encode(secret);
}

async function createAuthToken(user: {
  id: number;
  email: string;
  role: "admin" | "customer";
}) {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, phone } = await req.json();

        if (!name || !email || !password || !phone) {
            return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        if (password.length < 6) {
            return new NextResponse(JSON.stringify({ error: "Password must be at least 6 characters long" }), { status: 400 });
        }

        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return new NextResponse(JSON.stringify({ error: "Email already exists" }), { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone",
            [name, email, hashedPassword, phone]
        );

        const token = await createAuthToken({ id: result.rows[0].id, email: result.rows[0].email, role: 'customer' });
        const response = NextResponse.json({ message: "User registered successfully", user: result.rows[0] });
        response.cookies.set("auth_token", token, { httpOnly: true, path: "/", secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}



export const PUT = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
        }
        const result = await pool.query("SELECT id, name, email, phone, password, role FROM users WHERE email = $1", [email])
        const user = result.rows[0] ?? null
        if (!user ) {
            return new NextResponse(JSON.stringify({ error: "Invalid email" }), { status: 401 })
        }
        const isPasswordValid = await bcrypt.compare(password, user?.password) 
        if (!isPasswordValid) {
            return new NextResponse(JSON.stringify({ error: "Invalid password" }), { status: 401 })
        }
        const token = await createAuthToken({ id: user.id, email: user.email, role: user.role })
        const response = NextResponse.json({ message: "User logged in successfully", user: { email: user.email, role: user.role } })
        response.cookies.set("auth_token", token, { httpOnly: true, path: "/", secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 24 * 7 })
        return response
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
export const DELETE = () => {
    const response = NextResponse.json({ message: "User logged out successfully" });
    response.cookies.delete("auth_token");
    return response;
}