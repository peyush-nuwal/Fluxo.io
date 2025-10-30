import app from "./app.js";

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`diagram service is running on http://localhost:${PORT}`);
});
