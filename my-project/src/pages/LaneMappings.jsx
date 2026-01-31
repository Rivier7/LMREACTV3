import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaneMappingExcel, getAllLaneMappings } from '../api/api';
import LaneMappingModel from '../components/LaneMappingModel';
import FileUploader from '../components/FileUploader';
import Header from '../components/Header';

const LaneMappings = () => {
  const navigate = useNavigate();
  const [laneMappings, setLaneMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedLaneMappingId, setSelectedLaneMappingId] = useState(null);

  const handleSelectLaneMapping = laneMappingId => {
    navigate(`/laneMappingLanes/${laneMappingId}`);
  };

  const loadLaneMappings = async () => {
    try {
      const mappings = await getAllLaneMappings();
      if (!mappings || mappings.length === 0) {
        setError('No data available');
      } else {
        setLaneMappings(mappings);
      }
    } catch (error) {
      setError('Error loading data');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaneMappings();
  }, []);

  const handleDeleteClick = id => {
    setSelectedLaneMappingId(id);
    setShowRemoveModal(true);
  };

  const handleRemoveLaneMapping = async id => {
    setShowRemoveModal(false);
    setLoading(true);
    await loadLaneMappings();
  };

  return (
    <>
      <Header />
      <main className="px-6 py-8 max-w-7xl mx-auto font-sans">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Lane Mappings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage lane mappings, download data, or select a lane mapping to work with.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <FileUploader />
            {/* optional: simple search / filter placeholder */}
            <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
              <svg
                className="w-4 h-4 text-gray-400 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386a1 1 0 01-1.414 1.415l-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                placeholder="Filter lane mappings"
                className="outline-none text-sm text-gray-700 placeholder-gray-400"
                aria-label="Filter lane mappings"
                // onChange can be wired later
              />
            </div>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="w-full py-12 flex justify-center">
            <p className="text-gray-600">Loading lane mappings…</p>
          </div>
        )}

        {error && !loading && (
          <div className="w-full py-6 flex justify-center">
            <p className="text-red-600 bg-red-50 px-4 py-2 rounded-md shadow-sm">{error}</p>
          </div>
        )}

        {/* Grid of lane mapping cards */}
        {!loading && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {laneMappings.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white border border-dashed border-gray-200 rounded-md">
                <p className="text-gray-500">
                  No lane mappings available. Try uploading a file or refresh.
                </p>
              </div>
            ) : (
              laneMappings.map(laneMapping => {
                const initials = (laneMapping.name || '')
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <article
                    key={laneMapping.id}
                    className="relative flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                    aria-labelledby={`laneMapping-${laneMapping.id}-name`}
                  >
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(laneMapping.id)}
                      aria-label={`Delete lane mapping ${laneMapping.name}`}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 focus:outline-none"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M6 6l8 8M14 6L6 14" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-full text-lg font-semibold text-white"
                      style={{ backgroundColor: laneMapping.randomColor || '#6b7280' }}
                      aria-hidden="true"
                    >
                      {initials || 'L'}
                    </div>

                    {/* Name & meta */}
                    <h2
                      id={`laneMapping-${laneMapping.id}-name`}
                      className="text-lg font-semibold text-gray-900"
                    >
                      {laneMapping.name}
                    </h2>
                    <p className="text-xs text-gray-400">ID: {laneMapping.id}</p>

                    {/* Actions */}
                    <div className="mt-3 w-full flex gap-2">
                      <button
                        onClick={() => getLaneMappingExcel(laneMapping.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none"
                        aria-label={`Download excel for ${laneMapping.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M3 14a1 1 0 011-1h3v-4h6v4h3a1 1 0 110 2H4a1 1 0 01-1-1z" />
                          <path d="M9 3h2v6H9V3z" />
                        </svg>
                        Download
                      </button>

                      <button
                        onClick={() => handleSelectLaneMapping?.(laneMapping.id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                        aria-label={`Select ${laneMapping.name}`}
                      >
                        Select
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}

        {/* Remove modal */}
        {showRemoveModal && (
          <LaneMappingModel
            laneMappingId={selectedLaneMappingId}
            onClose={() => setShowRemoveModal(false)}
            onRemove={handleRemoveLaneMapping}
          />
        )}
      </main>
    </>
  );
};

export default LaneMappings;
