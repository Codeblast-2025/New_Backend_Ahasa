// services/smsService.js
const twilio = require("twilio");

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } =
  process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const toE164 = (raw) => {
  if (!raw) return null;
  let n = raw.replace(/[^\d+]/g, "");
  if (n.startsWith("+")) return n;
  // Assume Sri Lanka if only local format provided
  if (n.startsWith("0")) n = n.substring(1);
  return `+94${n}`;
};

async function sendSMS(to, body) {
  const dest = toE164(to);
  if (!dest) throw new Error("Invalid destination number");
  const msg = await client.messages.create({
    from: TWILIO_FROM_NUMBER,
    to: dest,
    body,
  });
  return msg;
}

module.exports = { sendSMS, toE164 };
