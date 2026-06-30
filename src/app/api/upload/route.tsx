import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import cloudinary from "../../../lib/cloudinary";

export const runtime = "nodejs";

type UploadResult = {
  secure_url: string;
  public_id: string;
};

async function uploadToCloudinary(file: Blob | File): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "shopzone/watches" }, (error: any, result: any) => {
        if (error) return reject(error);
        return resolve(result as UploadResult);
      })
      .end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as (File | Blob)[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    const uploadResults = await Promise.all(files.map((file) => uploadToCloudinary(file)));

    return NextResponse.json({
      images: uploadResults.map((r) => ({
        imageUrl: r.secure_url,
        publicId: r.public_id,
      })),
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json({ error: "Error uploading files" }, { status: 500 });
  }
}
