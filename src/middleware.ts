import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

type User = {
    id : string,
    name : string,
    email : string,
    phone : number,
    role : 'admin' | 'customer'
}
type Token ={
     id : number,
    email : string,
    role : 'admin' | 'customer'
}
function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return new TextEncoder().encode(secret);
}

async function getUserFromToken(req: NextRequest): Promise<Token | null> {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    return {
      id: Number(payload.id),
      email: String(payload.email),
      role: payload.role as ('admin'|'customer'),
    };
  } catch {
    return null;
  }
}
export async function middleware(req: NextRequest){
    const {pathname}=req.nextUrl
    const user = await getUserFromToken(req)

     // Already logged-in user cannot open login/register page
  if ((pathname === "/login" || pathname === "/register") && user) {
    const redirectUrl = req.nextUrl.clone();

    redirectUrl.pathname = user.role === "admin" ? "/admin" : "/";
    redirectUrl.searchParams.set("alreadyLoggedIn", "true");

    return NextResponse.redirect(redirectUrl);
  }


    // Already logged-in user cannot login/register again using API
  if (pathname === "/api/auth/login" && req.method !== "DELETE" && user) {
    return NextResponse.json(
      { error: "You are already logged in. Please logout first." },
      { status: 409 }
    );
  }

    // Protect admin pages
  if (pathname.startsWith("/admin") &&(user?.role !== "admin") ) {
      const homeUrl = req.nextUrl.clone();

      homeUrl.pathname = "/";

      return NextResponse.redirect(homeUrl);
  }
  // Protect admin APIs
  const isCreateProductApi =
    pathname === "/api/products" && req.method === "POST";

  const isEditDeleteProductApi =
    pathname.startsWith("/api/products/") &&
    ["PUT", "PATCH", "DELETE"].includes(req.method);

  const isUploadApi = pathname === "/api/upload" && req.method === "POST";

  if (isCreateProductApi || isEditDeleteProductApi || isUploadApi) {
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin only" },
        { status: 403 }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",

    "/api/auth/login",

    "/api/products",
    "/api/products/:path*",
    "/api/upload",
  ],
};