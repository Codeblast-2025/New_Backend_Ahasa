const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: String,
  path: String,
  userId: String, // optional: if tied to a user
  mimeType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Document", documentSchema);
