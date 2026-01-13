
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screen } from './navigation/Screen';
import Layout from './components/Layout';
import LoginPage from './ui/auth/LoginPage';
import InitialSetup from './ui/auth/InitialSetup';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import OrderList from './components/orders/OrderList';
import ShipmentListScreen from './ui/shipment/ShipmentListScreen';
import HelpScreen from './ui/help/HelpScreen';
import SystemScreen from './ui/system/SystemScreen';
import UserManagementScreen from './ui/system/UserManagementScreen';
import { db, DatabaseSchema } from './services/db';
import { Product, Order, Shipment, ShipmentStatus, ShipmentType, User, UserRole, Group } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConfigured, setIsConfigured] = useState(true); 
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Dashboard);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [dbState, setDbState] = useState<DatabaseSchema>(db.get());
  const autoSyncIntervalRef = useRef<number | null>(null);

  const refreshData = useCallback(() => {
    setDbState(db.get());
  }, []);

  useEffect(() => {
    const handleDbUpdate = () => {
      refreshData();
      setupAutoSync(); 
    };
    window.addEventListener('db_updated', handleDbUpdate);
    setupAutoSync(); 

    return () => {
      window.removeEventListener('db_updated', handleDbUpdate);
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
      }
    };
  }, [refreshData]);

  const setupAutoSync = () => {
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
      autoSyncIntervalRef.current = null;
    }
    
    const config = db.getConfig();
    if (config.isAutoSyncEnabled && config.serverUrl) {
      autoSyncIntervalRef.current = window.setInterval(async () => {
        if (syncStatus !== 'SYNCING') {
          setSyncStatus('SYNCING');
          const result = await db.sync();
          setSyncStatus(result.success ? 'SUCCESS' : 'ERROR');
          setTimeout(() => setSyncStatus('IDLE'), 2000);
        }
      }, 30000);
    }
  };

  const updateDb = (updater: (prevState: DatabaseSchema) => DatabaseSchema) => {
    const newState = updater(dbState);
    db.save(newState);
  };

  const handleAddOrder = (o: Omit<Order, 'id' | 'orderNumber' | 'totalAmount'>) => {
    updateDb(s => {
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
    });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsConfigured(true);
    setCurrentScreen(Screen.Dashboard);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen(Screen.Dashboard); // Reset screen to default
  };

  const handleInitialSetupComplete = (admin: User, group: Group) => {
    updateDb(s => ({
      ...s,
      groups: [...s.groups, group],
      users: [...s.users, admin]
    }));
    setCurrentUser(admin);
    setIsConfigured(true); 
    setCurrentScreen(Screen.Dashboard);
  };

  const handleConfigSaved = () => {
    setIsConfigured(true);
    setCurrentScreen(Screen.Dashboard);
  };

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
        onAdd={handleAddOrder}
        onDelete={(id: string) => updateDb(s => {
          const order = s.orders.find(o => o.id === id);
          if (!order) return s;
          const updatedProducts = s.products.map(p => p.id === order.productId ? { ...p, stockQuantity: p.stockQuantity + order.quantity } : p);
          return {...s, products: updatedProducts, orders: s.orders.filter(o => o.id !== id)};
        })}
      />;
      case Screen.Shipments: return <ShipmentListScreen 
        shipments={dbState.shipments}
        products={dbState.products}
        addShipment={(shipment: Omit<Shipment, 'id'>) => updateDb(s => ({...s, shipments: [{...shipment, id: `s${Date.now()}`}, ...s.shipments]}))}
        updateShipmentStatus={(id: string, status: ShipmentStatus) => updateDb(s => ({...s, shipments: s.shipments.map(sh => sh.id === id ? {...sh, status} : sh)}))}
      />;
      case Screen.UserMgmt: return <UserManagementScreen dbState={dbState} onUpdate={updateDb} />;
      case Screen.Help: return <HelpScreen />;
      case Screen.Users: return <SystemScreen setSyncStatus={setSyncStatus} dbState={dbState} />;
      default: return <Dashboard state={dbState} />;
    }
  };

  if (dbState.users.length === 0) {
    return <InitialSetup onComplete={handleInitialSetupComplete} />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={currentScreen.toLowerCase()} 
      setActiveTab={(tabId) => {
          // Explicit mapping from Layout ID to Screen Enum
          const mapping: Record<string, Screen> = {
            'dashboard': Screen.Dashboard,
            'products': Screen.Products,
            'orders': Screen.Orders,
            'shipments': Screen.Shipments,
            'users': Screen.Users,
            'help': Screen.Help,
            'user_mgmt': Screen.UserMgmt
          };
          const target = mapping[tabId] || Screen.Dashboard;
          setCurrentScreen(target);
      }} 
      currentUser={{ 
        name: currentUser.displayName, 
        role: currentUser.role,
        syncStatus: syncStatus
      }}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
