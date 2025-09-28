const axios = require("axios");

const { APP_ID, APP_PASSWORD } = process.env;

const getLocation = async (req, res) => {
  const { requesterId, subscriberId, serviceType = "IMMEDIATE" } = req.body;

  if (!requesterId || !subscriberId) {
    return res.status(400).json({
      error: "requesterId and subscriberId are required"
    });
  }

  // Format phone numbers to include tel: prefix if not present
  const formattedRequesterId = requesterId.startsWith("tel:") ? requesterId : `tel:${requesterId}`;
  const formattedSubscriberId = subscriberId.startsWith("tel:") ? subscriberId : `tel:${subscriberId}`;

  const payload = {
    applicationId: APP_ID,
    password: APP_PASSWORD,
    version: "2.0",
    requesterId: formattedRequesterId,
    subscriberId: formattedSubscriberId,
    serviceType: serviceType
  };

  try {
    const response = await axios.post("https://api.mspace.lk/lbs/request", payload, {
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
    });

    res.json({
      status: "success",
      data: response.data
    });
  } catch (error) {
    console.error("Location request failed:", error.message);
    res.status(500).json({
      status: "error",
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = {
  getLocation,
};