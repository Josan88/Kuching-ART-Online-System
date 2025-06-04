// ──────────────────────────────────────────────────────────────────────────────
// File: server.js (at project root)
// ──────────────────────────────────────────────────────────────────────────────

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "querystring";

// __dirname emulation in ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT = 3000;

// Helper: determine Content-Type based on file extension
const mimeTypes = {
  ".html": "text/html",
  ".js":   "text/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

// Serve a static file given its absolute filesystem path
function serveStaticFile(res, absolutePath) {
  fs.readFile(absolutePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      }
      return;
    }
    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// In-memory “database” for demonstration
let ticketCounter  = 1000;
let paymentCounter = 5000;

// A simple list of routes for GET /api/routes
const routesList = [
  {
    routeID:           1,
    routeName:         "Kuching→Samarahan",
    startLocation:     "Kuching",
    endLocation:       "Samarahan",
    distance:          30,
    estimatedDuration: 45,
    isActive:          true,
    createdDate:       new Date().toISOString(),
    lastUpdated:       new Date().toISOString(),
  },
  {
    routeID:           2,
    routeName:         "Kuching→Kuantan",
    startLocation:     "Kuching",
    endLocation:       "Kuantan",
    distance:          330,
    estimatedDuration: 240,
    isActive:          true,
    createdDate:       new Date().toISOString(),
    lastUpdated:       new Date().toISOString(),
  },
  // …add more routes as needed…
];

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname  = parsedUrl.pathname;

  // 1) Redirect “/” → booking.html
  if (pathname === "/") {
    res.writeHead(302, { Location: "/Kuching-ART-Online-System/index.html" });
    return res.end();
  }

  // 2) GET /api/routes → return JSON array of routes
  if (pathname === "/api/routes" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(routesList));
  }

  // 3) POST /api/book-ticket (example; not used in booking.js currently)
  if (pathname === "/api/book-ticket" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let bookingData;
      try {
        bookingData = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON" }));
      }

      // Simulate creating a ticket
      const newTicket = {
        id:             "TICKET" + ticketCounter++,
        routeId:        bookingData.tripId || "unknown-route",
        origin:         bookingData.origin,
        destination:    bookingData.destination,
        departureTime:  new Date().toISOString(),
        arrivalTime:    new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        price:          3.20,
        status:         "confirmed",
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(newTicket));
    });
    return;
  }

  // 4) POST /api/process-payment (example; matches booking.js’s PaymentService)
  if (pathname === "/api/process-payment" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let paymentData;
      try {
        paymentData = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON" }));
      }

      // Simulate processing a payment
      const newPayment = {
        id:        "PAY" + paymentCounter++,
        ticketId:  paymentData.ticketId,
        amount:    paymentData.amount,
        method:    paymentData.paymentMethod,
        status:    "completed",
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(newPayment));
    });
    return;
  }

  // 5) Serve static files under /js/
  if (pathname.startsWith("/js/")) {
    const filePath = path.join(__dirname, pathname);
    return serveStaticFile(res, filePath);
  }

  // 6) Serve static front-end under /Kuching-ART-Online-System/
  if (pathname.startsWith("/Kuching-ART-Online-System/")) {
    // Remove the prefix and serve from public/Kuching-ART-Online-System/
    const relPath = pathname.replace("/Kuching-ART-Online-System/", "");
    const filePath = path.join(
      __dirname,
      "public",
      "Kuching-ART-Online-System",
      relPath
    );
    return serveStaticFile(res, filePath);
  }

  // 7) Fallback → 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
