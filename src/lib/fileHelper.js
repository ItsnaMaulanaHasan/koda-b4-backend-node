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

export function getProductFilePath(url) {
  const filename = extractFilenameFromUrl(url);
  return path.join(process.cwd(), "uploads", "products", filename);
}

export function getUserFilePath(url) {
  const filename = extractFilenameFromUrl(url);
  return path.join(process.cwd(), "uploads", "profiles", filename);
}

export function deleteFileIfExists(filePath) {
  try {
    if (!filePath) {
      return false;
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Failed to delete file:", filePath, err);
    return false;
  }
}
