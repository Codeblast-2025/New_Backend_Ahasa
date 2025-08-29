// services/textbeltService.js
const axios = require("axios");
const KEY = process.env.TEXTBELT_KEY || "textbelt"; // free pool (1 SMS/day/IP)

async function sendTextbelt(phone, message) {
  const { data } = await axios.post("https://textbelt.com/text", {
    phone,
    message,
    key: KEY,
  });
  return data; // {success, quotaRemaining, textId, error}
}

module.exports = { sendTextbelt };
