
import React, { useState, useEffect, useCallback } from 'react';
import { Screen } from './navigation/Screen';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import OrderList from './components/orders/OrderList';
import ShipmentListScreen from './ui/shipment/ShipmentListScreen';
import LiveAssistantScreen from './ui/live/LiveAssistantScreen';
import HelpScreen from './ui/help/HelpScreen';
import SystemScreen from './ui/system/SystemScreen';
import { db } from './services/db';
import { Product, Order, Shipment, ShipmentStatus, ShipmentType, PaymentStatus } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Dashboard);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [dbState, setDbState] = useState(db.get());

  const refreshData = useCallback(() => {
    setDbState(db.get());
  }, []);

  useEffect(() => {
    const handleDbUpdate = () => refreshData();
    window.addEventListener('db_updated', handleDbUpdate);
    return () => window.removeEventListener('db_updated', handleDbUpdate);
  }, [refreshData]);

  const updateDb = (updater: (prevState: typeof dbState) => typeof dbState) => {
    const newState = updater(dbState);
    db.save(newState);
    // No need to call refreshData, as the event listener will handle it.
  };
  
  const currentUser = dbState.users[0];

  const renderContent = () => {
    switch (currentScreen) {
      case Screen.Dashboard: return <Dashboard state={dbState} />;
      case Screen.Products: return <ProductList 
        products={dbState.products}
        onAdd={(p: Omit<Product, 'id'>) => updateDb(s => ({...s, products: [{...p, id: `p${Date.now()}`}, ...s.products]}))}
        onUpdate={(p: Product) => updateDb(s => ({...s, products: s.products.map(op => op.id === p.id ? p : op)}))}
        onDelete={(id: string) => updateDb(s => ({...s, products: s.products.filter(p => p.id !== id)}))}
      />;
      case Screen.Orders: return <OrderList 
        orders={dbState.orders}
        products={dbState.products}
        onAdd={(o: Omit<Order, 'id' | 'orderNumber' | 'totalAmount'>) => updateDb(s => {
          const product = s.products.find(p => p.id === o.productId);
          if (!product) return s;

          const newOrder: Order = {
            ...o,
            id: `o${Date.now()}`,
            orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
            totalAmount: o.sellingPrice * o.quantity,
          };
          
          const updatedProducts = s.products.map(p => 
            p.id === o.productId ? { ...p, stockQuantity: p.stockQuantity - o.quantity } : p
          );
          
          return {...s, products: updatedProducts, orders: [newOrder, ...s.orders]};
        })}
        onDelete={(id: string) => updateDb(s => {
          const order = s.orders.find(o => o.id === id);
          if (!order) return s;

          const updatedProducts = s.products.map(p => 
            p.id === order.productId ? { ...p, stockQuantity: p.stockQuantity + order.quantity } : p
          );

          return {...s, products: updatedProducts, orders: s.orders.filter(o => o.id !== id)};
        })}
      />;
      case Screen.Shipments: return <ShipmentListScreen 
        shipments={dbState.shipments}
        products={dbState.products}
        addShipment={(shipment: Omit<Shipment, 'id'>) => updateDb(s => {
          const newShipment: Shipment = {...shipment, id: `s${Date.now()}`};
          let products = s.products;
          
          // Instantly update stock if a delivered inbound shipment is added
          if (newShipment.productId && newShipment.quantity && newShipment.shipmentType === ShipmentType.INBOUND && newShipment.status === ShipmentStatus.DELIVERED) {
            products = s.products.map(p => 
              p.id === newShipment.productId ? { ...p, stockQuantity: p.stockQuantity + newShipment.quantity! } : p
            );
          }
          return {...s, products, shipments: [newShipment, ...s.shipments]};
        })}
        updateShipmentStatus={(id: string, status: ShipmentStatus) => updateDb(s => {
          const shipment = s.shipments.find(ship => ship.id === id);
          if (!shipment) return s;

          const oldStatus = shipment.status;
          const updatedShipments = s.shipments.map(ship => ship.id === id ? {...ship, status} : ship);
          let products = s.products;

          // Business Rule: On marking INBOUND as DELIVERED, increase stock
          if (shipment.productId && shipment.quantity && shipment.shipmentType === ShipmentType.INBOUND && oldStatus !== ShipmentStatus.DELIVERED && status === ShipmentStatus.DELIVERED) {
            products = s.products.map(p => {
              if (p.id === shipment.productId) {
                const updatedProduct = { ...p, stockQuantity: p.stockQuantity + shipment.quantity! };
                // Also update product's last invoice details
                if (shipment.invoiceNumber) {
                  updatedProduct.lastInvoiceNumber = shipment.invoiceNumber;
                  updatedProduct.lastInvoiceDate = shipment.invoiceDateMillis || Date.now();
                }
                return updatedProduct;
              }
              return p;
            });
          }
          return {...s, products, shipments: updatedShipments};
        })}
      />;
      // FIX: The LiveAssistantScreen component does not accept a 'state' prop.
      case Screen.LiveAssistant: return <LiveAssistantScreen />;
      case Screen.Help: return <HelpScreen />;
      case Screen.Users: return <SystemScreen setSyncStatus={setSyncStatus} />;
      default: return <Dashboard state={dbState} />;
    }
  };

  return (
    <Layout 
      activeTab={currentScreen.toLowerCase()} 
      setActiveTab={(tab) => setCurrentScreen(tab.toUpperCase() as Screen)} 
      currentUser={{ 
        name: currentUser?.displayName, 
        role: currentUser?.role,
        syncStatus: syncStatus
      }}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
