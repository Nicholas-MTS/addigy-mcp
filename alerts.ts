import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AddigyClient } from "../addigy-client.js";

export function registerAlertTools(server: McpServer, client: AddigyClient) {

  server.registerTool("list_alerts", {
    description: "List alerts in the Addigy organization. Filter by status: Unattended, Acknowledged, or Resolved.",
    inputSchema: {
      status: z.enum(["Unattended", "Acknowledged", "Resolved"]).optional().describe("Filter by alert status. Omit to get all alerts."),
      page: z.number().optional().describe("Page number (default: 1)"),
      per_page: z.number().optional().describe("Results per page (default: 50, max: 100)"),
    },
  }, async ({ status, page, per_page }) => {
    const data = await client.getAlerts(status, page ?? 1, per_page ?? 50);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_unattended_alerts", {
    description: "List all unattended (unacknowledged) alerts that need attention",
    inputSchema: {},
  }, async () => {
    const data = await client.getAlerts("Unattended");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_maintenance", {
    description: "List maintenance jobs that have been run across devices",
    inputSchema: {
      page: z.number().optional().describe("Page number (default: 1)"),
      per_page: z.number().optional().describe("Results per page (default: 50, max: 100)"),
    },
  }, async ({ page, per_page }) => {
    const data = await client.getMaintenance(page ?? 1, per_page ?? 50);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });
}
