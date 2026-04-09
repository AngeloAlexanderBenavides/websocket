module.exports = (req, res) => {
  const appKey = process.env.PUSHER_APP_KEY;
  const cluster = process.env.PUSHER_APP_CLUSTER;

  if (!appKey || !cluster) {
    return res.status(500).json({
      error: "Missing PUSHER_APP_KEY or PUSHER_APP_CLUSTER environment variables",
    });
  }

  return res.status(200).json({
    appKey,
    cluster,
    channelName: "websocket-room",
    eventName: "new-message",
  });
};
