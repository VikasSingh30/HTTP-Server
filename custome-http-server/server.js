const https = require("https");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const WebSocket = require("ws");
const cookie = require("cookie");
const basicAuth = require("express-basic-auth");
const winston = require("winston"); // For logging

// SSL certificates for HTTPS
const options = {
  key: fs.readFileSync("server-key.pem"),
  cert: fs.readFileSync("server-cert.pem"),
};

// Initialize Winston logger
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "server.log", level: "info" })
  ]
});

const server = https.createServer(options, (req, res) => {
  let buffer = "";

  // Parse incoming request
  req.on("data", (chunk) => {
    buffer += chunk.toString();
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;

      const headerSection = buffer.slice(0, headerEnd);
      const lines = headerSection.split("\r\n");
      const [method, pathLine] = lines[0].split(" ");
      const headers = {};
      lines.slice(1).forEach((line) => {
        const [key, value] = line.split(": ");
        headers[key.toLowerCase()] = value;
      });

      const contentLength = parseInt(headers["content-length"] || "0");
      const totalLength = headerEnd + 4 + contentLength;

      if (buffer.length < totalLength) break; // Wait for complete body

      const body = buffer.slice(headerEnd + 4, totalLength);
      const fullRequest = buffer.slice(0, totalLength);
      buffer = buffer.slice(totalLength); // Trim processed request

      const acceptEncoding = headers["accept-encoding"] || "";
      const clientSupportsGzip = acceptEncoding.includes("gzip");

      const sendResponse = (statusLine, contentType, bodyContent, isBinary = false, close = false) => {
        const send = (finalBody) => {
          let response =
            `${statusLine}\r\n` +
            `Content-Type: ${contentType}\r\n` +
            `Content-Length: ${Buffer.byteLength(finalBody)}\r\n`;

          if (clientSupportsGzip) {
            response += `Content-Encoding: gzip\r\n`;
          }

          if (close) {
            response += `Connection: close\r\n`;
          } else {
            response += `Connection: keep-alive\r\n`;
          }

          response += `\r\n`;
          res.write(response);
          res.write(finalBody);
          if (close) res.end();
        };

        if (clientSupportsGzip) {
          zlib.gzip(bodyContent, (err, compressed) => {
            if (err) {
              res.end();
            } else {
              send(compressed);
            }
          });
        } else {
          send(bodyContent);
        }
      };

      const shouldClose = headers["connection"]?.toLowerCase() === "close";

      // Implement caching (Cache-Control and ETag)
      const generateETag = (content) => {
        return require("crypto").createHash("md5").update(content).digest("hex");
      };

      const cacheControl = (req, res, next) => {
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
        next();
      };

      const etagMiddleware = (req, res, next) => {
        const body = 'response body here'; // The actual response body you are sending
        const etag = generateETag(body);
        if (req.headers["if-none-match"] === etag) {
          res.status(304).end(); // If the content hasn't changed, send a 304
        } else {
          res.setHeader("ETag", etag);
          next();
        }
      };

      // Handling GET, POST, PUT, DELETE, and other HTTP methods
      if (method === "POST" && pathLine.startsWith("/files/")) {
        const fileName = pathLine.slice("/files/".length);
        const filePath = path.join(__dirname, fileName);

        fs.writeFile(filePath, body, (err) => {
          if (err) {
            sendResponse("HTTP/1.1 500 Internal Server Error", "text/plain", "Internal Server Error", false, shouldClose);
          } else {
            res.write("HTTP/1.1 201 Created\r\n\r\n");
            if (shouldClose) res.end();
          }
        });
      }

      else if (method === "GET" && pathLine.startsWith("/files/")) {
        const fileName = pathLine.slice("/files/".length);
        const filePath = path.join(__dirname, fileName);

        fs.readFile(filePath, (err, fileContent) => {
          if (err) {
            sendResponse("HTTP/1.1 404 Not Found", "text/plain", "Not Found", false, shouldClose);
          } else {
            if (clientSupportsGzip) {
              zlib.gzip(fileContent, (err, compressed) => {
                if (err) {
                  sendResponse("HTTP/1.1 500 Internal Server Error", "text/plain", "Internal Server Error", false, shouldClose);
                } else {
                  const header =
                    `HTTP/1.1 200 OK\r\n` +
                    `Content-Type: application/octet-stream\r\n` +
                    `Content-Encoding: gzip\r\n` +
                    `Content-Length: ${compressed.length}\r\n` +
                    `${shouldClose ? "Connection: close" : "Connection: keep-alive"}\r\n\r\n`;
                  res.write(header);
                  res.write(compressed);
                  if (shouldClose) res.end();
                }
              });
            } else {
              const header =
                `HTTP/1.1 200 OK\r\n` +
                `Content-Type: application/octet-stream\r\n` +
                `Content-Length: ${fileContent.length}\r\n` +
                `${shouldClose ? "Connection: close" : "Connection: keep-alive"}\r\n\r\n`;
              res.write(header);
              res.write(fileContent);
              if (shouldClose) res.end();
            }
          }
        });
      }

      // Implement PUT and DELETE methods
      else if (method === "PUT" && pathLine.startsWith("/files/")) {
        const fileName = pathLine.slice("/files/".length);
        const filePath = path.join(__dirname, fileName);

        fs.writeFile(filePath, body, (err) => {
          if (err) {
            sendResponse("HTTP/1.1 500 Internal Server Error", "text/plain", "Internal Server Error", false, shouldClose);
          } else {
            sendResponse("HTTP/1.1 200 OK", "text/plain", "File Updated", false, shouldClose);
          }
        });
      }

      else if (method === "DELETE" && pathLine.startsWith("/files/")) {
        const fileName = pathLine.slice("/files/".length);
        const filePath = path.join(__dirname, fileName);

        fs.unlink(filePath, (err) => {
          if (err) {
            sendResponse("HTTP/1.1 500 Internal Server Error", "text/plain", "Internal Server Error", false, shouldClose);
          } else {
            sendResponse("HTTP/1.1 200 OK", "text/plain", "File Deleted", false, shouldClose);
          }
        });
      }

      // Default GET request handling
      else if (method === "GET" && pathLine === "/") {
        sendResponse("HTTP/1.1 200 OK", "text/plain", "Hello, world!", false, shouldClose);
      }

      else {
        sendResponse("HTTP/1.1 404 Not Found", "text/plain", "Not Found", false, shouldClose);
      }
    }
  });

  // CORS - Allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // WebSocket support (if needed)
  const wss = new WebSocket.Server({ noServer: true });
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log(`Received: ${message}`);
    });
    ws.send("Hello from WebSocket!");
  });

  // Handle WebSocket Upgrade
  server.on("upgrade", (req, socket, head) => {
    const acceptHeader = req.headers["sec-websocket-version"];
    if (acceptHeader) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });
});

// Server listening
server.listen(4221, "localhost", () => {
  console.log("Server is running on https://localhost:4221");
});





















//  TCP/IP- https://www.cloudflare.com/en-ca/learning/ddos/glossary/tcp-ip/
//  socket.write("HTTP/1.1 200 OK\r\n\r\n"); write coket return 200 OK
//  CRLF - https://developer.mozilla.org/en-US/docs/Glossary/CRLF
    // Summary:
    // We extract method and path from the request.
    // If path is /, we return 200 OK.
   // For anything else (like /orange), we return 404 Not Found.
// Response Body - https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#response_body
// User-Agent - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent
// event loop/execution model - https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop
// /files/{filename} - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET#syntax
// POST /files/{filename} - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST#syntax
// compression - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding
// Chunked Transfer Encoding - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding
// Query Params - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET#syntax
// Cookies - https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
// CORS - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// TLS - https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#https
// HTTP/2 - https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#http2
// WebSockets - https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
// Basic Authentication - https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
// Range requests - https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
// E-Tag caching - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
// Persistent Connections - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Connection



