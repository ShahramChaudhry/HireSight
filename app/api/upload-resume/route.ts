import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const runtime = "nodejs";

// Timeout wrapper for safety
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("File processing timeout")), ms)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  console.log("📥 /api/upload-resume called");

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const jobId = formData.get("jobId") as string;

    if (!file || typeof file === "string") {
      console.error("❌ Invalid file upload:", file);
      return NextResponse.json(
        { success: false, error: "Invalid or missing file" },
        { status: 400 }
      );
    }

    if (!jobId) {
      console.error("❌ Missing jobId in formData");
      return NextResponse.json(
        { success: false, error: "Missing jobId" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await (file as any).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = (file as File).name.toLowerCase();

    console.log("📄 Starting file extraction:", fileName);

    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `${randomUUID()}-${fileName}`);
    await fs.writeFile(tempPath, buffer);

    let resumeText = "";

    if (fileName.endsWith(".pdf")) {
      console.log("📘 Using pdf-extraction for:", fileName);
      const pdf = require("pdf-extraction");
      const data = await withTimeout(pdf(buffer), 20000);
      resumeText = data.text;
    } else if (fileName.endsWith(".docx")) {
      console.log("📗 Using mammoth for:", fileName);
      const mammoth = await import("mammoth");
      const result = await withTimeout(mammoth.extractRawText({ buffer }), 20000);
      resumeText = result.value;
    } else if (fileName.endsWith(".txt")) {
      console.log("📙 Using plain text reader");
      resumeText = buffer.toString("utf-8");
    } else {
      console.error("❌ Unsupported file type:", fileName);
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${fileName}` },
        { status: 400 }
      );
    }

    console.log(`✅ Extraction done: ${resumeText.length} characters extracted`);

    if (!resumeText || resumeText.trim().length < 50) {
      console.warn("⚠️ File has too little readable text");
      return NextResponse.json(
        { success: false, error: "No readable text found in file." },
        { status: 400 }
      );
    }

    // Ensure we use the correct port (default to 3000 for dev)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const analyzeUrl = `${baseUrl}/api/analyze`;

    console.log("➡️ Calling analyzer endpoint:", analyzeUrl);

    const analyzeResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobId }),
    });

    console.log("📨 Analyzer responded with status:", analyzeResponse.status);

    const analyzeData = await analyzeResponse.json().catch((e) => {
      console.error("❌ Failed to parse analyzer JSON:", e);
      throw new Error("Analyzer returned invalid JSON");
    });

    if (!analyzeData.success) {
      console.error("❌ Analyzer failed:", analyzeData.error);
      return NextResponse.json(
        { success: false, error: analyzeData.error || "Failed to analyze resume" },
        { status: 500 }
      );
    }

    console.log("✅ Successfully analyzed resume:", analyzeData.data?.id || "(no ID)");

    return NextResponse.json({ success: true, data: analyzeData.data });
  } catch (error: any) {
    console.error("💥 Upload processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}