import { useState } from 'react';
import type { FC } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import type { Coin } from '../types';

interface CoinsPageProps {
  coins: Coin[];
  refetch: () => void;
}

export const CoinsPage: FC<CoinsPageProps> = ({ coins, refetch }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const handleEdit = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCoin(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto pt-4 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Coin Management</h1>
          <p className="text-slate-400 text-sm">Create, edit, or delete coins from the database.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Coin
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/50 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-3">Currency</div>
          <div className="col-span-3">Blockchain</div>
          <div className="col-span-3">Price (USD)</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {coins.map((coin) => (
            <div key={coin.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors">
              <div className="col-span-3 font-medium flex items-center gap-3 text-white">
                {coin.iconFilename ? (
                  <img src={`/coins/${coin.iconFilename}`} alt={coin.currency} className="w-8 h-8 rounded-full bg-slate-800" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    {coin.currency[0]}
                  </div>
                )}
                {coin.currency}
              </div>
              <div className="col-span-3 text-slate-300">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 uppercase">
                  {coin.blockchain}
                </span>
              </div>
              <div className="col-span-3 font-mono text-slate-300">
                ${coin.price.toFixed(4)}
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <button 
                  onClick={() => handleEdit(coin)}
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(coin)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {coins.length === 0 && (
            <div className="p-8 text-center text-slate-500">No coins found in database.</div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditModal 
          coin={selectedCoin} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            setIsEditModalOpen(false);
            refetch();
          }} 
        />
      )}

      {isDeleteModalOpen && selectedCoin && (
        <DeleteModal 
          coin={selectedCoin} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            refetch();
          }} 
        />
      )}
    </div>
  );
};

interface EditModalProps {
  coin: Coin | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditModal: FC<EditModalProps> = ({ coin, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    currency: coin?.currency || '',
    blockchain: coin?.blockchain || '',
    price: coin?.price?.toString() || '',
    iconFilename: coin?.iconFilename || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!coin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currency || !formData.blockchain || !formData.price) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      date: coin?.date || new Date().toISOString()
    };

    try {
      const url = isEdit ? `http://localhost:3001/api/coins/${coin.id}` : 'http://localhost:3001/api/coins';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save coin');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Coin' : 'Add New Coin'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Currency Symbol *</label>
            <input 
              type="text" 
              required
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value.toUpperCase()})}
              placeholder="e.g. ETH"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Blockchain *</label>
            <input 
              type="text" 
              required
              value={formData.blockchain}
              onChange={e => setFormData({...formData, blockchain: e.target.value})}
              placeholder="e.g. Ethereum"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Price (USD) *</label>
            <input 
              type="number" 
              step="any"
              required
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              placeholder="0.00"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Icon Filename</label>
            <input 
              type="text" 
              value={formData.iconFilename}
              onChange={e => setFormData({...formData, iconFilename: e.target.value})}
              placeholder="e.g. Ethereum.svg"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Must match an SVG file in public/coins directory.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteModalProps {
  coin: Coin;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteModal: FC<DeleteModalProps> = ({ coin, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/coins/${coin.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      onSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500">
            <AlertTriangle size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white text-center mb-2">Delete Coin?</h2>
        <p className="text-slate-400 text-center text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-bold">{coin.currency}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
