// controllers/sosController.js
const User = require("../Models/User"); // adjust path/case to your model
const { sendSMS, toE164 } = require("../services/smsService");
const { sendTextbelt } = require("../services/textbeltService"); // optional

// POST /api/sos/send
// body: { userId: string, message?: string, alsoSendTo?: string[] }
exports.sendSOS = async (req, res) => {
  try {
    const { userId, message, alsoSendTo } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const candidates = [
      user.number0,
      user.number1,
      user.number2,
      ...(alsoSendTo || []),
    ].filter(Boolean);

    const recipients = [user.number0, user.number1, user.number2]
      .map(toE164)
      .filter(Boolean);

    if (recipients.length === 0)
      return res.status(400).json({ error: "No valid phone numbers" });

    const body =
      (message && message.trim()) ||
      `🚨 SOS from ${user.fullName || "unknown"} — ${
        user.location || ""
      }`.trim();

    const results = await Promise.allSettled(
      recipients.map((to) => sendSMS(to, body))
    );

    const sent = [];
    const failed = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        sent.push({ to: recipients[i], sid: r.value.sid });
      } else {
        failed.push({
          to: recipients[i],
          error: String(r.reason?.message || r.reason),
        });
      }
    });

    return res.json({
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

// POST /api/sos/send-textbelt (totally free, for quick tests)
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
