import React, { useState, useEffect } from 'react';
import { getLaneMappingById } from '../api/api';
import { useUpdateLaneMappingName } from '../hooks/useLaneMappingQueries';

const EditLaneMappingModal = ({ laneMappingId, onClose, onSuccess }) => {
  const [laneMapping, setLaneMapping] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateNameMutation = useUpdateLaneMappingName();

  useEffect(() => {
    const loadLaneMapping = async () => {
      try {
        const data = await getLaneMappingById(laneMappingId);
        if (!data || Object.keys(data).length === 0) {
          setError('No data available');
        } else {
          setLaneMapping(data);
          setName(data.name || '');
        }
      } catch (err) {
        setError('Error loading data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLaneMapping();
  }, [laneMappingId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      await updateNameMutation.mutateAsync({ id: laneMappingId, name: name.trim() });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to update name');
      console.error('Update error:', err);
    }
  };

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96 z-50">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96 z-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Lane Mapping Name</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="laneMappingName" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="laneMappingName"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter lane mapping name"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateNameMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateNameMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditLaneMappingModal;
