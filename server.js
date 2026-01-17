const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let clients = [];
let blocks = [];

wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (data.type === "player") {
      ws.player = data.player;
    }

    if (data.type === "block") {
      blocks.push(data.block);
    }
  });

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

// 👉 sendet 20x pro Sekunde ALLE Spieler an ALLE
setInterval(() => {
  const sendData = JSON.stringify({
    players: clients.map(c => c.player).filter(p => p),
    blocks: blocks
  });

  clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(sendData);
    }
  });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server läuft auf Port", PORT));
