import Link from "next/link";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import LogOutButton from "./LogOutButton";
import { AuthUser } from "../types/product";
import pool from "../lib/db";



function getSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

async function getNavbarUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const secretKey = getSecretKey();

    if (!secretKey) {
      return null;
    }

    const { payload } = await jwtVerify(token, secretKey);

    const userId = Number(payload.id);

    if (!userId) {
      return null;
    }

    const result = await pool.query(
      `
      SELECT id, name, email, phone, role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] || null;
  } catch {
    return null;
  }
}

export default async function Navbar() {
  const user = await getNavbarUser();

  return (
    <header className="border-b border-slate-600 dark:border-slate-300/20">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center divide-x divide-slate-300/20">
          <Link href="/" className="text-2xl font-bold pr-6">
            Calicut Watches
          </Link>

          <div className="flex items-center gap-4 pl-6">
            <Link href="/products" className="hover:text-gray-600">
              Watches
            </Link>

            <Link href="/cart" className="hover:text-gray-600">
              Cart
            </Link>

            {user?.role === "admin" && (
              <Link href="/admin" className="hover:text-gray-600">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <details className="relative">
                <summary className="list-none cursor-pointer flex items-center gap-3 rounded-full border px-3 py-2 hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-semibold uppercase">
                    {user.name.charAt(0)}
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {user.role}
                    </p>
                  </div>
                </summary>

                <div className="absolute right-0 mt-3 w-64 rounded-xl border bg-white shadow-lg p-4 z-50">
                  <div className="mb-4">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500 break-all">
                      {user.email}
                    </p>

                    {user.phone && (
                      <p className="text-sm text-gray-500 mt-1">
                        {user.phone}
                      </p>
                    )}

                    <span className="inline-block mt-2 text-xs capitalize bg-gray-100 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="block text-sm border rounded px-3 py-2 hover:bg-gray-50"
                    >
                      My Profile
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block text-sm border rounded px-3 py-2 hover:bg-gray-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <LogOutButton redirectTo="/login" />
                  </div>
                </div>
              </details>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hover:text-gray-600">
                Login
              </Link>

              <Link
                href="/register"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}