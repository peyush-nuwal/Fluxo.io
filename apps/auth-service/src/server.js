import app from "./app.js";

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`auth service is running on http://localhost:${PORT}`);
});
