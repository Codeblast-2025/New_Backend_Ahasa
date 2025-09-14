const express = require("express");
const multer = require("multer");
const path = require("path");
const AdminDocument = require("../Models/AdminDocument");

const router = express.Router();

// Multer configuration
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

// Admin uploads a document
router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newDoc = new AdminDocument({
      name: req.file.originalname,
      path: req.file.filename,
      mimeType: req.file.mimetype,
    });

    await newDoc.save();

    res.status(200).json({ message: "File uploaded successfully", file: newDoc });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
});

// All users can fetch all uploaded documents
router.get("/fetch", async (req, res) => {
  try {
    const docs = await AdminDocument.find();

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
