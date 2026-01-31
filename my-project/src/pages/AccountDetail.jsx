import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Trash2, Plus, Link2Off, ChevronRight, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import {
  useAccount,
  useUpdateAccount,
  useDeleteAccount,
  useAssignLaneMapping,
  useRemoveLaneMapping,
} from '../hooks/useAccountQueries';
import { useLaneMappingsList } from '../hooks/useLaneMappingQueries';

function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const { data: account, isLoading, error, refetch } = useAccount(id);
  const { data: allLaneMappings = [] } = useLaneMappingsList();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const assignLaneMappingMutation = useAssignLaneMapping();
  const removeLaneMappingMutation = useRemoveLaneMapping();

  // Get lane mappings not assigned to this account
  const availableLaneMappings = allLaneMappings.filter(
    lm => !account?.laneMappings?.some(alm => alm.id === lm.id)
  );

  const handleStartEdit = () => {
    setEditedName(account?.name || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) return;
    try {
      await updateAccountMutation.mutateAsync({ id, name: editedName.trim() });
      setIsEditing(false);
      refetch();
    } catch (error) {
      alert(error.message || 'Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      await deleteAccountMutation.mutateAsync(id);
      navigate('/accounts');
    } catch (error) {
      alert(error.message || 'Failed to delete account');
    }
  };

  const handleAssignLaneMapping = async laneMappingId => {
    setAssigningId(laneMappingId);
    try {
      await assignLaneMappingMutation.mutateAsync({ accountId: id, laneMappingId });
      setShowAssignModal(false);
      refetch();
    } catch (error) {
      alert(error.message || 'Failed to assign lane mapping');
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemoveLaneMapping = async laneMappingId => {
    if (removeConfirm !== laneMappingId) {
      setRemoveConfirm(laneMappingId);
      return;
    }
    try {
      await removeLaneMappingMutation.mutateAsync({ laneMappingId, accountId: id });
      setRemoveConfirm(null);
      refetch();
    } catch (error) {
      alert(error.message || 'Failed to remove lane mapping');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="text-center py-12 text-lg text-gray-500">Loading account...</div>
      </>
    );
  }

  if (error || !account) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <ErrorMessage
            message={error?.message || 'Account not found'}
            title="Error Loading Account"
            severity="error"
          />
          <button
            onClick={() => navigate('/accounts')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Accounts
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/accounts')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Accounts
          </button>

          {/* Account Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Account Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)}
                        className="text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateAccountMutation.isPending}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Save size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
                      <button
                        onClick={handleStartEdit}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit name"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Account ID: {account.id}</p>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  deleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-red-600 hover:bg-red-50'
                } disabled:opacity-50`}
              >
                <Trash2 size={18} />
                {deleteConfirm ? 'Click to Confirm Delete' : 'Delete Account'}
              </button>
            </div>
          </div>

          {/* Lane Mappings Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assigned Lane Mappings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {account.laneMappings?.length || 0} lane mappings assigned to this account
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Assign Lane Mapping
              </button>
            </div>

            {/* No Lane Mappings */}
            {(!account.laneMappings || account.laneMappings.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">No lane mappings assigned to this account yet.</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200"
                >
                  Assign your first lane mapping
                </button>
              </div>
            )}

            {/* Lane Mappings List */}
            {account.laneMappings && account.laneMappings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {account.laneMappings.map(lm => (
                  <div
                    key={lm.id}
                    onClick={() => navigate(`/laneMappingLanes/${lm.id}`)}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: lm.randomColor || '#3B82F6' }}
                        >
                          {lm.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{lm.name}</h3>
                          <p className="text-xs text-gray-500">ID: {lm.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveLaneMapping(lm.id);
                          }}
                          disabled={removeLaneMappingMutation.isPending}
                          className={`p-2 rounded-lg transition-colors ${
                            removeConfirm === lm.id
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={removeConfirm === lm.id ? 'Click to confirm' : 'Remove from account'}
                        >
                          <Link2Off size={18} />
                        </button>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Assign Lane Mapping Modal */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assign Lane Mapping</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select a lane mapping to assign to {account.name}
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableLaneMappings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">All lane mappings are already assigned to this account.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableLaneMappings.map(lm => (
                    <button
                      key={lm.id}
                      onClick={() => handleAssignLaneMapping(lm.id)}
                      disabled={assigningId !== null}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        assigningId === lm.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: lm.randomColor || '#3B82F6' }}
                      >
                        {lm.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{lm.name}</p>
                        <p className="text-xs text-gray-500">ID: {lm.id}</p>
                      </div>
                      {assigningId === lm.id ? (
                        <Loader2 className="ml-auto text-blue-600 animate-spin" size={20} />
                      ) : (
                        <Plus className="ml-auto text-gray-400" size={20} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AccountDetail;
