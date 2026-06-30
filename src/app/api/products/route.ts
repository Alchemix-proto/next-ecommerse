import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";
import { isAdmin } from "@/src/lib/auth";

export const runtime = "nodejs";

type UploadedImage = {
    imageUrl: string;
    publicId: string;
};

function createSlug(name: string) {
    return (
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") +
        "-" +
        Date.now()
    );
}

export async function POST(req: NextRequest) {
      const admin = await isAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin only" },
      { status: 403 }
    );
  }
    const client = await pool.connect()

    try {
        const body = await req.json()

        const {
            name,
            description,
            brand,
            modelNumber,
            sku,
            price,
            salePrice,
            stock,
            categoryId,
            gender,
            strapMaterial,
            dialColor,
            caseSize,
            warranty,
            isFeatured,
            isActive,
            images,
        } = body;

        if (!name || !description || !price) {
            return NextResponse.json(
                { error: "name, describtion and price are required" },
                { status: 400 }
            )
        }

        const uploadedImage: UploadedImage[] = Array.isArray(images) ? images : []
        const mainImage = uploadedImage[0] || null;

        await client.query("BEGIN");

        const productResult = await client.query(
            `INSERT INTO products(name,
        slug,
        description,
        brand,model_number,sku,
        price,sale_price,stock,
        category_id, main_image_url, main_image_public_id,
        gender,  strap_material, dial_color, case_size, warranty, is_featured, is_active)

         values ($1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17,$18, $19)

          RETURNING *
        `,
            [name,
                createSlug(name),
                description,
                brand || null, modelNumber || null, sku || null,
                Number(price), salePrice ? Number(salePrice) : null, stock ? Number(stock) : null,
                categoryId ? Number(categoryId) : null, mainImage?.imageUrl || null, mainImage?.publicId || null,
                gender || null, strapMaterial || null, dialColor || null, caseSize || null,
                warranty || null,
                Boolean(isFeatured),
                isActive === false ? false : true,
            ]
        )

        // save images link
        const product = productResult.rows[0]

        for (const image of uploadedImage) {
            await client.query(
                `
        INSERT INTO product_images (
          product_id,
          image_url,
          cloudinary_public_id
        )
        VALUES ($1, $2, $3)
        `,
                [product.id, image.imageUrl, image.publicId]
            );
        }

        // commit
        await client.query('COMMIT')
        console.log(product)
        return NextResponse.json(
            { ...product },
            { status: 201 }
        )
    }

    catch (error) {
        await client.query('ROLLBACK')
        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "Unknown error on product uploading",
            },
            { status: 400 }
        )
    } finally {
        await client.release()

    }
}
