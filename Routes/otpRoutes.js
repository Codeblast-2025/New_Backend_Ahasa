const express = require("express");
const { requestOtp, verifyOtp, sendSms } = require("../controllers/otpController");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/send-sms", sendSms);

module.exports = router;