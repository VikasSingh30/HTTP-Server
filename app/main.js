const net = require("net");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

console.log("Logs from your program will appear here!");

const args = process.argv;
let baseDir = ".";

const dirIndex = args.indexOf("--directory");
if (dirIndex !== -1 && args[dirIndex + 1]) {
  baseDir = args[dirIndex + 1];
}

const server = net.createServer((socket) => {
  let buffer = "";

  socket.on("data", (chunk) => {
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
          socket.write(response);
          socket.write(finalBody);
          if (close) socket.end();
        };

        if (clientSupportsGzip) {
          zlib.gzip(bodyContent, (err, compressed) => {
            if (err) {
              socket.end();
            } else {
              send(compressed);
            }
          });
        } else {
          send(bodyContent);
        }
      };

      const shouldClose = headers["connection"]?.toLowerCase() === "close";

      if (method === "POST" && pathLine.startsWith("/files/")) {
        const fileName = pathLine.slice("/files/".length);
        const filePath = path.join(baseDir, fileName);

        fs.writeFile(filePath, body, (err) => {
          if (err) {
            sendResponse("HTTP/1.1 500 Internal Server Error", "text/plain", "Internal Server Error", false, shouldClose);
          } else {
            socket.write("HTTP/1.1 201 Created\r\n\r\n");
            if (shouldClose) socket.end();
          }
        });
      }

      else if (method === "GET" && pathLine.startsWith("/files/")) {
        const fileName = pathLine.slice("/files/".length);
        const filePath = path.join(baseDir, fileName);

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
                    `${shouldClose ? 'Connection: close' : 'Connection: keep-alive'}\r\n\r\n`;
                  socket.write(header);
                  socket.write(compressed);
                  if (shouldClose) socket.end();
                }
              });
            } else {
              const header =
                `HTTP/1.1 200 OK\r\n` +
                `Content-Type: application/octet-stream\r\n` +
                `Content-Length: ${fileContent.length}\r\n` +
                `${shouldClose ? 'Connection: close' : 'Connection: keep-alive'}\r\n\r\n`;
              socket.write(header);
              socket.write(fileContent);
              if (shouldClose) socket.end();
            }
          }
        });
      }

      else if (method === "GET" && pathLine.startsWith("/echo/")) {
        const responseText = pathLine.slice("/echo/".length);
        sendResponse("HTTP/1.1 200 OK", "text/plain", responseText, false, shouldClose);
      }

      else if (method === "GET" && pathLine === "/user-agent") {
        const userAgent = headers["user-agent"] || "";
        sendResponse("HTTP/1.1 200 OK", "text/plain", userAgent, false, shouldClose);
      }

      else if (method === "GET" && pathLine === "/") {
        sendResponse("HTTP/1.1 200 OK", "text/plain", "Hello, world!", false, shouldClose);
      }

      else {
        sendResponse("HTTP/1.1 404 Not Found", "text/plain", "Not Found", false, shouldClose);
      }
    }
  });
});

server.listen(4221, "localhost");



















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

// Chunked Transfer Encoding
// In this challenge extension, you'll implement chunked transfer encoding to stream response bodies when the total size isn't known beforehand.
// Along the way, you'll learn about the Transfer-Encoding: chunked header, chunk formatting rules, handling streaming data and more.


// Query Params
// In this challenge extension, you'll add support for parsing query params from request URLs.
// Along the way, you'll learn about query param syntax, parsing key-value pairs (handling & and =), performing URL decoding and more.

// Cookies
// In this challenge extension, you'll implement cookie-based session management to maintain user state across multiple HTTP requests.
// Along the way, you'll learn about the Cookie & Set-Cookie headers (including attributes like Expires, HttpOnly, Secure, SameSite) and more.

// CORS
// In this challenge extension, you'll implement CORS (Cross-Origin Resource Sharing) to allow web browsers from different origins to securely access your server's resources.
// Along the way, you'll learn about the Origin request header, preflight CORS requests, various Access-Control-Allow-* response headers and more.

// TLS
// In this challenge extension, you'll add support for secure HTTPS connections by integrating TLS (Transport Layer Security).
// Along the way, you'll learn about managing certificates, the TLS handshake process, how to use TLS libraries/modules and more.

// HTTP/2
// In this challenge extension, you'll upgrade your server to support the HTTP/2 protocol.
// Along the way, you'll learn about the Upgrade header, HTTP/2 concepts like binary framing, streams, multiplexing, flow control and more.

// WebSockets
// In this challenge extension, you'll extend your server to handle WebSocket connections for real-time, bidirectional communication.
// Along the way, you'll learn about the HTTP Upgrade mechanism, the WebSocket handshake process, the 101 Switching Protocols status code and more.

// Basic Authentication
// In this challenge extension, you'll implement HTTP Basic Authentication to password-protect specific server resources.
// Along the way, you'll learn about the Authorization & WWW-Authenticate headers, the 401 Unauthorized status code and more.

// Range requests
// In this challenge extension, you'll add support for HTTP range requests to your server.
// Along the way, you'll learn about the Range and Content-Range headers, how to handle partial content requests and more.

// E-Tag caching
// In this challenge extension, you'll implement E-Tag caching in your HTTP server.
// Along the way, you'll learn about the ETag header, the If-None-Match header, and how E-Tags are used for caching HTTP response.

