const net = require("net");


console.log("Logs from your program will appear here!");


const server = net.createServer((socket) => {
    // socket.write("HTTP/1.1 200 OK\r\n\r\n");
    const response = 
    "HTTP/1.1 200 OK\r\n" +
    "Content-Type: text/plain\r\n" +
    "Content-Length: 13\r\n" +
    "\r\n" +
    "Hello, world!";

    socket.write(response);
//   socket.on("close", () => {
    socket.end();
//   });
});

server.listen(4221, "localhost");










//  TCP/IP- https://www.cloudflare.com/en-ca/learning/ddos/glossary/tcp-ip/
//  socket.write("HTTP/1.1 200 OK\r\n\r\n"); write coket return 200 OK
//  CRLF - https://developer.mozilla.org/en-US/docs/Glossary/CRLF





// const net = require("net");
// const fs = require("fs");
// const zlib = require("zlib");
// const path = require("path");

// const PORT = 4221;
// const HOST = "0.0.0.0";
// const DIRECTORY = "/tmp/";
// const COMPRESSION_HEADER = "Accept-Encoding";
// const compressionMethodsAllowed = {
//   gzip: true,
// };

// console.log("Logs from your program will appear here!");

// const server = net.createServer((socket) => {
//   socket.on("data", (chunk) => {
//     const data = chunk.toString();
//     const lines = data.split("\r\n");
//     const requestLine = lines[0];
//     const headers = extractHeaders(lines);
//     const method = requestLine.split(" ")[0];
//     const url = requestLine.split(" ")[1];

//     if (url.startsWith("/echo/")) {
//       const echoText = url.split("/echo/")[1];
//       const acceptEncoding = headers[COMPRESSION_HEADER] || "";
//       for (let encoding of acceptEncoding.split(",")) {
//         encoding = encoding.trim();
//         if (compressionMethodsAllowed[encoding]) {
//           const gzipped = zlib.gzipSync(echoText);
//           writeResponse(socket, 200, "OK", {
//             "Content-Type": "text/plain",
//             "Content-Encoding": encoding,
//             "Content-Length": gzipped.length,
//           }, gzipped);
//           return;
//         }
//       }

//       writeResponse(socket, 200, "OK", {
//         "Content-Type": "text/plain",
//         "Content-Length": echoText.length,
//       }, echoText);
//     }

//     else if (url === "/") {
//       writeResponse(socket, 200, "OK", {
//         "Content-Type": "text/plain",
//         "Content-Length": "0"
//       }, "");
//     }

//     else if (url === "/user-agent") {
//       const userAgent = headers["User-Agent"] || "";
//       writeResponse(socket, 200, "OK", {
//         "Content-Type": "text/plain",
//         "Content-Length": userAgent.length,
//       }, userAgent);
//     }

//     else if (url.startsWith("/files/")) {
//       const fileName = url.split("/files/")[1];
//       const filePath = path.join(DIRECTORY, fileName);

//       if (method === "GET") {
//         if (fs.existsSync(filePath)) {
//           const fileData = fs.readFileSync(filePath);
//           writeResponse(socket, 200, "OK", {
//             "Content-Type": "application/octet-stream",
//             "Content-Length": fileData.length,
//           }, fileData);
//         } else {
//           writeResponse(socket, 404, "Not Found", {
//             "Content-Type": "text/plain",
//             "Content-Length": "0"
//           }, "");
//         }
//       }

//       else if (method === "POST") {
//         const body = lines[lines.length - 1];
//         try {
//           fs.writeFileSync(filePath, body);
//           writeResponse(socket, 201, "Created", {
//             "Content-Type": "text/plain",
//             "Content-Length": "0"
//           }, "");
//         } catch (e) {
//           writeResponse(socket, 500, "Internal Server Error", {
//             "Content-Type": "text/plain",
//             "Content-Length": "0"
//           }, "");
//         }
//       }
//     }

//     else {
//       writeResponse(socket, 404, "Not Found", {
//         "Content-Type": "text/plain",
//         "Content-Length": "0"
//       }, "");
//     }

//     socket.end();
//   });

//   socket.on("error", (err) => {
//     console.error("Socket error:", err.message);
//   });
// });

// function writeResponse(socket, statusCode, statusText, headers, body) {
//   const statusLine = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
//   let headerLines = "";
//   for (const [key, value] of Object.entries(headers)) {
//     headerLines += `${key}: ${value}\r\n`;
//   }

//   const responseBody = Buffer.isBuffer(body) ? body : Buffer.from(body);
//   socket.write(statusLine + headerLines + "\r\n");
//   socket.write(responseBody);
// }

// function extractHeaders(lines) {
//   const headers = {};
//   for (let i = 1; i < lines.length; i++) {
//     const line = lines[i];
//     if (line === "") break;
//     const [key, value] = line.split(": ");
//     if (key && value) headers[key] = value;
//   }
//   return headers;
// }

// server.listen(PORT, HOST, () => {
//   console.log(`Server is listening on ${HOST}:${PORT}`);
// });
