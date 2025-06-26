import { hasRole, isAuthenticated } from "@server/middleware/auth";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper function for async route handlers (since we don't have a centralized one)
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

// Simple error class for not found resources
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create year/month based directories
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const uploadDir = path.join(
      process.cwd(),
      "server",
      "public",
      "uploads",
      "articles",
      `${year}`,
      `${month}`,
    );

    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename while preserving extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  },
});

// File filter to only allow certain image types
const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept only images
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Only .png, .jpg, .gif and .webp files are allowed"));
  }
};

// Set up the multer middleware with size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Route to handle image uploads
router.post(
  "/image",
  isAuthenticated,
  hasRole(["editor", "admin"]),
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new NotFoundError("No file uploaded or invalid file type");
    }

    // Generate the URL path for the uploaded file
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Create a URL that's accessible from the client
    const filePath = `/uploads/articles/${year}/${month}/${req.file.filename}`;

    res.status(201).json({
      success: true,
      url: filePath,
      filename: req.file.filename,
      size: req.file.size,
    });
  }),
);

export default router;
