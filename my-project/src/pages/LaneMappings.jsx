import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaneMappingExcel, getAllLaneMappings, validateLaneMapping } from '../api/api';
import LaneMappingModel from '../components/LaneMappingModel';
import EditLaneMappingModal from '../components/EditLaneMappingModal';
import FileUploader from '../components/FileUploader';
import Header from '../components/Header';

/**
 * Determine the overall validation status for a lane mapping based on its lanes.
 * Returns 'all_valid' | 'has_invalid' | 'pending' | 'unknown'
 */
const getValidationSummary = laneMapping => {
  const lanes = laneMapping.lanes;
  if (!lanes || lanes.length === 0) return 'unknown';

  let hasPending = false;
  let hasInvalid = false;

  for (const lane of lanes) {
    const status = lane.validationStatus;
    if (status === 'PENDING') hasPending = true;
    else if (status === 'INVALID') hasInvalid = true;
  }

  if (hasInvalid) return 'has_invalid';
  if (hasPending) return 'pending';
  return 'all_valid';
};

const ValidationBadge = ({ summary }) => {
  switch (summary) {
    case 'all_valid':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          All Validated
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pending Validation
        </span>
      );
    case 'has_invalid':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Has Invalid
        </span>
      );
    default:
      return null;
  }
};

const LaneMappings = () => {
  const navigate = useNavigate();
  const [laneMappings, setLaneMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLaneMappingId, setSelectedLaneMappingId] = useState(null);
  const [validatingIds, setValidatingIds] = useState(new Set());

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

  const handleEditClick = id => {
    setSelectedLaneMappingId(id);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await loadLaneMappings();
  };

  const handleRemoveLaneMapping = async id => {
    setShowRemoveModal(false);
    setLoading(true);
    await loadLaneMappings();
  };

  const handleValidate = async id => {
    setValidatingIds(prev => new Set(prev).add(id));
    try {
      await validateLaneMapping(id);
      await loadLaneMappings();
    } catch (error) {
      console.error('Validation failed:', error);
      alert(error.message || 'Validation failed');
    } finally {
      setValidatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
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
              />
            </div>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="w-full py-12 flex justify-center">
            <p className="text-gray-600">Loading lane mappings...</p>
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
                const validationSummary = getValidationSummary(laneMapping);
                const isValidating = validatingIds.has(laneMapping.id);
                const hasPendingLanes = validationSummary === 'pending';
                return (
                  <article
                    key={laneMapping.id}
                    className="relative flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                    aria-labelledby={`laneMapping-${laneMapping.id}-name`}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleEditClick(laneMapping.id)}
                        aria-label={`Edit lane mapping ${laneMapping.name}`}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200 focus:outline-none"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(laneMapping.id)}
                        aria-label={`Delete lane mapping ${laneMapping.name}`}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 focus:outline-none"
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
                    </div>

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

                    {/* Validation Status Badge */}
                    <ValidationBadge summary={validationSummary} />

                    {/* Actions */}
                    <div className="mt-3 w-full flex flex-col gap-2">
                      <div className="flex gap-2">
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

                      {/* Validate button - only shown for pending lanes */}
                      {hasPendingLanes && (
                        <button
                          onClick={() => handleValidate(laneMapping.id)}
                          disabled={isValidating}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Validate lanes for ${laneMapping.name}`}
                        >
                          {isValidating ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Validating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Validate All Lanes
                            </>
                          )}
                        </button>
                      )}
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

        {/* Edit modal */}
        {showEditModal && (
          <EditLaneMappingModal
            laneMappingId={selectedLaneMappingId}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </main>
    </>
  );
};

export default LaneMappings;
