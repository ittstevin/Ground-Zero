import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function PCsPage() {
  const [pcs, setPCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchPCs() {
      try {
        const pcsQuery = query(
          collection(db, 'pcs'),
          where('status', '==', 'available')
        );
        const pcsSnapshot = await getDocs(pcsQuery);
        const pcsData = pcsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPCs(pcsData);
      } catch (error) {
        console.error('Error fetching PCs:', error);
        setError('Failed to load PCs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPCs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Gaming PCs
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose from our selection of high-performance gaming PCs
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pcs.map(pc => (
            <div
              key={pc.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{pc.name}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p><strong>CPU:</strong> {pc.specs.cpu}</p>
                  <p><strong>GPU:</strong> {pc.specs.gpu}</p>
                  <p><strong>RAM:</strong> {pc.specs.ram}</p>
                  <p><strong>Storage:</strong> {pc.specs.storage}</p>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-medium text-indigo-600">
                    ${pc.hourlyRate}/hour
                  </p>
                </div>
                {currentUser ? (
                  <div className="mt-6">
                    <button
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Book Now
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Please <a href="/login" className="text-indigo-600 hover:text-indigo-500">login</a> to book this PC
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {pcs.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-500">
              No PCs are currently available. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 