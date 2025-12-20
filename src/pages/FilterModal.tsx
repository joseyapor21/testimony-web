import { useState } from 'react';
import { FilterOptions } from '../types';
import { CALL_STATUS_OPTIONS } from '../utils/colorMap';
import { DateHelper } from '../utils/dateUtils';
import { Modal } from '../components';

interface FilterModalProps {
  currentFilters: FilterOptions | null;
  onApply: (filters: FilterOptions | null) => void;
  onClose: () => void;
}

type DateType = 'call' | 'prayer' | 'interview' | 'testimony';

export function FilterModal({ currentFilters, onApply, onClose }: FilterModalProps) {
  const [evangelistName, setEvangelistName] = useState(currentFilters?.evangelistName || '');
  const [callStatus, setCallStatus] = useState(currentFilters?.callStatus || '');
  const [followUpOnly, setFollowUpOnly] = useState(currentFilters?.followUpOnly || false);
  const [hasTestimonyOnly, setHasTestimonyOnly] = useState(currentFilters?.hasTestimonyOnly || false);
  const [dateFrom, setDateFrom] = useState(
    currentFilters?.dateFrom ? DateHelper.formatForInput(currentFilters.dateFrom) : ''
  );
  const [dateTo, setDateTo] = useState(
    currentFilters?.dateTo ? DateHelper.formatForInput(currentFilters.dateTo) : ''
  );
  const [dateType, setDateType] = useState<DateType>(currentFilters?.dateType || 'prayer');

  const handleApply = () => {
    const hasFilters =
      evangelistName.trim() ||
      callStatus ||
      followUpOnly ||
      hasTestimonyOnly ||
      dateFrom ||
      dateTo;

    if (!hasFilters) {
      onApply(null);
      return;
    }

    onApply({
      evangelistName: evangelistName.trim() || undefined,
      callStatus: callStatus || undefined,
      followUpOnly,
      hasTestimonyOnly,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      dateType,
    });
  };

  const handleClear = () => {
    setEvangelistName('');
    setCallStatus('');
    setFollowUpOnly(false);
    setHasTestimonyOnly(false);
    setDateFrom('');
    setDateTo('');
    setDateType('prayer');
    onApply(null);
  };

  const DateTypeButton = ({ type, label }: { type: DateType; label: string }) => (
    <button
      onClick={() => setDateType(type)}
      className={`px-3 py-2 rounded-lg mr-2 mb-2 transition-colors ${
        dateType === type
          ? 'bg-primary-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      {/* Header */}
      <div className="bg-primary-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <button onClick={onClose} className="text-white hover:text-white/80">
          Cancel
        </button>
        <h2 className="text-white text-lg font-bold">Filters</h2>
        <button onClick={handleClear} className="text-white hover:text-white/80">
          Clear
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Evangelist Name */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Evangelist Name
          </label>
          <input
            type="text"
            value={evangelistName}
            onChange={(e) => setEvangelistName(e.target.value)}
            placeholder="Search by evangelist name..."
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Call Status */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Call Status
          </label>
          <select
            value={callStatus}
            onChange={(e) => setCallStatus(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select call status...</option>
            {CALL_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Filters */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Quick Filters
          </label>
          <div className="bg-gray-100 rounded-lg">
            <label className="flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-pointer">
              <span className="text-gray-800">Follow Up Only</span>
              <input
                type="checkbox"
                checked={followUpOnly}
                onChange={(e) => setFollowUpOnly(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <span className="text-gray-800">Has Testimony Only</span>
              <input
                type="checkbox"
                checked={hasTestimonyOnly}
                onChange={(e) => setHasTestimonyOnly(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Date Type */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Date Type
          </label>
          <div className="flex flex-wrap">
            <DateTypeButton type="prayer" label="Prayer Date" />
            <DateTypeButton type="interview" label="Interview Date" />
            <DateTypeButton type="call" label="Call Date" />
            <DateTypeButton type="testimony" label="Testimony Date" />
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Date Range
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-500 text-sm mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-500 text-sm mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <div className="flex gap-2 mt-2">
              {dateFrom && (
                <button
                  onClick={() => setDateFrom('')}
                  className="bg-red-100 text-red-600 rounded-lg px-3 py-1 text-sm hover:bg-red-200"
                >
                  Clear From
                </button>
              )}
              {dateTo && (
                <button
                  onClick={() => setDateTo('')}
                  className="bg-red-100 text-red-600 rounded-lg px-3 py-1 text-sm hover:bg-red-200"
                >
                  Clear To
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleApply}
          className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </Modal>
  );
}
