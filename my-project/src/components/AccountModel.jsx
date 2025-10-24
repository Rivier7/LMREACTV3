import React, { useEffect, useState } from 'react';
import { getAccountbyId, deleteAccountbyId, getAccountExcel } from '../api/api';
import { useNavigate } from 'react-router-dom';

const AccountModel = ({ accountId, onClose, onRemove }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await deleteAccountbyId(accountId);
      onRemove(accountId);
      navigate('/Accounts');
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Error deleting account");
    }
  };

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const account = await getAccountbyId(accountId);
        if (!account || Object.keys(account).length === 0) {
          setError("No data available");
        } else {
          setAccount(account);
        }
      } catch (error) {
        setError("Error loading data");
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [accountId]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      {/* Modal Backdrop (for closing on click) */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-80 text-center z-50">
        {account ? (
          <p className="text-lg mb-4">
            Are you sure you want to remove this account{" "}
            <span className="font-bold">{account.name}</span>?
          </p>
        ) : (
          <p className="text-lg mb-4">No account found</p>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={handleConfirm}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </>
  );
};

export default AccountModel;
