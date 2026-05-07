import React, { useState } from 'react';
import { manuallyValidateLane } from '../api/api';

const VALIDATION_STATUSES = [
  { value: 'VALID', label: 'Valid', description: 'Mark this lane as manually validated and approved.' },
  { value: 'INVALID', label: 'Invalid', description: 'Mark this lane as invalid or rejected.' },
  { value: 'PENDING', label: 'Pending', description: 'Reset to pending status for re-validation.' },
];

const LaneManualValidationModal = ({ lane, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(lane?.validationStatus || 'VALID');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await manuallyValidateLane(lane.id, selectedStatus, note.trim() || null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update validation status');
      console.error('Manual validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'VALID':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'INVALID':
        return 'border-red-500 bg-red-50 text-red-700';
      case 'PENDING':
        return 'border-amber-500 bg-amber-50 text-amber-700';
      default:
        return 'border-gray-300 bg-white text-gray-700';
    }
  };

  const laneName = lane ? `${lane.originCity || lane.originStation || '?'} → ${lane.destinationCity || lane.destinationStation || '?'}` : 'Lane';

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[480px] max-w-[90vw] z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Manual Lane Validation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Manually set the validation status for lane:
        </p>
        <p className="text-sm font-semibold text-gray-800 mb-4">
          {laneName} (ID: {lane?.id})
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Status Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validation Status
            </label>
            <div className="space-y-2">
              {VALIDATION_STATUSES.map(status => (
                <label
                  key={status.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedStatus === status.value
                      ? getStatusColor(status.value)
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="validationStatus"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">{status.label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{status.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="mb-4">
            <label htmlFor="validationNote" className="block text-sm font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              id="validationNote"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Add a reason or note for this manual validation..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Validation'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LaneManualValidationModal;