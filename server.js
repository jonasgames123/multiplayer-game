const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

let players = {};

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).substr(2, 9);

  players[id] = { x: 200, y: 200 };

  // 👉 schick dem Spieler seine ID
  ws.send(JSON.stringify({ type: "id", id }));

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "move") {
        players[id] = data.player;
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    delete players[id];
  });
});

setInterval(() => {
  const data = JSON.stringify({ type: "players", players });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server läuft"));
