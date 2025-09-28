const axios = require("axios");

const { APP_ID, APP_PASSWORD, APP_HASH } = process.env;
const otpSessions = new Map();

const requestOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  const formattedPhone = phone.startsWith("tel:") ? phone : `tel:${phone}`;
  const payload = {
    applicationId: APP_ID,
    password: APP_PASSWORD,
    subscriberId: formattedPhone,
    applicationHash: APP_HASH,
    applicationMetaData: { client: "WEBAPP", device: "Browser", os: "Web", appCode: "webapp" },
  };

  try {
    const r = await axios.post("https://api.mspace.lk/otp/request", payload, {
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });
    const timestamp = new Date();
    if (r.data.statusCode === "S1000") {
      otpSessions.set(r.data.referenceNo, { phone: formattedPhone, verified: false, timestamp });
    }
    res.json({ status: "success", timestamp, data: r.data });
  } catch (e) {
    console.error("OTP request failed:", e.message);
    res.status(500).json({ status: "error", message: e.message });
  }
};

const verifyOtp = async (req, res) => {
  const { referenceNo, otp } = req.body;
  if (!referenceNo || !otp) return res.status(400).json({ error: "Reference number and OTP are required" });

  const payload = { applicationId: APP_ID, password: APP_PASSWORD, referenceNo, otp };
  try {
    const r = await axios.post("https://api.mspace.lk/otp/verify", payload, {
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });
    if (r.data.statusCode === "S1000") {
      const s = otpSessions.get(referenceNo);
      if (s) { s.verified = true; otpSessions.set(referenceNo, s); }
    }
    res.json({ status: "success", data: r.data });
  } catch (e) {
    console.error("OTP verification failed:", e.message);
    res.status(500).json({ status: "error", message: e.message });
  }
};

const sendSms = async (req, res) => {
  const { phone, message, referenceNo } = req.body;
  if (!phone || !message || !referenceNo) {
    return res.status(400).json({ error: "Phone, message, and reference number are required" });
  }
  const s = otpSessions.get(referenceNo);
  if (!s || !s.verified) return res.status(403).json({ error: "OTP verification required" });

  // Format phone number - ensure it starts with 94 for Sri Lanka (no + sign)
  let formattedPhone = phone.replace(/\s+/g, '').replace(/^\+/, ''); // Remove spaces and + sign
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '94' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('94')) {
    formattedPhone = '94' + formattedPhone;
  }

  const payload = {
    version: "1.0",
    applicationId: APP_ID,
    password: APP_PASSWORD,
    message,
    destinationAddresses: [`tel:${formattedPhone}`],
  };

  try {
    const r = await axios.post("https://api.mspace.lk/sms/send", payload, {
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });
    otpSessions.delete(referenceNo);
    res.json({ status: "success", data: r.data });
  } catch (e) {
    console.error("SMS send failed:", e.message);
    res.status(500).json({ status: "error", message: e.message });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  sendSms,
};