import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AddigyClient } from "../addigy-client.js";

export function registerPolicyTools(server: McpServer, client: AddigyClient) {

  server.registerTool("list_policies", {
    description: "List all policies in the Addigy organization including their IDs, names, parent policies, and colors",
    inputSchema: {},
  }, async () => {
    const data = await client.getPolicies();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("get_policy_devices", {
    description: "List all devices assigned to a specific policy",
    inputSchema: {
      policy_id: z.string().describe("The policy ID to get devices for"),
    },
  }, async ({ policy_id }) => {
    const data = await client.getPolicyDevices(policy_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("assign_device_to_policy", {
    description: "Assign a device to a policy. If the device is already in a policy, it will be moved to the new one.",
    inputSchema: {
      policy_id: z.string().describe("The policy ID to assign the device to"),
      agent_id: z.string().describe("The agent ID of the device to assign"),
    },
  }, async ({ policy_id, agent_id }) => {
    const data = await client.assignDeviceToPolicy(policy_id, agent_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });
}
