import sharp from "sharp";

export async function optimiseImage(buffer: Buffer) {
  const transformer = sharp(buffer).rotate();

  const [main, thumbnail] = await Promise.all([
    transformer
      .clone()
      .resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer(),
    transformer
      .clone()
      .resize({ width: 320, height: 320, fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer(),
  ]);

  return { main, thumbnail };
}
