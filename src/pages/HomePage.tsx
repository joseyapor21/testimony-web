import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService, ApiFilterOptions } from '../services/api';
import { AuthService } from '../services/auth';
import { CallRecord, FilterOptions, PaginationInfo } from '../types';
import { DateHelper } from '../utils/dateUtils';
import { RecordCard, SearchBar } from '../components';
import { RecordDetailsModal } from './RecordDetailsModal';
import { FilterModal } from './FilterModal';

interface GroupedSection {
  sundayKey: string;
  sundayRange: string;
  records: CallRecord[];
}

const RECORDS_PER_PAGE = 20;

export function HomePage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const buildApiFilters = useCallback((): ApiFilterOptions | undefined => {
    const apiFilters: ApiFilterOptions = {};

    if (searchQuery.trim()) {
      apiFilters.search = searchQuery.trim();
    }

    if (filters) {
      if (filters.evangelistName) apiFilters.evangelistName = filters.evangelistName;
      if (filters.callStatus) apiFilters.callStatus = filters.callStatus;
      if (filters.followUpOnly) apiFilters.followUpOnly = true;
      if (filters.hasTestimonyOnly) apiFilters.hasTestimonyOnly = true;
      if (filters.dateFrom) apiFilters.dateFrom = filters.dateFrom.toISOString().split('T')[0];
      if (filters.dateTo) apiFilters.dateTo = filters.dateTo.toISOString().split('T')[0];
      if (filters.dateType) apiFilters.dateType = filters.dateType;
    }

    return Object.keys(apiFilters).length > 0 ? apiFilters : undefined;
  }, [searchQuery, filters]);

  const loadRecords = useCallback(async (page = 1, apiFilters?: ApiFilterOptions) => {
    try {
      setError(null);
      const result = await ApiService.getRegistrations(page, RECORDS_PER_PAGE, apiFilters);
      setRecords(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load records. Please try again.');
      console.error('Error loading records:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadRecords(1, buildApiFilters());
      setIsLoading(false);
    };
    init();
  }, []);

  // Reload when filters change
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);
    loadRecords(1, buildApiFilters()).finally(() => setIsLoading(false));
  }, [filters]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      setCurrentPage(1);
      const apiFilters = buildApiFilters();
      if (value.trim()) {
        loadRecords(1, { ...apiFilters, search: value.trim() }).finally(() => setIsLoading(false));
      } else {
        loadRecords(1, apiFilters).finally(() => setIsLoading(false));
      }
    }, 300);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      AuthService.logout();
      navigate('/login', { replace: true });
    }
  };

  const groupedSections = useMemo((): GroupedSection[] => {
    const groups: Record<string, CallRecord[]> = {};

    records.forEach((record) => {
      const dateStr = record.appointmentInfo.prayerDate;

      const date = DateHelper.parseDate(dateStr);
      if (!date) return;

      const sundayKey = DateHelper.getSundayKey(date);
      if (!groups[sundayKey]) {
        groups[sundayKey] = [];
      }
      groups[sundayKey].push(record);
    });

    const sortedKeys = Object.keys(groups).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedKeys.map((key) => ({
      sundayKey: key,
      sundayRange: DateHelper.formatSundayRange(new Date(key)),
      records: groups[key].sort((a, b) => {
        const dateA = DateHelper.parseDate(a.appointmentInfo.prayerDate);
        const dateB = DateHelper.parseDate(b.appointmentInfo.prayerDate);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      }),
    }));
  }, [records]);

  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    if (filters.evangelistName) count++;
    if (filters.callStatus) count++;
    if (filters.followUpOnly) count++;
    if (filters.hasTestimonyOnly) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  }, [filters]);

  const handleRecordUpdate = () => {
    loadRecords(currentPage, buildApiFilters());
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      setIsLoading(true);
      loadRecords(newPage, buildApiFilters()).finally(() => setIsLoading(false));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-500">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary-600 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-xl font-bold">Testimony Department</h1>
            <button
              onClick={handleLogout}
              className="text-white hover:text-white/80 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search name, phone..."
          />

          {/* Action Bar */}
          <div className="flex items-center justify-end mt-3">
            {/* Filter Button */}
            <button
              className="flex items-center bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              onClick={() => setShowFilterModal(true)}
            >
              <span className="text-white text-sm">Filter</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ml-2">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-100 px-4 py-3 rounded-lg mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadRecords(currentPage, buildApiFilters())}
              className="text-red-600 font-semibold mt-2 hover:underline"
            >
              Tap to retry
            </button>
          </div>
        )}

        {/* Records List */}
        {groupedSections.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No records found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery || filters
                ? 'Try adjusting your search or filters'
                : 'Pull down to refresh'}
            </p>
          </div>
        ) : (
          <>
            {groupedSections.map((section) => (
              <div key={section.sundayKey} className="mb-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-gray-600 font-semibold">{section.sundayRange}</h2>
                  <span className="bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    {section.records.length} visitor{section.records.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Record Cards */}
                {section.records.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onClick={() => setSelectedRecord(record)}
                  />
                ))}
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (pagination.totalPages <= 7) return true;
                      if (page === 1 || page === pagination.totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Page Info */}
            {pagination && (
              <div className="text-center text-sm text-gray-500 pb-4">
                Showing {(currentPage - 1) * RECORDS_PER_PAGE + 1} -{' '}
                {Math.min(currentPage * RECORDS_PER_PAGE, pagination.total)} of {pagination.total} records
              </div>
            )}
          </>
        )}
      </main>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={handleRecordUpdate}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          currentFilters={filters}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowFilterModal(false);
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}
