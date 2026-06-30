import ProductCard from "@/src/components/productCard";
import pool from "@/src/lib/db";
import { Product } from "@/src/types/product";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getResult() : Promise<Product[]> {
    const result = await pool.query(
        "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true ORDER BY p.created_at DESC"
    );
    return result.rows;
}
function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="border rounded-xl overflow-hidden bg-white animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />

          <div className="p-4 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage() {
    const products = await getResult();

    return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-gray-500">
          Our Collection
        </p>

        <h1 className="text-4xl font-bold mt-2">Watches</h1>

        <p className="text-gray-600 mt-3">
          Explore premium watches from our Calicut watch company.
        </p>
      </div>
<Suspense fallback={<ProductsGridSkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Suspense>
    </main>
  )
}