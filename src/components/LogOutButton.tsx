"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


export default function LogoutButton({ redirectTo = "/login" }: {redirectTo:string}) {
  const router = useRouter();   
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      await fetch("/api/auth/login", {
        method: "DELETE",
      });

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 text-white px-5 py-3 rounded disabled:bg-gray-400"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}