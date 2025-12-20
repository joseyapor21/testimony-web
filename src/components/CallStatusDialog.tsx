import { useState } from 'react';
import { CallStatusInfo } from '../types';
import { CALL_STATUS_OPTIONS } from '../utils/colorMap';
import { DateHelper } from '../utils/dateUtils';
import { Modal } from './Modal';

interface CallStatusDialogProps {
  isOpen: boolean;
  callStatus: CallStatusInfo | null;
  onSave: (callStatus: CallStatusInfo) => void;
  onClose: () => void;
}

export function CallStatusDialog({
  isOpen,
  callStatus,
  onSave,
  onClose,
}: CallStatusDialogProps) {
  const [status, setStatus] = useState(callStatus?.callStatus || '');
  const [evangelistName, setEvangelistName] = useState(
    callStatus?.evangelistName || ''
  );
  const [dateOfCall, setDateOfCall] = useState(
    callStatus?.dateOfCall
      ? DateHelper.formatForInput(DateHelper.parseDate(callStatus.dateOfCall) || new Date())
      : DateHelper.formatForInput(new Date())
  );
  const [followUp, setFollowUp] = useState(callStatus?.followUp || false);
  const [hasTestimony, setHasTestimony] = useState(callStatus?.hasTestimony || false);
  const [dateOfTestimony, setDateOfTestimony] = useState(
    callStatus?.dateOfTestimony
      ? DateHelper.formatForInput(DateHelper.parseDate(callStatus.dateOfTestimony) || new Date())
      : ''
  );
  const [notes, setNotes] = useState(callStatus?.notes || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!status) {
      setError('Please select a call status.');
      return;
    }

    onSave({
      callStatusId: callStatus?.callStatusId || '',
      callStatus: status,
      evangelistName,
      dateOfCall: new Date(dateOfCall).toISOString(),
      followUp,
      hasTestimony,
      dateOfTestimony: hasTestimony && dateOfTestimony
        ? new Date(dateOfTestimony).toISOString()
        : undefined,
      notes,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <div className="bg-primary-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-white hover:text-white/80">
            Cancel
          </button>
          <h2 className="text-white text-lg font-bold">
            {callStatus ? 'Edit Call Status' : 'Add Call Status'}
          </h2>
          <button
            onClick={handleSave}
            className="text-white font-semibold hover:text-white/80"
          >
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Call Status */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Call Status *
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setError('');
            }}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select call status...</option>
            {CALL_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Evangelist Name */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Evangelist Name
          </label>
          <input
            type="text"
            value={evangelistName}
            onChange={(e) => setEvangelistName(e.target.value)}
            placeholder="Enter evangelist name..."
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Date of Call */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Date of Call
          </label>
          <input
            type="date"
            value={dateOfCall}
            onChange={(e) => setDateOfCall(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Toggle Options */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Options
          </label>
          <div className="bg-gray-100 rounded-lg">
            <label className="flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-pointer">
              <span className="text-gray-800">Follow Up Required</span>
              <input
                type="checkbox"
                checked={followUp}
                onChange={(e) => setFollowUp(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <span className="text-gray-800">Has Testimony</span>
              <input
                type="checkbox"
                checked={hasTestimony}
                onChange={(e) => {
                  setHasTestimony(e.target.checked);
                  if (!e.target.checked) setDateOfTestimony('');
                }}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Date of Testimony (conditional) */}
        {hasTestimony && (
          <div className="mb-4">
            <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
              Date of Testimony
            </label>
            <input
              type="date"
              value={dateOfTestimony}
              onChange={(e) => setDateOfTestimony(e.target.value)}
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            rows={4}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {callStatus ? 'Update Call Status' : 'Add Call Status'}
        </button>
      </div>
    </Modal>
  );
}
