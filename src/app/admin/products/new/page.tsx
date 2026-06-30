'use client'

import { useState } from "react";

type UploadedImage = {
    imageUrl: string;
    publicId: string;
};

type ProductForm = {     name: string;     description: string;     brand: string;     modelNumber: string;     sku: string;     price: string;     salePrice: string;     stock: string;     categoryId: string;     gender: string;     strapMaterial: string;     dialColor: string;     caseSize: string;     warranty: string;     isFeatured: boolean;     isActive: boolean; };

const firstForm : ProductForm = { 
    name: "", description: "", brand: "", modelNumber: "",
    sku: "", price: "", salePrice: "", stock: "", categoryId: "",
    gender: "", strapMaterial: "", dialColor: "",
    caseSize: "", warranty: "", isFeatured: false, isActive: true,
}

export default function AddProduct() {
    const [form, setForm] = useState(firstForm)
    const [files, setFiles] = useState<File[]>([])
    const [isLoading, setLoading] = useState(false)

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) {
    const { name, value, type } = event.target
    setForm((prev) => ({
        ...prev,
        [name]:
            type === "checkbox"
                ? (event.target as HTMLInputElement).checked
                : value,
    }))
}
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formElement = event.currentTarget;

        try {
            // upload images 
            setLoading(true)

            let uploadedImages: UploadedImage[] = []

            if (files.length > 0) {
                const uploadData = new FormData();

                files.forEach((file) => {
                    uploadData.append("file", file);
                });

                // fetch 
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                });

                const result = await uploadRes.json()
                if (!uploadRes.ok) throw new Error(result.error || "Image upload failed")

                uploadedImages = result.images

            }
            // product

            const productRes = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    images: uploadedImages,
                }),
            });

            const productResult = await productRes.json()

            
            if (!productRes.ok) throw new Error(productResult.error || "Image upload failed")

            // finish
            alert('product added')
            setForm(firstForm)
            setFiles([])
            formElement.reset();
        }
        catch (err) {
            console.error(err);

            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Something went wrong on product uploading");
            }
        }

        finally {
            setLoading(false);
        }
    }
        return (
            <main className="max-w-3xl mx-auto px-4 py-10 ">
                
                <h1 className="text-3xl font-bold mb-6">Add New Watch</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-medium mb-1">Watch Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border rounded p-3"
                            placeholder="Example: Titan Premium Black Dial Watch"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border rounded p-3"
                            rows={5}
                            placeholder="Write watch details..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-1">Brand</label>
                            <input
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="Titan, Casio, Fastrack..."
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Model Number</label>
                            <input
                                name="modelNumber"
                                value={form.modelNumber}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="Model number"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">SKU</label>
                            <input
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="Unique product code"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Category name</label>
                            <input
                                name="categoryId"
                                value={form.categoryId}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="Example: 1"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange} 
                                className="w-full border rounded p-3"
                                placeholder="4999"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Sale Price</label>
                            <input
                                type="number"
                                name="salePrice"
                                value={form.salePrice}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="3999"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock} 
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="10"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Gender</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                            >
                                <option value="">Select gender</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="unisex">Unisex</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Strap Material</label>
                            <input
                                name="strapMaterial"
                                value={form.strapMaterial}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="Leather, Stainless Steel..."
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Dial Color</label>
                            <input
                                name="dialColor"
                                value={form.dialColor}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="Black, Blue, White..."
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Case Size</label>
                            <input
                                name="caseSize"
                                value={form.caseSize}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="42mm"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Warranty</label>
                            <input
                                name="warranty"
                                value={form.warranty}
                                onChange={handleChange}
                                className="w-full border rounded p-3"
                                placeholder="1 Year Warranty"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Watch Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                setFiles(Array.from(e.target.files || []));
                            }}
                            className="w-full border rounded p-3"
                        />

                        {files.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                {files.length} image(s) selected
                            </p>
                        )}
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={form.isFeatured}
                                onChange={handleChange}
                            />
                            Featured Product
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                            />
                            Active Product
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-black text-white px-6 py-3 rounded disabled:bg-gray-400"
                    >
                        {isLoading ? "Uploading..." : "Upload Product"}
                    </button>
                </form>
            </main>
        );
    
}