import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { auth } from "@/lib/auth";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucketName = process.env.AWS_S3_BUCKET!;
    const fileId = uuidv4();
    const key = `uploads/${session.user.id}/${fileId}-${file.name}`;

    // S3'e dosya yükle
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });
    await s3.send(command);

    // Dosya metadata'sını Neon'a kaydet
    await db.insert(uploadedFiles).values({
      id: fileId,
      userId: session.user.id,
      filePath: key,
      fileName: file.name,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Dosya başarıyla yüklendi ve kaydedildi.",
      uploadedFile: {
        id: fileId,
        fileName: file.name,
        filePath: key,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Yükleme sırasında hata oluştu." }, { status: 500 });
  }
}
