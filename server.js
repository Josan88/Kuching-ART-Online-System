// server.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'querystring';

// __dirname emulation in ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Helper: determine Content-Type based on file extension
const mimeTypes = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// Utility to serve a static file
function serveStaticFile(res, absolutePath) {
  fs.readFile(absolutePath, (err, data) => {
    if (err) {
      // File not found or other error
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Minimal in-memory “database” for demonstration:
let ticketCounter = 1000;
let paymentCounter = 5000;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1) Redirect root → booking.html
  if (pathname === '/') {
    res.writeHead(302, { Location: '/Kuching-ART-Online-System/booking.html' });
    return res.end();
  }

  // 2) Handle API endpoints
  if (pathname === '/api/book-ticket' && req.method === 'POST') {
    // Collect JSON body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let bookingData;
      try {
        bookingData = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      // Simulate ticket creation
      const newTicket = {
        id: 'TICKET' + ticketCounter++,                    // e.g. "TICKET1000"
        routeId: bookingData.tripId || 'unknown-route',
        origin: bookingData.origin,
        destination: bookingData.destination,
        departureTime: Date.now(),
        arrivalTime: Date.now() + 30 * 60 * 1000,           // +30 minutes
        price: 3.20,                                        // mock price
        status: 'confirmed',
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newTicket));
    });
    return;
  }

  if (pathname === '/api/process-payment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let paymentData;
      try {
        paymentData = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      // Simulate payment processing
      const newPayment = {
        id: 'PAY' + paymentCounter++,              // e.g. "PAY5000"
        ticketId: paymentData.ticketId,
        amount: paymentData.amount,
        method: paymentData.paymentMethod,
        status: 'completed',
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newPayment));
    });
    return;
  }

  // 3) Serve static “model” and “service” modules under /js/
  // e.g. request for /js/models/Ticket.js → /js/models/Ticket.js on disk
  if (pathname.startsWith('/js/')) {
    const filePath = path.join(__dirname, pathname);
    return serveStaticFile(res, filePath);
  }

  // 4) Serve static front-end under /Kuching-ART-Online-System/
  // e.g. /Kuching-ART-Online-System/booking.html → ./public/Kuching-ART-Online-System/booking.html
  if (pathname.startsWith('/Kuching-ART-Online-System/')) {
    const relPath = pathname.replace('/Kuching-ART-Online-System/', '');
    const filePath = path.join(__dirname, 'public', 'Kuching-ART-Online-System', relPath);
    return serveStaticFile(res, filePath);
  }

  // 5) If none matched, return 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
