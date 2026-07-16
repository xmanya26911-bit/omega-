// Omega PC Remote — WebSocket Relay Server
// Deploy to Render free tier (Node.js)
// Agents connect with ?role=agent&token=SECRET
// Clients connect with ?role=client&token=SECRET

const WebSocket = require("ws");
const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3001;
const RELAY_TOKEN = process.env.RELAY_TOKEN || crypto.randomBytes(16).toString("hex");

// Print the token once at startup so you can grab it from Render logs
console.log("=== OMEGA RELAY SERVER ===");
console.log(`Port: ${PORT}`);
console.log(`Token: ${RELAY_TOKEN}`);
console.log("");

// ── HTTP health-check endpoint (required by Render) ─────────────────────
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Omega Relay Server OK\n");
    return;
  }
  res.writeHead(404);
  res.end();
});

// ── WebSocket server ───────────────────────────────────────────────────
const wss = new WebSocket.Server({ server });

let agentSocket = null;
const clientSockets = new Set();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const role = url.searchParams.get("role");
  const token = url.searchParams.get("token");

  // Auth
  if (!token || token !== RELAY_TOKEN) {
    ws.close(4001, "Invalid token");
    return;
  }

  if (role === "agent") {
    // PC Agent connection
    agentSocket = ws;
    console.log("[AGENT] connected");

    // Forward agent responses to all website clients
    ws.on("message", (data) => {
      const msg = data.toString();
      for (const client of clientSockets) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      }
    });

    ws.on("close", () => {
      console.log("[AGENT] disconnected");
      agentSocket = null;
      // Notify all clients that agent disconnected
      const notice = JSON.stringify({ type: "status", agent: "offline" });
      for (const client of clientSockets) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(notice);
        }
      }
    });

    ws.on("error", (err) => {
      console.error("[AGENT] error:", err.message);
    });

    // Send current client count to agent
    ws.send(JSON.stringify({ type: "status", clients: clientSockets.size }));

  } else if (role === "client") {
    // Website client connection
    clientSockets.add(ws);
    console.log(`[CLIENT] connected (total: ${clientSockets.size})`);

    // Notify client of agent status
    ws.send(JSON.stringify({
      type: "status",
      agent: agentSocket && agentSocket.readyState === WebSocket.OPEN ? "online" : "offline",
    }));

    // Forward client commands to the agent
    ws.on("message", (data) => {
      if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
        agentSocket.send(data.toString());
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Agent is offline" }));
      }
    });

    ws.on("close", () => {
      clientSockets.delete(ws);
      console.log(`[CLIENT] disconnected (total: ${clientSockets.size})`);
    });

    ws.on("error", (err) => {
      console.error("[CLIENT] error:", err.message);
      clientSockets.delete(ws);
    });

  } else {
    ws.close(4002, "Invalid role — use ?role=agent or ?role=client");
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Agent URL:  ws://localhost:${PORT}/?role=agent&token=${RELAY_TOKEN}`);
  console.log(`Client URL: ws://localhost:${PORT}/?role=client&token=${RELAY_TOKEN}`);
});
