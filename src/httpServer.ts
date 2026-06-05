import http from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { AddigyClient } from "./addigy-client.js";
import { registerDeviceTools } from "./tools/devices.js";
import { registerPolicyTools } from "./tools/policies.js";
import { registerAlertTools } from "./tools/alerts.js";

const PORT = parseInt(process.env.PORT ?? "8080", 10);

// Addigy V1 uses client_id + client_secret (query params)
// Addigy V2 uses a Bearer API token
const CLIENT_ID = process.env.ADDIGY_CLIENT_ID;
const CLIENT_SECRET = process.env.ADDIGY_CLIENT_SECRET;
const API_TOKEN = process.env.ADDIGY_API_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !API_TOKEN) {
  console.error(
    "ERROR: ADDIGY_CLIENT_ID, ADDIGY_CLIENT_SECRET, and ADDIGY_API_TOKEN are all required.\n" +
    "  - ADDIGY_CLIENT_ID / ADDIGY_CLIENT_SECRET: V1 API credentials (Account > Integrations > V1)\n" +
    "  - ADDIGY_API_TOKEN: V2 API token (Account > Integrations > API & Webhooks > V2)"
  );
  process.exit(1);
}

function buildServer(): McpServer {
  const client = new AddigyClient(CLIENT_ID!, CLIENT_SECRET!, API_TOKEN!);

  const server = new McpServer({
    name: "addigy-mcp",
    version: "1.0.0",
  });

  registerDeviceTools(server, client);
  registerPolicyTools(server, client);
  registerAlertTools(server, client);

  return server;
}

const httpServer = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", transport: "streamable-http" }));
    return;
  }

  if (req.url === "/mcp") {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.error(`Addigy MCP server listening on port ${PORT}`);
  console.error(`MCP endpoint:  http://0.0.0.0:${PORT}/mcp`);
  console.error(`Health check:  http://0.0.0.0:${PORT}/health`);
});

httpServer.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
