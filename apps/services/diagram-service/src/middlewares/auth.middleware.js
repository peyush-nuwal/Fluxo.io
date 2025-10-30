export const extractUser = (req, res, next) => {
  // Extract user info from headers forwarded by API Gateway
  // The gateway verifies the JWT and forwards user info as trusted headers
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];

  if (userId) {
    req.user = {
      id: userId,
      email: userEmail,
    };
  }

  next();
};
