import pool from "@/src/lib/db";
import { Product } from "@/src/types/product";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Image = {
  id: number;
  image_url: string;
  cloudinary_public_id: number;
}

async function getProuct(slug: string): Promise<Product | null> {
  const result = await pool?.query(
    "SELECT p.*, c.name AS catgory FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1 AND p.is_active = true LIMIT 1", [slug])

  return result.rows[0] ?? null;
}

async function getImages(productId: number): Promise<Image[]> {
  const result = await pool.query("SELECT * FROM product_images WHERE product_id = $1 ORDER BY id ASC", [productId]);
  return result.rows;
}
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProuct(slug)

  if (!product) { notFound() }

  const images = await getImages(product.id)

  const isDiscounted = product.sale_price && product.sale_price < product.price;
  const displayPrice = isDiscounted ? product.sale_price : product.price;


  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section>
          <div className="aspect-square bg-gradient-to-r from-pink-400 to-blue-400  rounded-xl overflow-hidden">
            {product.main_image_url ? (
              <img
                src={product.main_image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              // onclick={() => confirm("Are you sure you want to delete this watch?")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="200" height="200" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#94a3b8" />
                <polyline points="21 15 16 10 5 21" />
                <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2" />
              </svg>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square bg-gray-100 rounded overflow-hidden"
                >
                  <img
                    src={image.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
{/* <div className="relative">
  <div className="w-0 h-0 border-l-[100px] border-r-[100px] border-b-[173px] border-l-transparent border-r-transparent  opacity-90"></div>
  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 blur-3xl opacity-40"></div>
</div> */}

        <section>
          {product.category_name && (
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
              {product.category_name}
            </p>
          )}

          <h1 className="text-4xl font-bold">{product.name}</h1>

          {product.brand && (
            <p className="text-gray-600 mt-2">Brand: {product.brand}</p>
          )}

          <div className="flex items-center gap-3 mt-5">
            <p className="text-3xl font-bold">₹{displayPrice}</p>

            {isDiscounted && (
              <p className="text-lg text-gray-400 line-through">
                ₹{product.price}
              </p>
            )}
          </div>

          <div className="mt-4">
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium dark:not-inverted-colors:text-green-600">
                In stock: {product.stock}
              </p>
            ) : (
              <p className="text-red-600 font-medium">Out of stock</p>
            )}
          </div>

          <p className="text-gray-700 mt-6 leading-7">{product.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {product.gender && (
              <div className="  rounded p-3">
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{product.gender}</p>
              </div>
            )}

            {product.strap_material && (
              <div className="  rounded p-3">
                <p className="text-sm text-gray-500">Strap Material</p>
                <p className="font-medium">{product.strap_material}</p>
              </div>
            )}

            {product.dial_color && (
              <div className="  rounded p-3">
                <p className="text-sm text-gray-500">Dial Color</p>
                <p className="font-medium">{product.dial_color}</p>
              </div>
            )}

            {product.case_size && (
              <div className="  rounded p-3">
                <p className="text-sm text-gray-500">Case Size</p>
                <p className="font-medium">{product.case_size}</p>
              </div>
            )}

            {product.warranty && (
              <div className="  rounded p-3">
                <p className="text-sm text-gray-500">Warranty</p>
                <p className="font-medium">{product.warranty}</p>
              </div>
            )}

            {product.sku && (
              <div className="  rounded p-3">
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-medium">{product.sku}</p>
              </div>
            )}
          </div>

          <button
            disabled={product.stock <= 0}
            className="mt-8 w-full bg-black border border-slate-300/20 text-slate-300 py-3 rounded disabled:bg-gray-400"
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>

        </section>
      </div>
    </main>
  )
}
