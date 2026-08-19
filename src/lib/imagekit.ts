/**
 * ImageKit Client Helper
 * Handles media URL generation, real-time transformations, and direct browser uploads.
 */

const urlEndpoint = (typeof import.meta !== "undefined" && import.meta.env?.VITE_IMAGEKIT_URL_ENDPOINT) || "";
const publicKey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_IMAGEKIT_PUBLIC_KEY) || "";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "jpg" | "png";
  blur?: number;
  crop?: "maintain_ratio" | "force" | "at_least" | "at_max";
}

// Local path to ImageKit CDN path mapping
const LOCAL_TO_IMAGEKIT_PATH_MAP: Record<string, string> = {
  "/logo.png": "/robotics-club/branding/logo.png",
  "/about-banner.jpg": "/robotics-club/banners/about-banner.jpg",
  "/campus.jpg": "/robotics-club/campus/campus.jpg",
  "/arockia.jpg": "/robotics-club/faculty/arockia.jpg",
  "/fc.jpg": "/robotics-club/faculty/fc.jpg",
  "/genesis-1.jpg": "/robotics-club/about/genesis-1.jpg",
  "/genesis-2.jpg": "/robotics-club/about/genesis-2.jpg",
};

/**
 * Optimizes an ImageKit or local/external image URL with real-time responsive transformations
 */
export function getOptimizedImageUrl(src: string, options: ImageTransformOptions = {}): string {
  if (!src) return "";

  let targetUrl = src;

  // If using ImageKit endpoint and src is a local path
  if (urlEndpoint) {
    if (LOCAL_TO_IMAGEKIT_PATH_MAP[src]) {
      targetUrl = `${urlEndpoint.replace(/\/$/, "")}${LOCAL_TO_IMAGEKIT_PATH_MAP[src]}`;
    } else if (src.startsWith("/hero/")) {
      targetUrl = `${urlEndpoint.replace(/\/$/, "")}/robotics-club/hero/${src.replace("/hero/", "")}`;
    } else if (src.startsWith("/gallery/")) {
      targetUrl = `${urlEndpoint.replace(/\/$/, "")}/robotics-club/gallery/${src.replace("/gallery/", "")}`;
    }
  }

  if (!urlEndpoint || !targetUrl.includes("ik.imagekit.io")) {
    return targetUrl; // Fallback to raw local/external URL if ImageKit is not active
  }

  const transforms: string[] = [];
  if (options.width) transforms.push(`w-${options.width}`);
  if (options.height) transforms.push(`h-${options.height}`);
  if (options.quality) transforms.push(`q-${options.quality}`);
  if (options.format) transforms.push(`f-${options.format}`);
  if (options.blur) transforms.push(`bl-${options.blur}`);
  if (options.crop) transforms.push(`c-${options.crop}`);

  const transformString = transforms.length > 0 ? `tr:${transforms.join(",")}` : "";
  if (!transformString) return targetUrl;

  const parts = targetUrl.split(urlEndpoint);
  if (parts.length === 2) {
    const cleanPath = parts[1].replace(/^\//, "");
    return `${urlEndpoint.replace(/\/$/, "")}/${transformString}/${cleanPath}`;
  }

  return `${targetUrl}?tr=${transforms.join(",")}`;
}

/**
 * Direct client-side file upload to ImageKit via backend auth signature
 */
export async function uploadToImageKit(file: File, folder: string = "/robotics-club") {
  if (!publicKey || !urlEndpoint) {
    throw new Error("ImageKit keys missing in environment configuration.");
  }

  // 1. Fetch authentication signature from backend
  const authRes = await fetch("/api/imagekit/auth");
  if (!authRes.ok) {
    const errData = await authRes.json();
    throw new Error(errData.error || "Failed to obtain ImageKit upload credentials.");
  }
  const { token, expire, signature } = await authRes.json();

  // 2. Upload file directly to ImageKit API
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("expire", expire.toString());
  formData.append("token", token);
  formData.append("folder", folder);

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData
  });

  if (!uploadRes.ok) {
    const errorJson = await uploadRes.json();
    throw new Error(errorJson.message || "Failed to upload image to ImageKit.");
  }

  return await uploadRes.json();
}
