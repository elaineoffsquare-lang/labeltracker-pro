
import { Product, Order, Shipment, User, UserRole, ShipmentStatus, ShipmentType, PaymentStatus } from '../types';

const STORAGE_KEY = 'labeltracker_pro_unified_db';
const CONFIG_KEY = 'labeltracker_sys_config';

interface SystemConfig {
  serverUrl: string;
  isCloudEnabled: boolean;
  isAutoSyncEnabled: boolean;
  connectionMode: 'LAN' | 'VPN';
}

export interface DatabaseSchema {
  version: string;
  lastSync: number;
  products: Product[];
  orders: Order[];
  shipments: Shipment[];
  users: User[];
}

const INITIAL_STATE: DatabaseSchema = {
  version: '4.0.0-unified',
  lastSync: Date.now(),
  products: [
    { id: 'p1', productName: 'Premium Matte Vinyl', labelName: 'SKU-PMV-01', unitPrice: 22.50, stockQuantity: 150, minStockAlertLevel: 20, size: '10cm x 15cm', pcsPerRoll: 500, lastInvoiceNumber: 'INV-2024-981', lastInvoiceDate: Date.now() - 200000000 },
    { id: 'p2', productName: 'High Gloss Finish', labelName: 'SKU-HGF-02', unitPrice: 28.00, stockQuantity: 8, minStockAlertLevel: 10, size: 'A4 Sheet', pcsPerRoll: 100, lastInvoiceNumber: 'INV-2024-982', lastInvoiceDate: Date.now() - 500000000 },
    { id: 'p3', productName: 'Thermal Transfer Ribbon', labelName: 'SKU-TTR-03', unitPrice: 45.00, stockQuantity: 40, minStockAlertLevel: 15, size: '110mm x 300m', lastInvoiceNumber: 'INV-2024-983', lastInvoiceDate: Date.now() - 100000000 },
  ],
  orders: [
      { id: 'o1', orderNumber: 'ORD-001', customerName: 'Acme Corporation', productId: 'p1', productName: 'Premium Matte Vinyl', quantity: 10, sellingPrice: 22.50, totalAmount: 225.00, orderDate: Date.now() - 86400000, paymentStatus: PaymentStatus.PAID, invoiceNumber: 'SI-2024-001' },
      { id: 'o2', orderNumber: 'ORD-002', customerName: 'Globex Inc.', productId: 'p2', productName: 'High Gloss Finish', quantity: 5, sellingPrice: 28.00, totalAmount: 140.00, orderDate: Date.now() - 172800000, paymentStatus: PaymentStatus.CREDIT, invoiceNumber: 'SI-2024-002' }
  ],
  shipments: [
    { id: 's1', trackingNumber: 'TRK12345XYZ', carrier: 'SF Express', origin: 'Shenzhen, CN', destination: 'Kuala Lumpur, MY', shipmentDateMillis: Date.now() - 259200000, etaMillis: Date.now() + 86400000, status: ShipmentStatus.IN_TRANSIT, notes: 'Awaiting customs clearance.', productId: 'p3', shipmentType: ShipmentType.INBOUND, quantity: 20, invoiceNumber: 'INV-2024-983' }
  ],
  users: [
    { id: 'u1', username: 'admin', displayName: 'System Admin', role: UserRole.ADMIN }
  ]
};

export const db = {
  getConfig: (): SystemConfig => {
    const cfg = localStorage.getItem(CONFIG_KEY);
    return cfg ? JSON.parse(cfg) : { serverUrl: '', isCloudEnabled: false };
  },

  saveConfig: (cfg: SystemConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event('db_updated'));
  },

  get: (): DatabaseSchema => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        db.save(INITIAL_STATE);
        return INITIAL_STATE;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_STATE;
    }
  },

  save: (data: DatabaseSchema) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastSync: Date.now()
    }));
    window.dispatchEvent(new Event('db_updated'));
  },

  /**
   * THE LINK: This is where the phone and web connect.
   * If a serverUrl is set, it pushes local data to your internal network server.
   */
  sync: async (): Promise<{success: boolean, message: string}> => {
    const config = db.getConfig();
    if (!config.serverUrl) return { success: false, message: "No Server URL configured." };

    try {
      // In a real setup, you would use:
      // const response = await fetch(`${config.serverUrl}/api/sync`, {
      //   method: 'POST',
      //   body: JSON.stringify(db.get())
      // });
      
      // Simulating network call to your internal infrastructure
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      db.save({ ...db.get(), lastSync: Date.now() });
      return { success: true, message: "Synchronized with " + config.serverUrl };
    } catch (e) {
      return { success: false, message: "Connection to server failed." };
    }
  },

  reset: () => {
    if (confirm('Are you sure you want to factory reset? This will delete ALL data.')) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
  }
};
