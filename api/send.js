const Pusher = require("pusher");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, sender, clientId } = req.body || {};
  const sanitizedMessage = typeof message === "string" ? message.trim() : "";
  const sanitizedSender = typeof sender === "string" ? sender.trim() : "Client";
  const normalizedClientId = typeof clientId === "string" ? clientId : "";

  if (!sanitizedMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_APP_KEY ||
    !process.env.PUSHER_APP_SECRET ||
    !process.env.PUSHER_APP_CLUSTER
  ) {
    return res.status(500).json({
      error: "Missing Pusher environment variables",
    });
  }

  try {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: process.env.PUSHER_APP_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger("websocket-room", "new-message", {
      message: sanitizedMessage,
      sender: sanitizedSender,
      clientId: normalizedClientId,
      sentAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to publish message",
      details: error.message,
    });
  }
};
