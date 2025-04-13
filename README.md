# 🌐 **Build Your Own HTTP Server** 🚀

## 💻 **Custom HTTP Server in JavaScript**

Welcome to the world of building your own HTTP server! This project showcases a custom HTTP server built using **Node.js**, implementing essential HTTP features like persistent connections, compression, cookies, CORS, and basic authentication. This guide takes you step-by-step through the process of setting up and building the server, with advanced features like WebSocket support, caching, and more.

---

## 🛠️ **Features**

### 🌟 **Core Features**
* ✅ **Persistent connections (HTTP/1.1 Keep-Alive)** – Keeps the connection open for multiple requests.
* ✅ **Response compression (GZIP support)** – Reduces the size of response data for faster load times.
* ✅ **Basic authentication** – Secure access control for sensitive routes.
* ✅ **CORS handling** – Allows cross-origin requests for enhanced flexibility.
* ✅ **File uploads and downloads** – Support for handling both file uploads and downloads.
* ✅ **Cookie management** – Manage session and persistent data through cookies.
* ✅ **ETag caching support** – Efficient caching of resources to improve performance.

### 🌟 **Advanced Features**
* ✅ **Advanced Caching Techniques** – With `Cache-Control` and `ETag` headers.
* ✅ **Support for More HTTP Methods** – Added support for `PUT` and `DELETE` methods.
* ✅ **Improved Error Handling and Logging** – Enhanced error handling with **Winston** for logging.
* ✅ **WebSocket Support** – Real-time communication with WebSocket integration.

---

##🏆 **Stages**

| Stage | Description |
|-------|-------------|
| 🖥️ **Print a prompt** | Display a prompt before accepting input |
| 🔌 **Persistent Connections** | Handle keep-alive connections (HTTP/1.1) |
| 🔄 **Handle POST Requests** | Handle file uploads with POST method |
| 🏁 **Handle GET Requests** | Handle file downloads and simple responses |
| 🗝️ **Basic Authentication** | Implement HTTP Basic Authentication |
| 🍪 **Cookies** | Manage cookies for session and state |
| 💻 **CORS** | Implement Cross-Origin Resource Sharing (CORS) |
| 🔒 **Compression** | Support GZIP compression for responses |
| 🔖 **ETag Caching** | Implement ETag-based caching for efficient responses |

---

## ✅ **Working Features**
* ✔️ Persistent connections (Keep-Alive) are properly implemented.  
* ✔️ GZIP compression is applied to responses based on client support.  
* ✔️ Basic authentication for secure access.  
* ✔️ Cookies are set and read correctly.  
* ✔️ File upload and download handling with POST and GET methods.  
* ✔️ CORS handling for cross-origin requests.  
* ✔️ ETag caching to improve performance.  
 

---

## 📦 **Dependencies** 🧰

The following dependencies are used in this project:

* **[express](https://www.npmjs.com/package/express)** - Web framework for building the HTTP server.
* **[zlib](https://nodejs.org/api/zlib.html)** - Built-in Node.js module for GZIP compression.
* **[winston](https://www.npmjs.com/package/winston)** - A versatile logging library for logging requests and errors.
* **[fs](https://nodejs.org/api/fs.html)** - Built-in Node.js module for handling file system operations.
* **[path](https://nodejs.org/api/path.html)** - Built-in Node.js module for working with file and directory paths.
* **[cors](https://www.npmjs.com/package/cors)** - Middleware for enabling CORS (Cross-Origin Resource Sharing).
* **[body-parser](https://www.npmjs.com/package/body-parser)** - Middleware to parse incoming request bodies (for handling POST requests).
* **[cookie-parser](https://www.npmjs.com/package/cookie-parser)** - Middleware to parse cookies sent by the client.
* **[http](https://nodejs.org/api/http.html)** - Built-in Node.js module for creating the HTTP server.
* **[stream](https://nodejs.org/api/stream.html)** - Built-in Node.js module for stream handling (used for file upload and download functionality).
* **[websocket](https://www.npmjs.com/package/websocket)** - WebSocket library for real-time communication.

---

## 📚 **Learning Resources**

* [TCP/IP](https://www.cloudflare.com/en-ca/learning/ddos/glossary/tcp-ip/)  
* [Socket write "HTTP/1.1 200 OK"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#response_body)  
* [CRLF](https://developer.mozilla.org/en-US/docs/Glossary/CRLF)  
* [User-Agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent)  
* [Event Loop/Execution Model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)  
* [GET Method Syntax](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET#syntax)  
* [POST Method Syntax](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST#syntax)  
* [Compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding)  
* [Chunked Transfer Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding)  
* [Query Params](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET#syntax)  
* [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)  
* [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)  
* [TLS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#https)  
* [HTTP/2](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#http2)  
* [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)  
* [Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)  
* [Range Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)  
* [E-Tag Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)  
* [Persistent Connections](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Connection)  

---

## 🛠️ **Tech Stack**
* ✔️ **Node.js**  
* ✔️ **JavaScript**  
* ✔️ **zlib** (for GZIP compression)  
* ✔️ **fs** (for file handling)  
* ✔️ **path** (for path management)  

---

## 🏗️ **Project Structure** 🗂️

```plaintext
📂 **custom-http-server** 
  ├──📄 **server.js** 
├──📂 **node_modules**  
├──📂 **package-lock.json**   
├──📂 **package.json**   
├──📄 **README.md**  
