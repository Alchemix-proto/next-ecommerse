import Link from "next/link";
import { Product } from "../types/product";

type props = {
  product: Product
}

export default function ProductCard({ product }: props) {
  const displayPrice = product.sale_price ? product.sale_price : product.price;
  const isDscounted = product.sale_price && product.sale_price !== product.price;

  return (
    <div className="border-[0.1] border-slate-300/80 rounded-lg overflow-hidden shadow-sm">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:invert">
              <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="200" height="200" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#94a3b8" />
                <polyline points="21 15 16 10 5 21" />
                <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2" />
              </svg>

            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        {product.category_name && (
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            {product.category_name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h2 className="font-semibold text-lg hover:underline line-clamp-1">
            {product.name}
          </h2>
        </Link>

        {product.brand && (
          <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <p className="font-bold text-lg">₹{displayPrice}</p>

          {isDscounted && (
            <p className="text-sm text-gray-400 line-through">
              ₹{product.price}
            </p>
          )}
        </div>

        <div className="mt-3">
          {product.stock > 0 ? (
            <p className="text-sm text-green-600">In stock: {product.stock}</p>
          ) : (
            <p className="text-sm text-red-600">Out of stock</p>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="block text-center bg-black text-white py-2 rounded mt-4"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}