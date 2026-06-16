import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight, Home, Building2, X, Navigation, Sun, Moon } from 'lucide-react';
import { supabase } from '../database/supabaseClient';

const ITEMS_PER_PAGE = 5;

export default function AddressDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fetch addresses from Supabase
  useEffect(() => {
    async function fetchAddresses() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('locations_fulfilled')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAddresses(data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, []);

  const filteredAddresses = useMemo(() => {
    if (!searchTerm) return addresses;
    return addresses.filter(address =>
      address.homenumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.street?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [addresses, searchTerm]);

  const totalPages = Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE);

  const paginatedAddresses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAddresses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAddresses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openModal = (address) => setSelectedAddress(address);
  const closeModal = () => setSelectedAddress(null);

  const getDirections = (address) => {
    const encodedLabel = encodeURIComponent(address.homesteadhead);
    
    window.open(`https://www.google.com/maps/dir/?api=1`+
                  `&q=Current+Location`+
                  `&destination=${address.latitude},${address.longitude}`+
                  `&travelmode=driving`, '_blank');
  };

  const getTypeIcon = (type) => {
    return type === 'commercial' ? 
      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : 
      <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">Loading addresses...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 dark:bg-gray-950">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EswaMap</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Directory</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {filteredAddresses.length} addresses
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by home owner, home number, zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Address List */}
        <div className="space-y-4">
          {paginatedAddresses.length > 0 ? (
            paginatedAddresses.map((address) => (
              <div
                key={address.id}
                onClick={() => openModal(address)}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md active:scale-[0.985] cursor-pointer transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getTypeIcon(address.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xl mb-1">{address.street}, {address.homenumber}</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {address.area},{address.zone}
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Updated {new Date(address.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        'residential' === 'commercial'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        Residenntial
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No addresses found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl">
              Page <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentPage}</span> of {totalPages}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Modal (same as before) */}
      {selectedAddress && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal content - same as previous version */}
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedAddress.type)}
                <h2 className="text-2xl font-semibold">Address Details</h2>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-2xl font-semibold mt-1">{selectedAddress.street}, {selectedAddress.homenumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
                <p className="text-2xl font-semibold mt-1">{selectedAddress.area}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Zone</p><p className="font-medium">{selectedAddress.zone}</p></div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                <p className="font-medium">Eswatini</p>
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-4 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800">Close</button>
              <button onClick={() => getDirections(selectedAddress)} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2">
                <Navigation className="w-5 h-5" /> Directions
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 border-t dark:border-gray-800">
        EswaMap • Mbhambhadane Foundation - 2026
      </footer>
    </div>
  );
}