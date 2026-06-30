import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <section className="text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">
          Premium Watches from Calicut
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Perfect Watch
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Explore stylish, luxury, sports, smart, men&apos;s and women&apos;s
          watches from our Calicut-based watch company.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/products"
            className="bg-black text-white px-6 py-3 rounded"
          >
            View Watches
          </Link>

          <Link
            href="/admin/products/new"
            className="border border-black px-6 py-3 rounded"
          >
            Add Watch
          </Link>
        </div>
      </section>
    </main>
  );
}