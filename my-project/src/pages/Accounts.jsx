import { useEffect, useState } from "react";
import { getAccountExcel, getAllAccounts } from '../api/api';
import AccountModel from "../components/AccountModel";
import FileUploader from '../components/FileUploader';
import Header from '../components/Header';

const Accounts = () => {
  const [Account, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const loadAccounts = async () => {
    try {
      const Accounts = await getAllAccounts();
      if (!Accounts || Accounts.length === 0) {
        setError("No data available");
      } else {
        setAccounts(Accounts);
      }
    } catch (error) {
      setError("Error loading data");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedAccountId(id);
    setShowRemoveModal(true);
  };

  const handleRemoveAccount = async (id) => {
    setShowRemoveModal(false);
    setLoading(true);
    await loadAccounts();
  };

  return (
    <>
      <Header />
      <div className="px-5 font-sans mt-10">
        {/* Header */}
        <div className="flex justify-center items-center mb-5 p-3 bg-gray-100 rounded-lg shadow-md relative">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">Accounts</h1>
        </div>

        {/* File Uploader */}
        <FileUploader />

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-wrap justify-center items-center mt-5 p-3 bg-gray-100 rounded-lg shadow-md">
            {Account.map((account, index) => (
              <div
                key={index}
                className="relative bg-white rounded-lg shadow-md p-4 w-64 h-52 flex flex-col justify-center items-center m-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Delete Button */}
                <button
                  className="absolute top-2 right-2 w-8 h-8 bg-red-300 text-white rounded-full flex justify-center items-center transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
                  onClick={() => handleDeleteClick(account.id)}
                >
                  X
                </button>

                {/* Profile Circle */}
                <div
                  className="rounded-full w-12 h-12 transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: account.randomColor }}
                ></div>

                {/* Account Name */}
                <h2 className="text-xl font-bold mt-2 transition-colors hover:text-blue-500">
                  {account.name}
                </h2>

                {/* Download Button */}
                <button
                  className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => getAccountExcel(account.id)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}

        {showRemoveModal && (
          <AccountModel
            accountId={selectedAccountId}
            onClose={() => setShowRemoveModal(false)}
            onRemove={handleRemoveAccount}
          />
        )}
      </div>
    </>
  );
};

export default Accounts;
