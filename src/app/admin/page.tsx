
import DeleteButton from "@/src/components/DeleteButton";
import pool from "@/src/lib/db";
import { Product } from "@/src/types/product";
import Link from "next/link";

async function getProducts() : Promise<Product[]> {
  const r = await pool.query(
    `SELECT p.id,
      p.name,
      p.slug,
      p.price,
      p.sale_price,
      p.stock,
      p.main_image_url,
      p.is_active,
 c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.updated_at DESC`
  )
 return r.rows;

}
export default async function AdminPage() {
  const products = await getProducts();
 
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1> */}

        <div className="flex items-center"><Link
          href="/admin/products/new"
          className="inline-block bg-black text-white px-5 py-1 my-3 rounded"
        >
          Add New Watch
        </Link></div>
<div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-slate-800 dark:border-slate-300/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                {product.main_image_url ? (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="200" height="200" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#94a3b8" />
                <polyline points="21 15 16 10 5 21" />
                <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2" />
              </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
               <Link
                  href={`/products/${product.slug}`}
                >
                   <h2 className="text-lg font-semibold">{product.name}</h2>

                <p className="text-sm text-gray-500">
                  {product.category_name || "No category"}
                </p>
                </Link>

                <div className="flex gap-3 mt-2 text-sm">
                  <span>Price: ₹{product.price}</span>

                  {product.sale_price && (
                    <span>Sale: ₹{product.sale_price}</span>
                  )}

                  <span>Stock: {product.stock}</span>

                  <span
                    className={
                      product.is_active ? "text-green-600" : "text-red-600"
                    }
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {/* <Link
                  href={`/products/${product.slug}`}
                  className="border px-4 py-2 rounded"
                >
                  View
                </Link> */}

                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </Link>

                <DeleteButton productId={product.id} />
              </div>
            </div>
          ))}
        </div>
       
      </main>
    );
  }