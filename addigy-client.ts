import axios, { AxiosInstance } from "axios";

export class AddigyClient {
  private v1: AxiosInstance;
  private v2: AxiosInstance;
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string, apiToken: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    // V1 — credentials passed as query params on every request
    this.v1 = axios.create({
      baseURL: "https://prod.addigy.com/api",
      timeout: 30000,
    });

    // V2 — Bearer token auth
    this.v2 = axios.create({
      baseURL: "https://api.addigy.com/api/v2",
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // ── V1 helpers ──────────────────────────────────────────────────

  private v1Params(extra: Record<string, string> = {}) {
    return { client_id: this.clientId, client_secret: this.clientSecret, ...extra };
  }

  async getDevices() {
    const res = await this.v1.get("/devices", { params: this.v1Params() });
    return res.data;
  }

  async getOnlineDevices() {
    const res = await this.v1.get("/devices/online", { params: this.v1Params() });
    return res.data;
  }

  async getPolicies() {
    const res = await this.v1.get("/policies", { params: this.v1Params() });
    return res.data;
  }

  async getPolicyDevices(policyId: string) {
    const res = await this.v1.get("/policies/devices", {
      params: this.v1Params({ policy_id: policyId }),
    });
    return res.data;
  }

  async assignDeviceToPolicy(policyId: string, agentId: string) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const res = await this.v1.post(
      `/policies/devices?${params.toString()}`,
      new URLSearchParams({ policy_id: policyId, agent_id: agentId }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return res.data;
  }

  async getAlerts(status?: string, page = 1, perPage = 50) {
    const params: Record<string, string> = { page: String(page), per_page: String(perPage) };
    if (status) params["status"] = status;
    const res = await this.v1.get("/alerts", { params: this.v1Params(params) });
    return res.data;
  }

  async getMaintenance(page = 1, perPage = 50) {
    const res = await this.v1.get("/maintenance", {
      params: this.v1Params({ page: String(page), per_page: String(perPage) }),
    });
    return res.data;
  }

  async getApplications() {
    const res = await this.v1.get("/applications", { params: this.v1Params() });
    return res.data;
  }

  // ── V2 helpers ──────────────────────────────────────────────────

  async searchDevices(filters: object[] = [], page = 1, perPage = 50) {
    const res = await this.v2.post("/devices", { filters, page, per_page: perPage });
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

  async getOfflineDevices() {
    const res = await this.v2.post("/devices", {
      filters: [{ audit_field: "online", type: "boolean", operation: "=", value: false }],
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
}
