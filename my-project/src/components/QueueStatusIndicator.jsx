import { useState, useRef, useEffect } from 'react';
import { Clock, X, Play, Loader2, ChevronDown, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useQueueStatus, useCancelQueue, useValidateAllPending, useRevalidateAll } from '../hooks/useQueueQueries';

const QueueStatusIndicator = ({ collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);

  // Only poll frequently when dropdown is open, otherwise poll slowly
  const { data: queueStatus, isLoading, error } = useQueueStatus(isOpen ? 5000 : 30000);
  const cancelMutation = useCancelQueue();
  const validatePendingMutation = useValidateAllPending();
  const revalidateAllMutation = useRevalidateAll();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Calculate totals - Queue stats
  const totalQueued = queueStatus?.totalQueuedLanes || 0;
  const inProgressJobs = queueStatus?.inProgressJobs || 0;
  const cancellableJobs = queueStatus?.cancellableJobs || 0;
  const estimatedWait = queueStatus?.estimatedWaitMinutes || 0;
  const affectedMappings = queueStatus?.affectedLaneMappings || [];

  // Lane validation status counts
  const pendingLanes = queueStatus?.pendingLanes || 0;
  const validLanes = queueStatus?.validLanes || 0;
  const invalidLanes = queueStatus?.invalidLanes || 0;
  const apiErrorLanes = queueStatus?.apiErrorLanes || 0;
  const mismatchLanes = queueStatus?.mismatchLanes || 0;

  // Queue is active if there are queued lanes
  const hasActiveQueue = totalQueued > 0;
  // Cancel is only enabled if there are jobs that can actually be cancelled (not IN_PROGRESS)
  const canCancel = cancellableJobs > 0;

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel all pending validations?')) {
      try {
        const result = await cancelMutation.mutateAsync();
        setToast({ type: 'success', message: result.message || 'Queue cancelled' });
        setIsOpen(false);
      } catch (err) {
        setToast({ type: 'error', message: err.message || 'Failed to cancel queue' });
      }
    }
  };

  const handleValidatePending = async () => {
    try {
      const result = await validatePendingMutation.mutateAsync();
      setToast({ type: 'success', message: result.message || 'Validation queued' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to queue validation' });
    }
  };

  const handleRevalidateAll = async () => {
    if (window.confirm('This will reset ALL lanes to pending and re-validate them. Continue?')) {
      try {
        const result = await revalidateAllMutation.mutateAsync();
        setToast({ type: 'success', message: result.message || 'Re-validation queued' });
      } catch (err) {
        setToast({ type: 'error', message: err.message || 'Failed to queue re-validation' });
      }
    }
  };

  // Don't show anything if loading or error (silent fail)
  if (isLoading && !queueStatus) return null;
  if (error) return null;

  // Badge color based on queue status
  const getBadgeColor = () => {
    if (inProgressJobs > 0) return 'bg-blue-500'; // Processing
    if (totalQueued > 0) return 'bg-amber-500'; // Pending
    return 'bg-gray-600'; // Empty
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast notification */}
      {toast && (
        <div className={`absolute bottom-full left-0 right-0 mb-2 px-3 py-2 rounded-lg text-sm font-medium z-50 flex items-center gap-2
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
          style={{ minWidth: '200px' }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg transition-all duration-200
          ${isOpen ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
          ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? `Queue: ${totalQueued} pending` : ''}
      >
        <div className="relative">
          <Clock size={20} className="flex-shrink-0" />
          {totalQueued > 0 && (
            <span className={`absolute -top-1.5 -right-1.5 ${getBadgeColor()} text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
              {totalQueued > 99 ? '99+' : totalQueued}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <span className="font-medium text-sm flex-1 text-left">
              Queue {totalQueued > 0 ? `(${totalQueued})` : ''}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden
          ${collapsed ? 'left-full ml-2 top-0' : 'left-0 right-0'}`}
          style={{ minWidth: '280px' }}
        >
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Validation Queue</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Queue Stats */}
          <div className="px-4 py-3 space-y-2 border-b border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Queue</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">In Queue</span>
              <span className="text-white font-medium">{totalQueued} lanes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Processing</span>
              <span className="text-blue-400 font-medium">{inProgressJobs} jobs</span>
            </div>
            {estimatedWait > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Wait</span>
                <span className="text-amber-400 font-medium">~{estimatedWait} min</span>
              </div>
            )}
          </div>

          {/* Lane Validation Status */}
          <div className="px-4 py-3 space-y-2 border-b border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Lane Status</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pending</span>
              <span className="text-amber-400 font-medium">{pendingLanes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Valid</span>
              <span className="text-green-400 font-medium">{validLanes}</span>
            </div>
            {invalidLanes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Invalid</span>
                <span className="text-red-400 font-medium">{invalidLanes}</span>
              </div>
            )}
            {apiErrorLanes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">API Error</span>
                <span className="text-orange-400 font-medium">{apiErrorLanes}</span>
              </div>
            )}
            {mismatchLanes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mismatch</span>
                <span className="text-yellow-400 font-medium">{mismatchLanes}</span>
              </div>
            )}
          </div>

          {/* Affected Mappings */}
          {affectedMappings.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Affected Mappings</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {affectedMappings.map((mapping) => (
                  <li key={mapping.laneMappingId} className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate mr-2">{mapping.laneMappingName}</span>
                    <span className="text-gray-500 flex-shrink-0">({mapping.pendingLaneCount})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty State - only show when no pending AND no in-progress */}
          {!hasActiveQueue && affectedMappings.length === 0 && (
            <div className="px-4 py-6 text-center">
              <AlertCircle size={24} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">No lanes in queue</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 bg-gray-800/50 space-y-2">
            {/* Top row: Validate Pending & Revalidate All */}
            <div className="flex gap-2">
              <button
                onClick={handleValidatePending}
                disabled={pendingLanes === 0 || validatePendingMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Validate lanes that are already pending"
              >
                {validatePendingMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                Pending
              </button>
              <button
                onClick={handleRevalidateAll}
                disabled={revalidateAllMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  bg-green-600/20 text-green-400 hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Reset ALL lanes to pending and re-validate"
              >
                {revalidateAllMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Revalidate
              </button>
            </div>
            {/* Bottom row: Cancel */}
            <button
              onClick={handleCancel}
              disabled={!canCancel || cancelMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <X size={16} />
              )}
              Cancel Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatusIndicator;
