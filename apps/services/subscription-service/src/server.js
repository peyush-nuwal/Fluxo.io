import app from "./app.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 4006;

app.listen(PORT, () => {
  logger.info(`Subscription service running at http://localhost:${PORT}`);
});
