import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory array for shopping cart items (Part A)
let cart = [
  {
    id: 1,
    productName: "Wireless Mouse",
    price: 799,
    quantity: 2
  },
  {
    id: 2,
    productName: "Mechanical Keyboard",
    price: 2499,
    quantity: 1
  }
];

// Helper to send JSON responses
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Create the native HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Route: GET /
  if (method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Shopping Cart</title></head>
        <body style="font-family: Arial; margin: 40px;">
          <h1>Welcome to the Shopping Cart Management Application!</h1>
          <p>This is a native Node.js HTTP server running on port 3000.</p>
          <ul>
            <li><a href="/home">/home</a> - Static Home Page (served via FS)</li>
            <li><a href="/cart">/cart</a> - View Cart items (JSON)</li>
            <li><a href="/about">/about</a> - About Application</li>
          </ul>
        </body>
      </html>
    `);
    return;
  }

  // Route: GET /cart
  if (method === 'GET' && pathname === '/cart') {
    sendJson(res, 200, {
      message: "Cart items retrieved successfully",
      cart: cart
    });
    return;
  }

  // Route: GET /about
  if (method === 'GET' && pathname === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>About Shopping Cart App</title></head>
        <body style="font-family: Arial; margin: 40px;">
          <h1>About Shopping Cart Management Application</h1>
          <p><strong>Course:</strong> Full Stack Development - Node.js Lab Examination (MT1)</p>
          <p><strong>Description:</strong> A lightweight shopping cart management web application demonstrating Node.js built-in HTTP and FS modules for routing, method handling, and static file serving.</p>
          <p><a href="/">Back to Home</a></p>
        </body>
      </html>
    `);
    return;
  }

  // Route: GET /home (Serve public/index.html using FS module)
  if (method === 'GET' && pathname === '/home') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error: Failed to load index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // Route: POST /add-to-cart
  if (method === 'POST' && pathname === '/add-to-cart') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let parsedData;
      try {
        parsedData = JSON.parse(body);
      } catch (parseErr) {
        sendJson(res, 400, { message: "Invalid JSON format" });
        return;
      }

      const { id, productName, price, quantity } = parsedData;

      // Validate required fields
      if (id === undefined || !productName || price === undefined || quantity === undefined) {
        sendJson(res, 400, {
          message: "Validation Error: id, productName, price, and quantity are required fields"
        });
        return;
      }

      const parsedId = Number(id);
      const parsedPrice = Number(price);
      const parsedQuantity = Number(quantity);

      if (isNaN(parsedId) || isNaN(parsedPrice) || isNaN(parsedQuantity)) {
        sendJson(res, 400, {
          message: "Validation Error: id, price, and quantity must be valid numbers"
        });
        return;
      }

      const newProduct = {
        id: parsedId,
        productName: productName.trim(),
        price: parsedPrice,
        quantity: parsedQuantity
      };

      cart.push(newProduct);

      sendJson(res, 201, {
        message: "Product added to cart successfully",
        product: newProduct
      });
    });
    return;
  }

  // 404 - Not Found for invalid routes
  sendJson(res, 404, {
    message: "404 Not Found: Route does not exist"
  });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});

