import app from "./app.js";
import { PORT } from "./config.js";

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
