import app from "./app.js";

const PORT = process.env.PORT || 4004;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ai service is running on http://localhost:${PORT}`);
});
