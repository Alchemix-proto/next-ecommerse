'use client'
import { useRouter } from "next/navigation";
import { useState, } from "react";


export default function DeleteButton({ productId }: { productId: number }) {
    const router = useRouter();
    const [loading,setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this watch?")) {
            return;
        }

        try{
            setLoading(true)
            const response = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) { 
                alert(data.error || "Failed to delete the product.");
                // setLoading(false)
                return;
            }
            alert("Watch deleted successfully");
      router.refresh()
        }
        catch (error) {
            console.error("Error deleting product:", error);
            alert("An error occurred while deleting the product.");
        }
        finally {
            setLoading(false)
        }
}
return (
    <button
        onClick={handleDelete}
        className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        disabled={loading}
    >
        {loading ? "Deleting..." : "Delete"}
    </button>
);  
}