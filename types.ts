
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum Permission {
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',
  MANAGE_ORDERS = 'MANAGE_ORDERS',
  MANAGE_LOGISTICS = 'MANAGE_LOGISTICS',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_REPORTS = 'VIEW_REPORTS'
}

export interface Group {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  role: UserRole;
  groupId?: string;
}

export interface Product {
  id: string;
  productName: string;
  labelName: string; // SKU
  unitPrice: number;
  stockQuantity: number;
  minStockAlertLevel: number;
  size?: string;
  pcsPerRoll?: number;
  imageUri?: string;
  lastInvoiceNumber?: string;
  lastInvoiceDate?: number;
}

export enum PaymentStatus {
  PAID = 'PAID',
  CREDIT = 'CREDIT'
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalAmount: number;
  orderDate: number; // timestamp
  paymentStatus: PaymentStatus;
  invoiceNumber?: string;
  invoiceDateMillis?: number;
}

export enum ShipmentType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  shipmentDateMillis: number;
  etaMillis?: number;
  status: ShipmentStatus;
  notes?: string;
  productId?: string;
  shipmentType: ShipmentType;
  quantity?: number;
  invoiceNumber?: string;
  invoiceDateMillis?: number;
}

export interface AppState {
  products: Product[];
  orders: Order[];
  shipments: Shipment[];
  users: User[];
  groups: Group[];
}
