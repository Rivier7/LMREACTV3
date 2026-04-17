import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Plus, Search } from 'lucide-react';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import AccountModal from '../components/AccountModal';
import { useAccounts, useCreateAccount } from '../hooks/useAccountQueries';

function Accounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const { data: accounts = [], isLoading, error, refetch } = useAccounts();
  const createAccountMutation = useCreateAccount();

  const handleSelectAccount = accountId => {
    navigate(`/accounts/${accountId}`);
  };

  const handleCreateAccount = async name => {
    try {
      await createAccountMutation.mutateAsync(name);
      setShowCreateModal(false);
    } catch (error) {
      alert(error.message || 'Failed to create account');
    }
  };

  // Filter accounts by search
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="text-center py-12 text-lg text-gray-500">Loading accounts...</div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Display error message if any */}
          {error && (
            <ErrorMessage
              message={error.message || 'Failed to load accounts'}
              title="Error Loading Accounts"
              severity="error"
              className="mb-6"
            />
          )}

          {/* Top Section */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            {/* Left: Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Accounts</h1>
              <p className="text-gray-600">Manage your client accounts and their lane mappings</p>
            </div>

            {/* Right: Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center gap-2 self-start lg:self-auto"
            >
              <Plus size={20} />
              Create Account
            </button>
          </div>

          {/* Accounts Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Accounts</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredAccounts.length} of {accounts.length} accounts
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                {accounts.length} Total
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* No Results */}
            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 text-lg">
                  {accounts.length === 0
                    ? 'No accounts yet. Create your first account to get started.'
                    : 'No accounts match your search'}
                </p>
              </div>
            )}

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map(account => (
                <div
                  key={account.id}
                  onClick={() => handleSelectAccount(account.id)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {account.name}
                          </h3>
                          <p className="text-xs text-gray-500">ID: {account.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Lane Mappings</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {account.laneMappings?.length || 0}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
                    </div>

                    {/* Lane Mapping Preview */}
                    {account.laneMappings && account.laneMappings.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {account.laneMappings.slice(0, 3).map(lm => (
                          <span
                            key={lm.id}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: lm.randomColor + '20', color: lm.randomColor }}
                          >
                            {lm.name}
                          </span>
                        ))}
                        {account.laneMappings.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            +{account.laneMappings.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Create Account Modal */}
      {showCreateModal && (
        <AccountModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateAccount}
          isLoading={createAccountMutation.isPending}
        />
      )}
    </>
  );
}

export default Accounts;
