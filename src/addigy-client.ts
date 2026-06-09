import axios, { AxiosInstance } from "axios";

export class AddigyClient {
  private v2: AxiosInstance;

  constructor(_clientId: string, _clientSecret: string, apiToken: string) {
    // V1 is deprecated — all calls use V2 Bearer token auth
    this.v2 = axios.create({
      baseURL: "https://api.addigy.com/api/v2",
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // ── Device helpers ──────────────────────────────────────────────

  async getDevices() {
    const res = await this.v2.post("/devices", { filters: [], page: 1, per_page: 100 });
    return res.data;
  }

  async getOnlineDevices() {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "online", type: "boolean", operation: "=", value: true }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async getOfflineDevices() {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "online", type: "boolean", operation: "=", value: false }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async getDeviceById(agentId: string) {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "agentid", type: "string", operation: "=", value: agentId }],
      page: 1,
      per_page: 1,
    });
    return res.data;
  }

  async getDevicesByOS(osVersion: string) {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "mac_os_x_version", type: "string", operation: "contains", value: osVersion }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async getDevicesWithLowDisk(thresholdPercent = 10) {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "free_disk_percentage", type: "number", operation: "<=", value: thresholdPercent }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async getDevicesWithFileVaultDisabled() {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "filevault_enabled", type: "boolean", operation: "=", value: false }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async getDevicesWithFirewallDisabled() {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "firewall_enabled", type: "boolean", operation: "=", value: false }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async getExpiringWarrantyDevices(daysLeft = 90) {
    const res = await this.v2.post("/devices", {
      filters: [
        { audit_field: "warranty_days_left", type: "number", operation: "<=", value: daysLeft },
        { audit_field: "warranty_days_left", type: "number", operation: ">=", value: 0 },
      ],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async searchDevices(filters: object[] = [], page = 1, perPage = 50) {
    const res = await this.v2.post("/devices", { filters, page, per_page: perPage });
    return res.data;
  }

  async getApplications() {
    const res = await this.v2.post("/devices", {
      filters: [],
      page: 1,
      per_page: 100,
    });
    // Return installed_applications field from devices
    return res.data;
  }

  // ── Policy helpers ──────────────────────────────────────────────

  async getPolicies() {
    const res = await this.v2.get("/policies");
    return res.data;
  }

  async getPolicyDevices(policyId: string) {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "policy_id", type: "string", operation: "=", value: policyId }],
      page: 1,
      per_page: 100,
    });
    return res.data;
  }

  async assignDeviceToPolicy(policyId: string, agentId: string) {
    const res = await this.v2.put(`/policies/${policyId}/devices`, { agent_id: agentId });
    return res.data;
  }

  // ── Alert helpers ───────────────────────────────────────────────

  async getAlerts(status?: string, page = 1, perPage = 50) {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (status) params["status"] = status;
    const res = await this.v2.get("/alerts", { params });
    return res.data;
  }

  async getMaintenance(page = 1, perPage = 50) {
    const res = await this.v2.get("/maintenance", { params: { page, per_page: perPage } });
    return res.data;
  }
}
