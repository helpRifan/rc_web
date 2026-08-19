import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import ImageKit from "imagekit";

const ikPublicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.VITE_IMAGEKIT_PUBLIC_KEY;
const ikPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const ikUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.VITE_IMAGEKIT_URL_ENDPOINT;

if (!ikPublicKey || !ikPrivateKey || !ikUrlEndpoint) {
  console.error("❌ ImageKit credentials missing in .env.local!");
  process.exit(1);
}

const imagekit = new ImageKit({
  publicKey: ikPublicKey,
  privateKey: ikPrivateKey,
  urlEndpoint: ikUrlEndpoint
});

console.log("=========================================");
console.log("UPLOADING LOCAL IMAGES TO IMAGEKIT");
console.log(`Endpoint: ${ikUrlEndpoint}`);
console.log("=========================================\n");

const uploadedMap = {};

async function uploadFile(filePath, folder) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  console.log(`⏳ Uploading [${folder}/${fileName}] (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);

  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: false
    });

    console.log(`✅ Uploaded: ${result.name} -> ${result.url}`);
    return result.url;
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message || error);
    return null;
  }
}

async function main() {
  const tasks = [
    // Core Site Assets
    { path: "public/logo.png", folder: "/robotics-club/branding" },
    { path: "public/about-banner.jpg", folder: "/robotics-club/banners" },
    { path: "public/campus.jpg", folder: "/robotics-club/campus" },
    { path: "public/arockia.jpg", folder: "/robotics-club/faculty" },
    { path: "public/fc.jpg", folder: "/robotics-club/faculty" },
    { path: "public/genesis-1.jpg", folder: "/robotics-club/about" },
    { path: "public/genesis-2.jpg", folder: "/robotics-club/about" },
  ];

  // Public Hero Images
  if (fs.existsSync("public/hero")) {
    const heroFiles = fs.readdirSync("public/hero");
    for (const f of heroFiles) {
      if (/\.(jpe?g|png|webp|svg)$/i.test(f)) {
        tasks.push({ path: path.join("public/hero", f), folder: "/robotics-club/hero" });
      }
    }
  }

  // Public Gallery Images
  if (fs.existsSync("public/gallery")) {
    const galleryFiles = fs.readdirSync("public/gallery");
    for (const f of galleryFiles) {
      if (/\.(jpe?g|png|webp|svg)$/i.test(f)) {
        tasks.push({ path: path.join("public/gallery", f), folder: "/robotics-club/gallery" });
      }
    }
  }

  // Web pics folder
  if (fs.existsSync("web pics")) {
    const webPics = fs.readdirSync("web pics");
    for (const f of webPics) {
      if (/\.(jpe?g|png|webp|svg)$/i.test(f)) {
        tasks.push({ path: path.join("web pics", f), folder: "/robotics-club/events-archive" });
      }
    }
  }

  console.log(`Found total ${tasks.length} images to upload.\n`);

  for (const item of tasks) {
    if (fs.existsSync(item.path)) {
      const url = await uploadFile(item.path, item.folder);
      if (url) {
        uploadedMap[item.path.replace(/\\/g, "/")] = url;
      }
      // Small pause to avoid aggressive rate limits
      await new Promise(r => setTimeout(r, 200));
    }
  }

  fs.writeFileSync("imagekit_mapping.json", JSON.stringify(uploadedMap, null, 2));
  console.log("\n=========================================");
  console.log(`🎉 Successfully uploaded ${Object.keys(uploadedMap).length} images to ImageKit!`);
  console.log("Saved mapping to imagekit_mapping.json");
  console.log("=========================================");
}

main().catch(console.error);
