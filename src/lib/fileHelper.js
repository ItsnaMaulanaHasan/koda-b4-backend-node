import fs from "fs";
import path from "node:path";
import process from "node:process";

export function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return path.basename(urlObj.pathname);
  } catch (err) {
    console.error(err);
    return path.basename(url);
  }
}

export function getFilePathFromUrl(url, folder = "products") {
  const filename = extractFilenameFromUrl(url);
  return path.join(process.cwd(), "uploads", folder, filename);
}

export function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  } else {
    return false;
  }
}
