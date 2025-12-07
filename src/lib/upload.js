import crypto from "crypto";
import multer, { diskStorage } from "multer";
import path from "node:path";
import process from "node:process";

const storage = diskStorage({
  destination: function (req, file, cb) {
    const folder =
      file.fieldname === "fileImages" ? "uploads/products" : "uploads/profiles";
    cb(null, path.join(process.cwd(), folder));
  },
  filename: function (req, file, cb) {
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = file.originalname.split(".").pop();
    cb(null, `${randomName}.${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type. Only JPEG, JPG, and PNG images are allowed. Received: ${file.mimetype}`
      ),
      false
    );
  }

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(
        `Invalid file extension. Only .jpg, .jpeg, and .png files are allowed. Received: ${ext}`
      ),
      false
    );
  }

  const mimeExtensionMap = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/jpg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  };

  const validExtensionsForMime = mimeExtensionMap[file.mimetype] || [];
  if (!validExtensionsForMime.includes(ext)) {
    return cb(
      new Error(
        `File extension ${ext} does not match MIME type ${file.mimetype}`
      ),
      false
    );
  }

  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024,
    files: 4,
  },
});

export default upload;
