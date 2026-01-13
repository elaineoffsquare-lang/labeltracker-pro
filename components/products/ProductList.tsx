
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';

interface ProductListProps {
  products: Product[];
  onAdd: (p: Omit<Product, 'id'>) => void;
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAdd, onUpdate, onDelete, canManage }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({ 
    productName: '', 
    labelName: '',
    unitPrice: '', 
    stockQuantity: '', 
    minStockAlertLevel: '10',
    size: '',
    pcsPerRoll: '',
    lastInvoiceNumber: '',
    lastInvoiceDate: new Date().toISOString().split('T')[0]
  });

  const uniqueProductNames = useMemo(() => {
    const names = products.map(p => p.productName);
    return Array.from(new Set(names)).sort();
  }, [products]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productName: editingProduct.productName,
        labelName: editingProduct.labelName,
        unitPrice: editingProduct.unitPrice.toString(),
        stockQuantity: editingProduct.stockQuantity.toString(),
        minStockAlertLevel: editingProduct.minStockAlertLevel.toString(),
        size: editingProduct.size || '',
        pcsPerRoll: editingProduct.pcsPerRoll?.toString() || '',
        lastInvoiceNumber: editingProduct.lastInvoiceNumber || '',
        lastInvoiceDate: editingProduct.lastInvoiceDate 
          ? new Date(editingProduct.lastInvoiceDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      });
      setShowForm(true);
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const generateSKU = (name: string) => {
    const shortName = name.substring(0, 3).toUpperCase();
    const random = Math.floor(100 + Math.random() * 900);
    return `SKU-${shortName}-${random}`; 
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newData = { ...prev, productName: name };
      if (!editingProduct) {
        const match = products.find(p => p.productName.toLowerCase() === name.toLowerCase());
        if (match) {
          return {
            ...newData,
            size: match.size || prev.size,
            pcsPerRoll: match.pcsPerRoll?.toString() || prev.pcsPerRoll,
            unitPrice: match.unitPrice.toString() || prev.unitPrice,
            minStockAlertLevel: match.minStockAlertLevel.toString() || prev.minStockAlertLevel
          };
        }
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      productName: formData.productName,
      labelName: editingProduct?.labelName || formData.labelName || generateSKU(formData.productName),
      unitPrice: parseFloat(formData.unitPrice) || 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      minStockAlertLevel: parseInt(formData.minStockAlertLevel) || 0,
      size: formData.size || '-',
      pcsPerRoll: parseInt(formData.pcsPerRoll) || 0,
      lastInvoiceNumber: formData.lastInvoiceNumber || undefined,
      lastInvoiceDate: formData.lastInvoiceNumber ? new Date(formData.lastInvoiceDate).getTime() : undefined
    };

    if (editingProduct) {
      onUpdate({ ...editingProduct, ...productData });
    } else {
      onAdd(productData);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ 
      productName: '', 
      labelName: '',
      unitPrice: '', 
      stockQuantity: '', 
      minStockAlertLevel: '10',
      size: '',
      pcsPerRoll: '',
      lastInvoiceNumber: '',
      lastInvoiceDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleExport = () => {
    if (products.length === 0) {
      alert("No products to export.");
      return;
    }

    const headers = [
      "ID", "SKU", "Product Name", "Size", "Pcs/Roll", 
      "Unit Price", "Stock Quantity", "Min Stock Level", 
      "Last Invoice #", "Last Invoice Date"
    ];
    
    const rows = products.map(p => [
      p.id,
      p.labelName,
      `"${p.productName.replace(/"/g, '""')}"`, // Handle quotes
      p.size || '',
      p.pcsPerRoll || '',
      p.unitPrice,
      p.stockQuantity,
      p.minStockAlertLevel,
      p.lastInvoiceNumber || '',
      p.lastInvoiceDate ? new Date(p.lastInvoiceDate).toLocaleDateString() : ''
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Product Catalog</h2>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1.5">Manage sizes, stock, and roll specs</p>
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
              onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              {showForm ? 'Close' : '+ New Product'}
            </button>
           )}
        </div>
      </div>

      {showForm && canManage && (
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Form fields... same as before */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Product Description</label>
                <input required list="existing-names" value={formData.productName} onChange={e => handleNameChange(e.target.value)} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all" placeholder="e.g. Premium Matte Vinyl" />
                <datalist id="existing-names">{uniqueProductNames.map(name => <option key={name} value={name} />)}</datalist>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Size / Specification</label>
                <input required value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all" placeholder="e.g. 10cm x 15cm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <label className="text-[10px] font-black text-blue-600 uppercase block mb-3 tracking-widest">Pieces per Roll</label>
                <input type="number" value={formData.pcsPerRoll} onChange={e => setFormData({...formData, pcsPerRoll: e.target.value})} className="w-full bg-blue-50/30 border-blue-50 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-blue-700 placeholder:text-blue-200 transition-all" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Unit Price ($)</label>
                <input type="number" step="any" min="0" required value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Current Stock (Rolls)</label>
                <input type="number" min="0" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Low Stock Alert Level</label>
                <input type="number" min="0" value={formData.minStockAlertLevel} onChange={e => setFormData({...formData, minStockAlertLevel: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all" placeholder="5" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Last Invoice Number</label>
                <input value={formData.lastInvoiceNumber} onChange={e => setFormData({...formData, lastInvoiceNumber: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all" placeholder="e.g. INV-9921" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Purchase Date</label>
                <input type="date" value={formData.lastInvoiceDate} onChange={e => setFormData({...formData, lastInvoiceDate: e.target.value})} className="w-full bg-[#F8FAFC] border-slate-100 border p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all" />
              </div>
            </div>
            <div className="flex justify-end items-center space-x-6 pt-4 border-t border-slate-50">
               <button type="button" onClick={resetForm} className="px-10 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
               <button type="submit" className="px-16 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-95">
                {editingProduct ? 'Update Entry' : 'Create Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-slate-100">
               <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product & Size</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Qty / Roll</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price Record</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice Ref</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">In Stock</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => {
                const low = p.stockQuantity <= p.minStockAlertLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <div className="font-black text-[#1E293B] text-lg tracking-tight mb-2">{p.productName}</div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-tighter border border-blue-100/50">
                        {p.size}
                      </span>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className="text-sm font-black text-slate-700 mb-0.5">{p.pcsPerRoll}</div>
                      <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest">PCS</div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="text-base font-black text-slate-900 mb-1">${p.unitPrice.toFixed(2)}</div>
                      <div className="font-mono text-[10px] text-slate-300 font-bold uppercase tracking-widest">{p.labelName}</div>
                    </td>
                    <td className="px-6 py-8">
                      {p.lastInvoiceNumber ? (
                        <div className="text-[11px] text-slate-400 font-bold italic">Ref: {p.lastInvoiceNumber}</div>
                      ) : (
                        <span className="text-xs text-slate-200 italic font-medium">No record</span>
                      )}
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-black tracking-tight border ${
                        low 
                        ? 'bg-red-50 text-red-500 border-red-100 shadow-sm shadow-red-50' 
                        : 'bg-emerald-50 text-emerald-500 border-emerald-100 shadow-sm shadow-emerald-50'
                      }`}>
                        {p.stockQuantity}
                        {low && <span className="ml-1.5">⚠️</span>}
                      </div>
                      <div className="text-[9px] text-slate-300 font-black uppercase mt-1.5 tracking-widest">ROLLS</div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {canManage && (
                        <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => setEditingProduct(p)} className="w-10 h-10 bg-white border border-slate-100 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            ✏️
                          </button>
                          <button onClick={() => onDelete(p.id)} className="w-10 h-10 bg-white border border-slate-100 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
