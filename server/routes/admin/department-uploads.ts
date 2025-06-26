import { hasRole, isAuthenticated } from "@server/middleware/auth";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper function for async route handlers
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create department-images directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "server",
      "public",
      "uploads",
      "departments",
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

// File filter to allow only image files (including SVG)
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/avif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Set up multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

// Department image upload route
router.post(
  "/",
  isAuthenticated,
  hasRole(["admin"]),
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert the path to a URL format
    const relativePath = path
      .relative(path.join(process.cwd(), "server", "public"), req.file.path)
      .replace(/\\/g, "/");

    // Return the file path
    return res.json({
      url: `/${relativePath}`,
      filename: req.file.filename,
    });
  }),
);

// Delete department image
router.delete(
  "/:filename",
  isAuthenticated,
  hasRole(["admin"]),
  asyncHandler(async (req, res) => {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    const filePath = path.join(
      process.cwd(),
      "server",
      "public",
      "uploads",
      "departments",
      filename,
    );

    try {
      // Check if file exists
      await fs.promises.access(filePath, fs.constants.F_OK);
      // Delete the file
      await fs.promises.unlink(filePath);

      return res.json({ success: true });
    } catch (error) {
      return res.status(404).json({ error: "File not found" });
    }
  }),
);

export default router;
