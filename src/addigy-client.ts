import axios, { AxiosInstance } from "axios";

export class AddigyClient {
  private v1: AxiosInstance;
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string, _apiToken: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    // V1 — credentials passed as query params on every request
    // Note: V1 is deprecated by Addigy but still functional as of June 2026
    this.v1 = axios.create({
      baseURL: "https://prod.addigy.com/api",
      timeout: 30000,
    });
  }

  private v1Params(extra: Record<string, string> = {}) {
    return { client_id: this.clientId, client_secret: this.clientSecret, ...extra };
  }

  // ── Device helpers ──────────────────────────────────────────────

  async getDevices() {
    const res = await this.v1.get("/devices", { params: this.v1Params() });
    return res.data;
  }

  async getOnlineDevices() {
    const res = await this.v1.get("/devices/online", { params: this.v1Params() });
    return res.data;
  }

  async getOfflineDevices() {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) => !d.online);
  }

  async getDeviceById(agentId: string) {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) => d.agentid === agentId);
  }

  async getDevicesByOS(osVersion: string) {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) =>
      d.mac_os_x_version && String(d.mac_os_x_version).includes(osVersion)
    );
  }

  async getDevicesWithLowDisk(thresholdPercent = 10) {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) =>
      d.free_disk_percentage !== undefined && Number(d.free_disk_percentage) <= thresholdPercent
    );
  }

  async getDevicesWithFileVaultDisabled() {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) => !d.filevault_enabled);
  }

  async getDevicesWithFirewallDisabled() {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) => !d.firewall_enabled);
  }

  async getExpiringWarrantyDevices(daysLeft = 90) {
    const allDevices = await this.getDevices();
    return allDevices.filter((d: Record<string, unknown>) =>
      d.warranty_days_left !== undefined &&
      Number(d.warranty_days_left) >= 0 &&
      Number(d.warranty_days_left) <= daysLeft
    );
  }

  async searchDevices(filters: Record<string, unknown>[]) {
    const allDevices = await this.getDevices();
    return allDevices.filter((device: Record<string, unknown>) =>
      filters.every((filter) => {
        const field = filter.audit_field as string;
        const value = filter.value;
        const operation = filter.operation as string;
        const deviceValue = device[field];
        if (deviceValue === undefined) return false;
        switch (operation) {
          case "=": return deviceValue === value;
          case "!=": return deviceValue !== value;
          case "contains": return String(deviceValue).includes(String(value));
          case ">=": return Number(deviceValue) >= Number(value);
          case "<=": return Number(deviceValue) <= Number(value);
          case ">": return Number(deviceValue) > Number(value);
          case "<": return Number(deviceValue) < Number(value);
          default: return true;
        }
      })
    );
  }

  async getApplications() {
    const res = await this.v1.get("/applications", { params: this.v1Params() });
    return res.data;
  }

  // ── Policy helpers ──────────────────────────────────────────────

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

  // ── Alert helpers ───────────────────────────────────────────────

  async getAlerts(status?: string, page = 1, perPage = 50) {
    const params: Record<string, string> = {
      page: String(page),
      per_page: String(perPage),
    };
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
}
