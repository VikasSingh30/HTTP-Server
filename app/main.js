const net = require("net");
// TCP
// CRLF


console.log("Logs from your program will appear here!");


const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
    socket.end();
    socket.closed();
  });
});

server.listen(4221, "localhost");
