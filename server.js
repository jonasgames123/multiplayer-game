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
    const data = JSON.parse(msg);

    if (data.type === "player") {
      ws.player = data.player;
    }

    if (data.type === "block") {
      blocks.push(data.block);
    }

    const sendData = JSON.stringify({
      players: clients.map(c => c.player).filter(p => p),
      blocks: blocks
    });

    clients.forEach(c => {
      if (c.readyState === 1) c.send(sendData);
    });
  });

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server läuft auf", PORT));
