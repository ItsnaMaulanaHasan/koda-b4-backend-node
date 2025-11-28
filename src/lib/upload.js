import crypto from "crypto";
import multer, { diskStorage } from "multer";
import { join } from "node:path";
import { cwd } from "node:process";

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = file.originalname.split(".").pop();
    cb(null, `${randomName}.${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only .jpg, .jpeg, .png allowed!"));
  }
  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});

export default upload;
