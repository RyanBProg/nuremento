import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const metadataRaw = formData.get("metadata");
      const metadata =
        typeof metadataRaw === "string" ? JSON.parse(metadataRaw) : metadataRaw;
      const mediaFiles = formData.getAll("mediaFiles");
      const coverImageFileName = formData.get("coverImageFileName");

      console.log("New memory metadata:", metadata);
      console.log(
        "Uploaded files:",
        mediaFiles.map((entry) => {
          if (entry instanceof File) {
            return {
              name: entry.name,
              size: entry.size,
              type: entry.type,
            };
          }

          return entry;
        })
      );

      console.log("Cover image file name:", coverImageFileName);

      return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    console.log("New memory payload:", body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
