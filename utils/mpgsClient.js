const axios = require("axios");
const {
  MPGS_BASE,
  MPGS_VERSION,
  MPGS_MERCHANT_ID,
  MPGS_API_USERNAME,
  MPGS_API_PASSWORD,
} = process.env;

const mpgs = axios.create({
  baseURL: `${MPGS_BASE}/api/rest/version/${MPGS_VERSION}/merchant/${MPGS_MERCHANT_ID}`,
  headers: { "Content-Type": "application/json" },
  auth: { username: MPGS_API_USERNAME, password: MPGS_API_PASSWORD }, // Basic Auth
});

module.exports = mpgs;
