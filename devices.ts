import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AddigyClient } from "../addigy-client.js";

export function registerDeviceTools(server: McpServer, client: AddigyClient) {

  server.registerTool("list_all_devices", {
    description: "List all devices in the Addigy organization with their facts (OS version, online status, disk, memory, etc.)",
    inputSchema: {},
  }, async () => {
    const data = await client.getDevices();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_online_devices", {
    description: "List only devices that are currently online",
    inputSchema: {},
  }, async () => {
    const data = await client.getOnlineDevices();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_offline_devices", {
    description: "List devices that are currently offline",
    inputSchema: {},
  }, async () => {
    const data = await client.getOfflineDevices();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("get_device", {
    description: "Get detailed facts for a specific device by its agent ID",
    inputSchema: { agent_id: z.string().describe("The agent ID of the device") },
  }, async ({ agent_id }) => {
    const data = await client.getDeviceById(agent_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("search_devices_by_os", {
    description: "Find devices running a specific macOS version (e.g. '14.5' or 'Sonoma')",
    inputSchema: { os_version: z.string().describe("macOS version string to search for") },
  }, async ({ os_version }) => {
    const data = await client.getDevicesByOS(os_version);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_devices_low_disk", {
    description: "List devices with low free disk space below a threshold percentage",
    inputSchema: {
      threshold_percent: z.number().optional().describe("Free disk percentage threshold (default: 10)"),
    },
  }, async ({ threshold_percent }) => {
    const data = await client.getDevicesWithLowDisk(threshold_percent ?? 10);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_devices_filevault_disabled", {
    description: "List devices that do not have FileVault encryption enabled",
    inputSchema: {},
  }, async () => {
    const data = await client.getDevicesWithFileVaultDisabled();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_devices_firewall_disabled", {
    description: "List devices that do not have the firewall enabled",
    inputSchema: {},
  }, async () => {
    const data = await client.getDevicesWithFirewallDisabled();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_devices_expiring_warranty", {
    description: "List devices with warranties expiring within a specified number of days",
    inputSchema: {
      days_left: z.number().optional().describe("Number of days until warranty expiry (default: 90)"),
    },
  }, async ({ days_left }) => {
    const data = await client.getExpiringWarrantyDevices(days_left ?? 90);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("search_devices", {
    description: "Search devices using custom filters against device facts. Use audit_field names like 'device_name', 'serial_number', 'mac_os_x_version', 'online', 'filevault_enabled', etc.",
    inputSchema: {
      filters: z.array(z.object({
        audit_field: z.string().describe("Device fact field name"),
        type: z.enum(["string", "number", "boolean", "list", "date"]),
        operation: z.string().describe("Comparison operation: =, !=, >, <, >=, <=, contains, between"),
        value: z.any().describe("Value to compare against"),
      })).describe("Array of filter conditions"),
      page: z.number().optional().describe("Page number (default: 1)"),
      per_page: z.number().optional().describe("Results per page (default: 50, max: 100)"),
    },
  }, async ({ filters, page, per_page }) => {
    const data = await client.searchDevices(filters, page ?? 1, per_page ?? 50);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("list_installed_applications", {
    description: "Get a map of installed applications across all devices",
    inputSchema: {},
  }, async () => {
    const data = await client.getApplications();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });
}
