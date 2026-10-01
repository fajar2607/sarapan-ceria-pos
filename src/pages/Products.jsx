import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

const Products = () => {
  const { products, vendors, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', basePrice: '', salePrice: '', vendorId: '' });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVendorName = (vendorId) => {
    if (!vendorId) return '-';
    const v = vendors.find(v => v.id === vendorId);
    return v ? v.name : '-';
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', basePrice: '', salePrice: '', vendorId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, basePrice: product.basePrice, salePrice: product.salePrice, vendorId: product.vendorId || '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      basePrice: Number(formData.basePrice),
      salePrice: Number(formData.salePrice)
    };

    if (editingId) {
      updateProduct(editingId, dataToSave);
    } else {
      addProduct(dataToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <div className="search-bar" style={{ marginBottom: 0, flex: 1, maxWidth: '400px' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Cari produk..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      <div className="table-container">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={32} />
            </div>
            <h3>Produk tidak ditemukan</h3>
            <p>Tambahkan produk baru untuk melihatnya di sini.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Vendor</th>
                <th>Harga Modal</th>
                <th>Harga Jual</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="font-bold">{product.name}</td>
                  <td>{getVendorName(product.vendorId)}</td>
                  <td>Rp {Number(product.basePrice).toLocaleString()}</td>
                  <td>Rp {Number(product.salePrice).toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-icon" onClick={() => openEditModal(product)}>
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon danger" onClick={() => deleteProduct(product.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Produk" : "Tambah Produk Baru"}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!formData.name}>Simpan</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nama Produk</label>
          <input 
            type="text" 
            className="form-input" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="misal: Roti Coklat"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Vendor</label>
          <select 
            className="form-input" 
            value={formData.vendorId} 
            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
          >
            <option value="">-- Umum (Tanpa Vendor) --</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Harga Modal Standar (Rp)</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Harga Jual Standar (Rp)</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
