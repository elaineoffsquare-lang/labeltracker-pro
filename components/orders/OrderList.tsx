
import React, { useState } from 'react';
import { Order, Product, PaymentStatus } from '../../types';

interface OrderListProps {
  orders: Order[];
  products: Product[];
  onAdd: (o: Omit<Order, 'id' | 'orderNumber' | 'totalAmount'>) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ orders, products, onAdd, onDelete, canManage }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    productId: '', 
    customerName: '', 
    quantity: 1,
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentStatus: PaymentStatus.PAID
  });

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(prod => prod.id === formData.productId);
    if (!product) return;

    onAdd({
      productId: product.id,
      productName: `${product.productName} [${product.size || '-'}]`,
      quantity: formData.quantity,
      sellingPrice: product.unitPrice,
      orderDate: Date.now(),
      customerName: formData.customerName,
      invoiceNumber: formData.invoiceNumber || undefined,
      invoiceDateMillis: formData.invoiceNumber ? new Date(formData.invoiceDate).getTime() : undefined,
      paymentStatus: formData.paymentStatus
    });
    
    setShowForm(false);
    setFormData({ 
      productId: '', 
      customerName: '', 
      quantity: 1, 
      invoiceNumber: '', 
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentStatus: PaymentStatus.PAID
    });
  };

  const handleExport = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    
    const headers = [
      "ID", "Order #", "Customer Name", "Product Details", "Quantity (Rolls)",
      "Selling Price", "Total Amount", "Order Date", "Payment Status",
      "Invoice #", "Invoice Date"
    ];

    const rows = orders.map(o => [
      o.id,
      o.orderNumber,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.productName.replace(/"/g, '""')}"`,
      o.quantity,
      o.sellingPrice,
      o.totalAmount,
      new Date(o.orderDate).toLocaleString(),
      o.paymentStatus,
      o.invoiceNumber || '',
      o.invoiceDateMillis ? new Date(o.invoiceDateMillis).toLocaleDateString() : ''
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Sales Orders</h2>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1.5">Record daily walk-in and corporate sales</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExport}
            className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
          >
            Export CSV
          </button>
          {canManage && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95"
            >
              {showForm ? 'Cancel' : '+ New Order'}
            </button>
          )}
        </div>
      </div>

      {showForm && canManage && (
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleOrder} className="space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Select Product Category</label>
                <select 
                  required 
                  value={formData.productId} 
                  onChange={e => setFormData({...formData, productId: e.target.value})} 
                  className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-400 outline-none font-bold text-slate-700 transition-all"
                >
                  <option value="">Choose item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stockQuantity < formData.quantity}>
                      {p.productName} ({p.size || 'No Size'}) — {p.stockQuantity} rolls left
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Order Quantity (Rolls)</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={formData.quantity} 
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} 
                  className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-400 outline-none font-black text-slate-700" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Customer Name</label>
                <input 
                  required
                  value={formData.customerName} 
                  onChange={e => setFormData({...formData, customerName: e.target.value})} 
                  className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-400 outline-none font-bold text-slate-700" 
                  placeholder="e.g. Acme Corp" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <label className="text-[10px] font-black text-blue-600 uppercase block mb-3 tracking-widest">Sales Invoice Number</label>
                <input 
                  value={formData.invoiceNumber} 
                  onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} 
                  className="w-full bg-blue-50/30 border-blue-50 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-blue-700 placeholder:text-blue-200 transition-all" 
                  placeholder="e.g. INV-2024-001" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Invoice Date</label>
                <input 
                  type="date" 
                  value={formData.invoiceDate} 
                  onChange={e => setFormData({...formData, invoiceDate: e.target.value})} 
                  className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-400 outline-none font-bold text-slate-700 transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-orange-600 uppercase block mb-3 tracking-widest">Payment Status</label>
                <select 
                  value={formData.paymentStatus} 
                  onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}
                  className="w-full bg-orange-50/30 border-orange-50 border p-4 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-orange-700 transition-all"
                >
                  <option value={PaymentStatus.PAID}>Paid Full</option>
                  <option value={PaymentStatus.CREDIT}>On Credit (A/R)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-95 h-[60px]">
                  Submit Order
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-slate-100">
               <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Description</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Qty / Status</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer / Invoice</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <div className="font-black text-[#1E293B] text-lg tracking-tight mb-1">{o.productName}</div>
                      <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        {new Date(o.orderDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase mb-1 ${
                          o.paymentStatus === PaymentStatus.PAID 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {o.paymentStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {o.quantity} Rolls
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="font-black text-slate-900 text-sm mb-1">{o.customerName || 'Standard Walk-in'}</div>
                      {o.invoiceNumber ? (
                        <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center">
                          <span className="mr-1">📄</span> {o.invoiceNumber}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-200 italic">No invoice recorded</div>
                      )}
                    </td>
                    <td className="px-6 py-8 text-right">
                      <div className="text-xl font-black text-slate-900 tracking-tighter">${o.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {canManage && (
                        <button 
                          onClick={() => onDelete(o.id)} 
                          className="w-10 h-10 bg-white border border-slate-100 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
