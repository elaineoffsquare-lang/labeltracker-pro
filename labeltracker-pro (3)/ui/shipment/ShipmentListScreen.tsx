
import React, { useState } from 'react';
import { Product, Shipment, ShipmentStatus, ShipmentType } from '../../types';

interface ShipmentListScreenProps {
  shipments: Shipment[];
  products: Product[];
  addShipment: (shipment: Omit<Shipment, 'id'>) => void;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => void;
}

const ShipmentListScreen: React.FC<ShipmentListScreenProps> = ({ shipments, products, addShipment, updateShipmentStatus }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Shipment>>({
    shipmentType: ShipmentType.INBOUND,
    carrier: '',
    trackingNumber: '',
    origin: '',
    destination: '',
    productId: '',
    quantity: 0,
    invoiceNumber: '',
    status: ShipmentStatus.PENDING
  });

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.DELIVERED: return 'bg-emerald-500 text-white shadow-lg shadow-emerald-200';
      case ShipmentStatus.IN_TRANSIT: return 'bg-blue-600 text-white shadow-lg shadow-blue-200';
      case ShipmentStatus.PENDING: return 'bg-slate-100 text-slate-400';
      case ShipmentStatus.CANCELLED: return 'bg-red-500 text-white shadow-lg shadow-red-200';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newShipment: Omit<Shipment, 'id'> = {
      shipmentDateMillis: Date.now(),
      invoiceDateMillis: Date.now(),
      shipmentType: formData.shipmentType || ShipmentType.INBOUND,
      carrier: formData.carrier!,
      trackingNumber: formData.trackingNumber!,
      origin: formData.origin || '',
      destination: formData.destination || '',
      productId: formData.productId,
      quantity: formData.quantity || 0,
      invoiceNumber: formData.invoiceNumber!,
      status: formData.status || ShipmentStatus.PENDING
    };
    addShipment(newShipment);
    setShowAddForm(false);
    setFormData({
      shipmentType: ShipmentType.INBOUND,
      carrier: '',
      trackingNumber: '',
      origin: '',
      destination: '',
      productId: '',
      quantity: 0,
      invoiceNumber: '',
      status: ShipmentStatus.PENDING
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#1E293B] tracking-tight leading-none">Logistics Tracker</h2>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em] mt-3">Inbound Restocks & Outbound Logistics</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#0F172A] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-300 active:scale-95"
        >
          {showAddForm ? 'Cancel' : '+ New Shipment'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleCreateShipment} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Logistics Flow</label>
                <select 
                  value={formData.shipmentType} 
                  onChange={e => setFormData({...formData, shipmentType: e.target.value as ShipmentType})}
                  className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700"
                >
                  <option value={ShipmentType.INBOUND}>Restock (Inbound Purchase)</option>
                  <option value={ShipmentType.OUTBOUND}>Customer (Outbound Courier)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Courier Carrier</label>
                <input required value={formData.carrier || ''} onChange={e => setFormData({...formData, carrier: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700" placeholder="e.g. SF Express, DHL, FedEx" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Tracking Number</label>
                <input required value={formData.trackingNumber || ''} onChange={e => setFormData({...formData, trackingNumber: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700" placeholder="e.g. TRK123456" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Associated Product</label>
                <select value={formData.productId || ''} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700">
                  <option value="">None / Multiple</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.productName} [{p.size}]</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Quantity</label>
                <input type="number" min="0" value={formData.quantity || 0} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Invoice ID</label>
                <input value={formData.invoiceNumber || ''} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700" placeholder="e.g. INV-8822" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Departure (Origin)</label>
                <input value={formData.origin || ''} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700" placeholder="e.g. Shenzhen Port" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Arrival (Destination)</label>
                <input value={formData.destination || ''} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700" placeholder="e.g. MY Warehouse" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 h-[60px]">
                  Initialize Logistics
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Shipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shipments.map((s) => (
          <div key={s.id} className="bg-white border border-slate-50 rounded-[40px] p-10 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border ${
                s.shipmentType === ShipmentType.INBOUND 
                  ? 'bg-blue-50 text-blue-600 border-blue-100' 
                  : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
                {s.shipmentType === ShipmentType.INBOUND ? 'RESTOCK / INBOUND' : 'CUSTOMER / OUTBOUND'}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-200 group-hover:text-slate-400 transition-colors uppercase tracking-widest">{s.trackingNumber}</span>
            </div>

            <div className="mb-8 flex-grow">
              <h3 className="text-2xl font-black text-[#1E293B] tracking-tight mb-2 uppercase">{s.carrier}</h3>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-400 tracking-tight">
                <span className="truncate max-w-[120px]">{s.origin || 'N/A'}</span>
                <span className="text-slate-200">→</span>
                <span className="truncate max-w-[120px] text-slate-800">{s.destination || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status Milestone</p>
              <div className="flex items-center justify-between gap-1.5">
                {Object.values(ShipmentStatus).map((status) => {
                  const isActive = s.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => updateShipmentStatus(s.id, status)}
                      disabled={isActive}
                      className={`flex-1 text-[9px] font-black px-1 py-2.5 rounded-xl transition-all duration-300 border uppercase tracking-tighter ${
                        isActive 
                          ? getStatusColor(status) + ' border-transparent'
                          : 'bg-white text-slate-200 border-slate-50 hover:border-slate-200 hover:text-slate-300'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {shipments.length === 0 && !showAddForm && (
        <div className="bg-white border border-dashed border-slate-200 rounded-[60px] p-40 text-center animate-in zoom-in duration-700">
          <div className="text-8xl mb-10 grayscale opacity-20">🚛</div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Logistics Pipeline Clear</h3>
          <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">Start a new restock or shipment flow above</p>
        </div>
      )}
    </div>
  );
};

export default ShipmentListScreen;
