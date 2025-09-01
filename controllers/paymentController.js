const mpgs = require("../utils/mpgsClient");
const Order = require("../Models/Order");

exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      currency = "LKR",
      description = "Order",
    } = req.body;
    if (!orderId || !amount)
      return res.status(400).json({ error: "orderId and amount are required" });

    const existing = await Order.findOne({ orderId });
    if (existing)
      return res.status(409).json({ error: "orderId already exists" });

    const order = await Order.create({
      orderId,
      amount,
      currency,
      description,
      status: "PENDING",
    });

    const payload = {
      apiOperation: "INITIATE_CHECKOUT",
      interaction: {
        merchant: {
          name:
            process.env.MERCHANT_DISPLAY_NAME || process.env.MPGS_MERCHANT_ID,
        },
        operation: "PURCHASE",
        displayControl: {
          billingAddress: "HIDE",
          customerEmail: "HIDE",
          shipping: "HIDE",
        },
        returnUrl: process.env.RETURN_URL,
      },
      order: {
        id: orderId,
        currency,
        description,
        amount: amount.toFixed(2),
      },
    };

    const { data } = await mpgs.post("/session", payload); // Create Checkout Session (Hosted Checkout)
    // data will include session.id and successIndicator (returned when creating the session)
    const sessionId = data?.session?.id;
    const successIndicator = data?.successIndicator;

    if (!sessionId || !successIndicator) {
      return res.status(502).json({
        error: "MPGS did not return session or successIndicator",
        raw: data,
      });
    }

    order.sessionId = sessionId;
    order.successIndicator = successIndicator;
    await order.save();

    res.json({
      result: "OK",
      orderId,
      sessionId,
      successIndicator,
    });
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: err?.response?.data || String(err),
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const local = await Order.findOne({ orderId });
    if (!local) return res.status(404).json({ error: "Order not found" });

    // (Optional) Verify with Retrieve Order API
    const { data } = await mpgs.get(`/order/${encodeURIComponent(orderId)}`); // Retrieve Order
    res.json({ local, gateway: data });
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({
      error: "Failed to retrieve order",
      details: err?.response?.data || String(err),
    });
  }
};

exports.handleReturn = async (req, res) => {
  try {
    // MPGS appends ?resultIndicator=... to returnUrl after payment
    const { resultIndicator, orderId } = { ...req.query, ...req.body };

    if (!resultIndicator)
      return res.status(400).send("Missing resultIndicator");

    // If you can pass orderId through returnUrl, match it. Otherwise, look up by session if you logged it.
    let order = null;
    if (orderId) {
      order = await Order.findOne({ orderId });
    } else {
      // fallback: you may parse Referer or keep a one-to-one mapping of sessions to orders during create
      // Here we simply cannot resolve without orderId; adapt as needed
    }

    if (!order) {
      return res
        .status(200)
        .send(
          `<html><body><h3>Return received</h3><p>We couldn't map order automatically. Please check your app.</p></body></html>`
        );
    }

    order.resultIndicator = resultIndicator;
    order.status =
      resultIndicator === order.successIndicator ? "SUCCESS" : "FAILED";
    await order.save();

    // Show a minimal HTML that the React Native WebView can intercept/close
    return res.status(200).send(
      `<html><body>
          <script>
            (function(){
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ orderId: "${order.orderId}", status: "${order.status}" }));
              }
            })();
          </script>
          <h3>Payment ${order.status}</h3>
          <p>You may close this window.</p>
        </body></html>`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing return");
  }
};

// Optional endpoint to serve a tiny HTML that loads checkout.js and opens the payment page
exports.renderCheckoutPage = async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).send("Missing sessionId");

  const RETURN_URL = process.env.RETURN_URL;
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="${process.env.MPGS_BASE}/static/checkout/checkout.min.js"
  data-error="onError" data-cancel="onCancel"></script>
<script>
  function onError(e){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', e})); } }
  function onCancel(){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify({type:'cancel'})); } }

  Checkout.configure({
    session: { id: '${sessionId}' },
    interaction: { returnUrl: '${RETURN_URL}' }
  });

  // Open immediately
  window.onload = function(){ Checkout.showPaymentPage(); }
</script>
<style>html,body{height:100%;margin:0}</style>
</head><body></body></html>`);
};
