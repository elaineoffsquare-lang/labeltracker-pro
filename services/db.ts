
import { Product, Order, Shipment, User, UserRole, ShipmentStatus, ShipmentType, PaymentStatus, Group, Permission } from '../types';

const STORAGE_KEY = 'labeltracker_pro_unified_db';
const CONFIG_KEY = 'labeltracker_sys_config';

interface SystemConfig {
  serverUrl: string;
  lanPath: string;
  vpnPath: string;
  isCloudEnabled: boolean;
  isAutoSyncEnabled: boolean;
  connectionMode: 'LAN' | 'VPN';
  rememberServerUrl: boolean;
}

export interface DatabaseSchema {
  version: string;
  lastSync: number;
  products: Product[];
  orders: Order[];
  shipments: Shipment[];
  users: User[];
  groups: Group[];
}

const INITIAL_STATE: DatabaseSchema = {
  version: '4.2.0-bootstrap',
  lastSync: Date.now(),
  products: [
    { id: 'p1', productName: 'Premium Matte Vinyl', labelName: 'SKU-PMV-01', unitPrice: 22.50, stockQuantity: 150, minStockAlertLevel: 20, size: '10cm x 15cm', pcsPerRoll: 500, lastInvoiceNumber: 'INV-2024-981', lastInvoiceDate: Date.now() - 200000000 },
    { id: 'p2', productName: 'High Gloss Finish', labelName: 'SKU-HGF-02', unitPrice: 28.00, stockQuantity: 8, minStockAlertLevel: 10, size: 'A4 Sheet', pcsPerRoll: 100, lastInvoiceNumber: 'INV-2024-982', lastInvoiceDate: Date.now() - 500000000 },
  ],
  orders: [],
  shipments: [],
  groups: [
    { id: 'g-admin', name: 'Administrators', permissions: Object.values(Permission) },
    { id: 'g-warehouse', name: 'Warehouse', permissions: [Permission.MANAGE_INVENTORY, Permission.MANAGE_ORDERS, Permission.MANAGE_LOGISTICS, Permission.VIEW_REPORTS] },
    { id: 'g-sales', name: 'Sales', permissions: [Permission.MANAGE_ORDERS, Permission.VIEW_REPORTS] },
  ],
  users: [
    { id: 'u-initial', username: 'admin', password: 'password', displayName: 'Default Admin', role: UserRole.ADMIN, groupId: 'g-admin' }
  ]
};

export const db = {
  getConfig: (): SystemConfig => {
    const defaults = { 
      serverUrl: '', 
      lanPath: '',
      vpnPath: '',
      isCloudEnabled: false, 
      isAutoSyncEnabled: false, 
      connectionMode: 'LAN' as 'LAN' | 'VPN', 
      rememberServerUrl: true 
    };
    const cfgStr = localStorage.getItem(CONFIG_KEY);
    if (!cfgStr) return defaults;

    try {
      const cfg = JSON.parse(cfgStr);
      
      // Ensure rememberServerUrl exists for older configs
      if (cfg.rememberServerUrl === undefined) {
        cfg.rememberServerUrl = true;
      }
      
      if (!cfg.rememberServerUrl) {
        cfg.serverUrl = '';
      }

      return { ...defaults, ...cfg };
    } catch (e) {
      return defaults;
    }
  },

  saveConfig: (cfg: SystemConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event('db_updated'));
  },

  get: (): DatabaseSchema => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        // We don't save INITIAL_STATE here immediately to let App.tsx detect length 0
        return INITIAL_STATE;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.groups) parsed.groups = [];
      if (!parsed.users) parsed.users = [];
      return parsed;
    } catch (e) {
      return INITIAL_STATE;
    }
  },

  save: (data: DatabaseSchema, options?: { silent?: boolean }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastSync: Date.now()
    }));
    if (!options?.silent) {
      window.dispatchEvent(new Event('db_updated'));
    }
  },

  sync: async (): Promise<{success: boolean, message: string}> => {
    const config = db.getConfig();
    if (!config.serverUrl) return { success: false, message: "No Server URL configured." };
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, message: "Synchronized with " + config.serverUrl };
    } catch (e) {
      return { success: false, message: "Connection to server failed." };
    }
  },

  reset: () => {
    if (confirm('Are you sure you want to factory reset? This will delete ALL data and force a new setup.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CONFIG_KEY);
        window.location.reload();
    }
  }
};
