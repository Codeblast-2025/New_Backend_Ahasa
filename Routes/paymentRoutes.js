const router = require("express").Router();
const ctrl = require("../controllers/paymentController");

router.post("/session", ctrl.createCheckoutSession); // Create MPGS checkout session
router.get("/order/:orderId", ctrl.getOrder); // Retrieve order (local + gateway)
router.all("/return", ctrl.handleReturn); // MPGS returnUrl endpoint
router.get("/checkout/:sessionId", ctrl.renderCheckoutPage); // Tiny HTML to open MPGS page

module.exports = router;
