const http = require("http");
const redis = require("redis");

const PORT = process.env.BACKEND_PORT || 3001;
const REDIS_HOST = process.env.REDIS_HOST || "cache";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

async function start() {
  await client.connect();

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: "ok" }));
    }

    if (req.method === "GET" && req.url === "/tasks") {
      const tasks = JSON.parse((await client.get("tasks")) || "[]");
      res.writeHead(200);
      return res.end(JSON.stringify(tasks));
    }

    if (req.method === "POST" && req.url === "/tasks") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        const { title } = JSON.parse(body);
        const tasks = JSON.parse((await client.get("tasks")) || "[]");
        tasks.push({ id: Date.now(), title });
        await client.set("tasks", JSON.stringify(tasks));
        res.writeHead(201);
        res.end(JSON.stringify(tasks));
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route introuvable" }));
  });

  server.listen(PORT, () => {
    console.log(`Backend lancé sur le port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Erreur backend :", err.message);
  process.exit(1);
});
