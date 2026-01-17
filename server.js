const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let players = {};

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).substr(2, 9);
  players[id] = { x: 100, y: 100 };

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    players[id] = data;
  });

  ws.on("close", () => {
    delete players[id];
  });
});

setInterval(() => {
  const data = JSON.stringify(players);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server läuft"));
