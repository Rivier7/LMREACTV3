import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createLane } from '../api/api';

const LANE_OPTIONS = ['Primary', 'Secondary', 'Alternative'];

const field = (label, key, placeholder, required = false) => ({ label, key, placeholder, required });

const FIELDS = [
  field('Item Number', 'itemNumber', 'e.g. ITEM-001', true),
  field('Lane Option', 'laneOption', '', true),
  field('Service Level', 'serviceLevel', ''),
  field('Pick Up Time', 'pickUpTime', 'e.g. 08:00'),
  field('Origin City', 'originCity', 'e.g. Raleigh', true),
  field('Origin State', 'originState', 'e.g. NC'),
  field('Origin Country', 'originCountry', 'e.g. US'),
  field('Destination City', 'destinationCity', 'e.g. Orlando', true),
  field('Destination State', 'destinationState', 'e.g. FL'),
  field('Destination Country', 'destinationCountry', 'e.g. US'),
];

const inputCls =
  'w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500';

const CreateLaneModal = ({ laneMappingId, onClose, onCreated }) => {
  const [form, setForm] = useState({ laneOption: 'Primary', serviceLevel: 'Air' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!form.itemNumber?.trim()) { setError('Item Number is required.'); return; }
    if (!form.originCity?.trim()) { setError('Origin City is required.'); return; }
    if (!form.destinationCity?.trim()) { setError('Destination City is required.'); return; }

    setLoading(true);
    try {
      const payload = { ...form, laneMappingId: Number(laneMappingId) };
      const created = await createLane(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create lane.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[520px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Create New Lane</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Identity */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Item Number <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  placeholder="e.g. ITEM-001"
                  value={form.itemNumber || ''}
                  onChange={e => set('itemNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lane Option <span className="text-red-500">*</span></label>
                <select className={inputCls} value={form.laneOption} onChange={e => set('laneOption', e.target.value)}>
                  {LANE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Service Level</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Air, Direct Drive"
                  value={form.serviceLevel || ''}
                  onChange={e => set('serviceLevel', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pick Up Time</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 08:00"
                  value={form.pickUpTime || ''}
                  onChange={e => set('pickUpTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Origin */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Origin</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  placeholder="e.g. Raleigh"
                  value={form.originCity || ''}
                  onChange={e => set('originCity', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <input
                  className={inputCls}
                  placeholder="e.g. NC"
                  value={form.originState || ''}
                  onChange={e => set('originState', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <input
                  className={inputCls}
                  placeholder="e.g. US"
                  value={form.originCountry || ''}
                  onChange={e => set('originCountry', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Destination</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  placeholder="e.g. Orlando"
                  value={form.destinationCity || ''}
                  onChange={e => set('destinationCity', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <input
                  className={inputCls}
                  placeholder="e.g. FL"
                  value={form.destinationState || ''}
                  onChange={e => set('destinationState', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <input
                  className={inputCls}
                  placeholder="e.g. US"
                  value={form.destinationCountry || ''}
                  onChange={e => set('destinationCountry', e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Lane'}
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateLaneModal;
