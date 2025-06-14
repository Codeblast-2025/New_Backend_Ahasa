const mongoose = require("mongoose");

const user1Schema = new mongoose.Schema({
  fullName: String,
  email: String,
  number0: String,
  number1: String,
  number2: String
});

module.exports = mongoose.models.User1 || mongoose.model("User1", user1Schema);
