const net = require("net");
const fs = require("fs");
const path = require("path");

console.log("Logs from your program will appear here!");

const args = process.argv;
let baseDir = ".";

const dirIndex = args.indexOf("--directory");
if (dirIndex !== -1 && args[dirIndex + 1]) {
  baseDir = args[dirIndex + 1];
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const [headerSection, body] = request.split("\r\n\r\n");
    const lines = headerSection.split("\r\n");

    const [method, pathLine] = lines[0].split(" ");

    const headers = {};
    lines.slice(1).forEach((line) => {
      const [key, value] = line.split(": ");
      headers[key.toLowerCase()] = value;
    });

    const acceptEncoding = headers["accept-encoding"] || "";
    const clientSupportsGzip = acceptEncoding.includes("gzip");

    const buildResponse = (statusLine, contentType, bodyContent) => {
      let response =
        `${statusLine}\r\n` +
        `Content-Type: ${contentType}\r\n`;

      if (clientSupportsGzip) {
        response += `Content-Encoding: gzip\r\n`;
      }

      response += `Content-Length: ${Buffer.byteLength(bodyContent)}\r\n` +
                  `\r\n` +
                  bodyContent;

      return response;
    };

    if (method === "POST" && pathLine.startsWith("/files/")) {
      const fileName = pathLine.slice("/files/".length);
      const filePath = path.join(baseDir, fileName);
      const contentLength = parseInt(headers["content-length"] || "0");
      const actualBody = body.slice(0, contentLength);

      fs.writeFile(filePath, actualBody, (err) => {
        if (err) {
          const body = "Internal Server Error";
          const response = buildResponse("HTTP/1.1 500 Internal Server Error", "text/plain", body);
          socket.write(response);
        } else {
          const response = "HTTP/1.1 201 Created\r\n\r\n";
          socket.write(response);
        }
        socket.end();
      });
    }

    else if (method === "GET" && pathLine.startsWith("/files/")) {
      const fileName = pathLine.slice("/files/".length);
      const filePath = path.join(baseDir, fileName);

      fs.readFile(filePath, (err, fileContent) => {
        if (err) {
          const body = "Not Found";
          const response = buildResponse("HTTP/1.1 404 Not Found", "text/plain", body);
          socket.write(response);
        } else {
          let response =
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: application/octet-stream\r\n";
          if (clientSupportsGzip) {
            response += "Content-Encoding: gzip\r\n";
          }
          response += `Content-Length: ${fileContent.length}\r\n\r\n`;
          socket.write(response);
          socket.write(fileContent);
        }
        socket.end();
      });
    }

    else if (method === "GET" && pathLine.startsWith("/echo/")) {
      const body = pathLine.slice("/echo/".length);
      const response = buildResponse("HTTP/1.1 200 OK", "text/plain", body);
      socket.write(response);
      socket.end();
    }

    else if (method === "GET" && pathLine === "/user-agent") {
      const userAgent = headers["user-agent"] || "";
      const response = buildResponse("HTTP/1.1 200 OK", "text/plain", userAgent);
      socket.write(response);
      socket.end();
    }
    
    else if (method === "GET" && pathLine === "/") {
      const body = "Hello, world!";
      const response = buildResponse("HTTP/1.1 200 OK", "text/plain", body);
      socket.write(response);
      socket.end();
    }

    else {
      const body = "Not Found";
      const response = buildResponse("HTTP/1.1 404 Not Found", "text/plain", body);
      socket.write(response);
      socket.end();
    }
  });

  socket.on("close", () => {
    socket.end();
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

// Persistent Connections - 
// In this challenge extension, you'll extend your HTTP server to support persistent connections.
// Along the way, you'll learn about persistent connections, the Connection header, how a HTTP client can re-use a TCP connection for multiple requests and more.