// Routes/sos.js
const router = require("express").Router();
const { sendSOS, sendSOSTextbelt } = require("../controllers/sosController");
const auth = require("../Middlewares/authMiddleware"); // if you want to protect it

// If you want auth: router.post("/send", auth, sendSOS);
router.post("/send", sendSOS);

// Optional free endpoint
router.post("/send-textbelt", sendSOSTextbelt);

module.exports = router;
