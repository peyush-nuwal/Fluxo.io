import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

// Initialize Arcjet security with different protection rules
const aj = arcjet({
  key: process.env.ARCJET_KEY || "test-key",
  rules: [
    // 🛡️ Basic protection: Stops common attacks like SQL injection or bad requests.
    shield({ mode: "LIVE" }),

    // 🤖 Bot filter: Blocks bad bots but still allows "good" ones
    // like Google, Bing, or monitoring tools.
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Safe search engines (Google, Bing, etc.)
        "CATEGORY:PREVIEW",
      ],
    }),

    // 🚦 Rate limiting: Prevents someone from sending too many requests too fast.
    // Example: Only 100 requests are allowed per IP every 60 seconds.
    slidingWindow({
      mode: "LIVE",
      interval: 2, // time window in seconds
      max: 5, // max allowed requests in that time
    }),
  ],
});

export default aj;
