// controllers/sosController.js
const User = require("../Models/User"); // check path/case on Linux
const { sendSMS, toE164 } = require("../services/smsService");
const { sendTextbelt } = require("../services/textbeltService"); // optional

function buildSOSMessage(user) {
  const name = user?.fullName || "Unknown";
  const country = user?.country || "Unknown";
  const location = user?.location || "Unknown";

  return (
    `🚨 SOS — Critical emergency.\n\n` +
    `🔹 English:\n` +
    `This person is in a critical emergency.\n` +
    `Name: ${name}\n` +
    `Country: ${country}\n` +
    `Location: ${location}\n\n`
  );
}

/** ✅ Only number0 + alsoSendTo (ignore number1 and number2) */
function pickRecipients(user, alsoSendTo = []) {
  const all = [user.number0, ...alsoSendTo].filter(Boolean);
  const normalized = all.map(toE164).filter(Boolean);
  return Array.from(new Set(normalized)); // de-dupe
}

// POST /api/sos/send
// body: { userId: string, message?: string, alsoSendTo?: string[] }
exports.sendSOS = async (req, res) => {
  try {
    const { userId, message, alsoSendTo } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const recipients = pickRecipients(user, alsoSendTo);
    if (recipients.length === 0) {
      return res.status(400).json({ error: "No valid phone numbers" });
    }

    const body = (message && message.trim()) || buildSOSMessage(user);

    const results = await Promise.allSettled(
      recipients.map((to) => sendSMS(to, body))
    );

    const sent = [];
    const failed = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        sent.push({ to: recipients[i], sid: r.value?.sid || true });
      } else {
        failed.push({
          to: recipients[i],
          error: String(r.reason?.message || r.reason || "Unknown error"),
        });
      }
    });

    return res.json({
      success: failed.length === 0,
      sentCount: sent.length,
      sent,
      failedCount: failed.length,
      failed,
    });
  } catch (err) {
    console.error("sendSOS error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// (Optional) /api/sos/send-textbelt remains unchanged
exports.sendSOSTextbelt = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required" });
    const data = await sendTextbelt(phone, message || "Test SOS");
    return res.json(data);
  } catch (err) {
    console.error("sendSOSTextbelt error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
