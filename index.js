// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

/* ---------- Middleware ---------- */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

/* ---------- Routes (normalize casing!) ---------- */
// Make sure your filesystem actually uses `routes` (all-lowercase) or `Routes` consistently.
// I recommend renaming the folder to `routes` and importing all from there.

const authRoutes = require("./routes/authRoutes");
const sosRoutes = require("./routes/sos");
const sos1Routes = require("./routes/sos1");
const updatedUserRoutes = require("./routes/auth");
const communityRoutes = require("./routes/community");
const locationRoutes = require("./routes/location");
const profileRoutes = require("./routes/profilePic");
const documentRoutes = require("./routes/documents");
const adminDocumentsRouter = require("./routes/adminDocuments");
const paymentRoutes = require("./routes/paymentRoutes");

/* ---------- Static ---------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // mount once

/* ---------- Mount once per base path ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/auth", updatedUserRoutes); // if this overlaps with authRoutes, consider merging them
app.use("/api/auth", profileRoutes); // profile under /api/auth (ok if intentional)

app.use("/api/sos", sosRoutes);
app.use("/api/sos", sos1Routes); // if this is an alternative, consider combining to avoid route collisions

app.use("/api/community", communityRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin-documents", adminDocumentsRouter);
app.use("/api/payments", paymentRoutes);

/* ---------- Health ---------- */
app.get("/health", (_req, res) => res.status(200).send("ok"));

/* ---------- DB Connect & Start ---------- */
const PORT = process.env.PORT || 5000;
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
