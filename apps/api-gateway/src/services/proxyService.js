import httpProxy from "express-http-proxy";

export const createProxy = (serviceUrl) => {
  return httpProxy(serviceUrl, {
    proxyErrorHandler: (err, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Service unavailable");
    },
  });
};
