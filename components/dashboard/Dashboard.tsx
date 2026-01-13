
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AppState } from '../../types';
import { getInventoryInsights } from '../../services/gemini';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [insight, setInsight] = useState<string>("Analyzing your inventory data...");
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const text = await getInventoryInsights(state);
      setInsight(text);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [state.products.length, state.orders.length]);

  const totalProducts = state.products.length;
  const totalRevenue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lowStockCount = state.products.filter(p => p.stockQuantity <= p.minStockAlertLevel).length;
  const activeShipments = state.shipments.filter(s => s.status !== 'DELIVERED').length;

  const chartData = state.products.map(p => ({
    name: p.productName.substring(0, 10),
    stock: p.stockQuantity,
    min: p.minStockAlertLevel
  }));

  const revenueData = [
    { name: 'Mon', rev: 400 },
    { name: 'Tue', rev: 300 },
    { name: 'Wed', rev: 600 },
    { name: 'Thu', rev: 800 },
    { name: 'Fri', rev: 500 },
    { name: 'Sat', rev: 900 },
    { name: 'Sun', rev: 1100 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Products', val: totalProducts, icon: '📦', color: 'blue' },
          { label: 'Total Revenue', val: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: 'green' },
          { label: 'Low Stock Alerts', val: lowStockCount, icon: '⚠️', color: 'red' },
          { label: 'Pending Shipments', val: activeShipments, icon: '🚚', color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`text-3xl p-3 bg-${stat.color}-50 rounded-lg`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-xl">✨</span>
          <h3 className="text-lg font-bold">Gemini Business Insights</h3>
        </div>
        {loadingInsight ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        ) : (
          <p className="text-blue-50 leading-relaxed font-medium">
            {insight}
          </p>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Inventory Levels</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="min" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Weekly Revenue Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
