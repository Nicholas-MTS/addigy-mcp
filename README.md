# addigy-mcp

MCP server for Addigy Apple device management — built from scratch using the Addigy V1 and V2 REST APIs.

## Tools (20 total)

### Devices
| Tool | Description |
|---|---|
| `list_all_devices` | List all devices with full facts |
| `list_online_devices` | List currently online devices |
| `list_offline_devices` | List currently offline devices |
| `get_device` | Get details for a specific device by agent ID |
| `search_devices_by_os` | Find devices by macOS version |
| `list_devices_low_disk` | Devices with free disk below threshold % |
| `list_devices_filevault_disabled` | Devices without FileVault encryption |
| `list_devices_firewall_disabled` | Devices without firewall enabled |
| `list_devices_expiring_warranty` | Devices with warranties expiring soon |
| `search_devices` | Custom filter search using device facts |
| `list_installed_applications` | Installed apps across all devices |

### Policies
| Tool | Description |
|---|---|
| `list_policies` | List all policies |
| `get_policy_devices` | List devices in a specific policy |
| `assign_device_to_policy` | Move a device to a policy |

### Alerts & Maintenance
| Tool | Description |
|---|---|
| `list_alerts` | List alerts with optional status filter |
| `list_unattended_alerts` | List all unacknowledged alerts |
| `list_maintenance` | List maintenance job history |

## Credentials

This server requires **both** V1 and V2 credentials:

| Variable | Description | Where to get it |
|---|---|---|
| `ADDIGY_CLIENT_ID` | V1 API client ID | Account → Integrations → V1 → New API Token |
| `ADDIGY_CLIENT_SECRET` | V1 API client secret | Same as above |
| `ADDIGY_API_TOKEN` | V2 Bearer token | Account → Integrations → API & Webhooks → V2 → New API Token |

## Deploy to Azure

### 1. Create a GitHub repo and push this code

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/addigy-mcp.git
git push -u origin main
```

### 2. Build in Azure Container Registry

```bash
az acr build \
  --registry mtsmcpregistry \
  --image addigy-mcp:latest \
  https://github.com/your-org/addigy-mcp.git
```

### 3. Deploy as Container App

```bash
az containerapp create \
  --name addigy-mcp \
  --resource-group MTS-MCPServerEnvironment \
  --environment mts-mcp-env \
  --image mtsmcpregistry.azurecr.io/addigy-mcp:latest \
  --registry-server mtsmcpregistry.azurecr.io \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars \
    PORT=8080 \
    ADDIGY_CLIENT_ID=your-v1-client-id \
    ADDIGY_CLIENT_SECRET=your-v1-client-secret \
    ADDIGY_API_TOKEN=your-v2-api-token
```

### 4. Verify

```bash
curl https://addigy-mcp.<your-suffix>.centralus.azurecontainerapps.io/health
```

MCP endpoint for Claude connectors:
```
https://addigy-mcp.<your-suffix>.centralus.azurecontainerapps.io/mcp
```
