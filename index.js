// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const { PORT = 5000 } = process.env;

/* ---------- Middleware ---------- */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

/* ---------- Routes (normalize casing!) ---------- */
// Make sure your filesystem actually uses `routes` (all-lowercase) or `Routes` consistently.
// I recommend renaming the folder to `routes` and importing all from there.

const authRoutes = require("./Routes/authRoutes");
const updatedUserRoutes = require("./Routes/auth");
const communityRoutes = require("./Routes/community");
const locationRoutes = require("./Routes/location");
const profileRoutes = require("./Routes/profilePic");
const documentRoutes = require("./Routes/documents");
const adminDocumentsRouter = require("./Routes/adminDocuments");
const otpRoutes = require("./Routes/otpRoutes");
const lbsRoutes = require("./Routes/lbsRoutes");

/* ---------- Static ---------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // mount once

/* ---------- Mount once per base path ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/auth", updatedUserRoutes); // if this overlaps with authRoutes, consider merging them
app.use("/api/auth", profileRoutes); // profile under /api/auth (ok if intentional)

app.get("/", (req, res) => {
  res.send("About routes 🎉 ");
});

app.use("/api/community", communityRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin-documents", adminDocumentsRouter);
app.use("/api/otp", otpRoutes);
app.use("/api/lbs", lbsRoutes);

/* ---------- Health ---------- */
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/health1", (_req, res) => res.status(200).send("ok1"));

/* ---------- DB Connect & Start ---------- */
//const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // prefer SRV: mongodb+srv://user:pass@cluster0.../dbname?retryWrites=true&w=majority

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment");
  process.exit(1);
}

(async () => {
  try {
    // Modern Mongoose: no useNewUrlParser/useUnifiedTopology
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas blocked / DNS issue
    });
    console.log("✅ MongoDB connected");

    app.listen(PORT, () =>
      console.log(`🚀 Server listening on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB connect error:", err?.message || err);
    process.exit(1);
  }
})();

/* ---------- Optional: better crash logs ---------- */
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
