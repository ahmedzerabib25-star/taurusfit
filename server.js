/**
 * Local dev server — replaces `serve .` / serve.json for local routing.
 * Run: node server.js
 * Then open: http://localhost:3000  or  http://<your-ip>:3000
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const PORT = 3000;
const ROOT = __dirname;

// Page routes  →  HTML file (relative to ROOT)
const ROUTES = {
  "/":               "supplements/home/index.html",
  "/products":       "supplements/products/index.html",
  "/product-detail": "supplements/product-detail/index.html",
  "/checkout":       "supplements/checkout/index.html",
  "/mgmt9kx":        "supplements/mgmt9kx/index.html",
  "/panel4rz":       "supplements/panel4rz/index.html",
  "/privacy":        "supplements/privacy/index.html",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".mp4":  "video/mp4",
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + filePath);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Strip query string
  const urlPath = req.url.split("?")[0];

  // 1. Exact page route match
  if (ROUTES[urlPath]) {
    return serveFile(res, path.join(ROOT, ROUTES[urlPath]));
  }

  // 2. Try static file from ROOT
  const staticPath = path.join(ROOT, urlPath);
  if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    return serveFile(res, staticPath);
  }

  // 3. Try index.html inside a directory
  const indexPath = path.join(staticPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return serveFile(res, indexPath);
  }

  // 4. 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  const interfaces = os.networkInterfaces();
  console.log(`\n  Local:   http://localhost:${PORT}`);
  Object.values(interfaces).flat().forEach(iface => {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`  Network: http://${iface.address}:${PORT}`);
    }
  });
  console.log("\n  Routes:");
  Object.entries(ROUTES).forEach(([route, file]) => {
    console.log(`    ${route.padEnd(20)} → ${file}`);
  });
  console.log("\n  Press Ctrl+C to stop.\n");
});
