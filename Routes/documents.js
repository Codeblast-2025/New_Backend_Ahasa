const express = require("express");
const multer = require("multer");
const path = require("path");
const Document = require("../models/Document");

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST route to upload document
router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const newDoc = new Document({
      userId,
      name: req.file.originalname,    // Store original filename
      path: req.file.filename,        // Stored filename on disk
      mimeType: req.file.mimetype,
    });

    await newDoc.save();

    res.status(200).json({ message: "File uploaded successfully", file: newDoc });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
});

// POST route to fetch documents by userId
router.post("/fetch", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const docs = await Document.find({ userId });

    if (!docs || docs.length === 0) {
      return res.status(200).json([]);
    }

    // Map documents to include full URL
    const docsWithUrl = docs.map((doc) => ({
      id: doc._id,
      name: doc.name,
      url: `${req.protocol}://${req.get("host")}/uploads/${doc.path}`,
      mimeType: doc.mimeType,
    }));

    res.json(docsWithUrl);
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

module.exports = router;
