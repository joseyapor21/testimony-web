import { useState, useEffect } from 'react';
import { CallRecord, CallStatusInfo, Note } from '../types';
import { ApiService } from '../services/api';
import { Modal, Avatar, StatusChip, CallStatusDialog } from '../components';
import { DateHelper } from '../utils/dateUtils';
import { StringHelper } from '../utils/stringUtils';

interface RecordDetailsModalProps {
  record: CallRecord;
  onClose: () => void;
  onUpdate: () => void;
}

export function RecordDetailsModal({ record, onClose, onUpdate }: RecordDetailsModalProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showCallStatusDialog, setShowCallStatusDialog] = useState(false);
  const [editingCallStatus, setEditingCallStatus] = useState<CallStatusInfo | null>(null);

  const { personalInfo, appointmentInfo, medicalInfo, interview, status, callStatuses } = record;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const data = await ApiService.getNotes(record.id);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const note = await ApiService.addNote(record.id, {
        visitorId: record.id,
        content: newNote.trim(),
        dateCreated: new Date().toISOString(),
        createdBy: 'User',
      });
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (error) {
      alert('Failed to add note. Please try again.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteCallStatus = async (callStatus: CallStatusInfo) => {
    if (!window.confirm('Are you sure you want to delete this call status?')) return;

    try {
      await ApiService.deleteCallStatus(record.id, callStatus.callStatusId);
      onUpdate();
      alert('Call status deleted successfully.');
    } catch (error) {
      alert('Failed to delete call status.');
    }
  };

  const handleSaveCallStatus = async (callStatus: CallStatusInfo) => {
    try {
      await ApiService.updateCallStatus(record.id, callStatus);
      onUpdate();
      setShowCallStatusDialog(false);
      setEditingCallStatus(null);
      alert('Call status saved successfully.');
    } catch (error) {
      alert('Failed to save call status.');
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex py-2 border-b border-gray-100">
      <span className="text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-800 flex-1">{StringHelper.ifEmpty(value, 'N/A')}</span>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wide mb-2 mt-6 first:mt-0">
      {title}
    </h3>
  );

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      {/* Header */}
      <div className="bg-primary-600 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-white hover:text-white/80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            onClick={() => {
              setEditingCallStatus(null);
              setShowCallStatusDialog(true);
            }}
            className="text-white font-semibold hover:text-white/80"
          >
            + Add Call
          </button>
        </div>

        <div className="flex items-center">
          <Avatar
            photoUrl={record.photo}
            firstName={personalInfo.firstName}
            lastName={personalInfo.lastName}
            size="lg"
          />
          <div className="ml-4 flex-1 min-w-0">
            <h2 className="text-white text-xl font-bold truncate">
              {StringHelper.ifEmpty(fullName, 'Unknown')}
            </h2>
            <p className="text-primary-200">
              {StringHelper.formatPhoneNumber(personalInfo.phone)}
            </p>
          </div>
        </div>

        {/* Status Chips */}
        {status.length > 0 && (
          <div className="flex flex-wrap mt-3">
            {status.map((s, index) => (
              <StatusChip key={index} status={s} size="md" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Personal Information */}
        <SectionHeader title="Personal Information" />
        <div className="bg-gray-50 rounded-lg p-3">
          <InfoRow label="Full Name" value={fullName} />
          <InfoRow label="Phone" value={StringHelper.formatPhoneNumber(personalInfo.phone)} />
          <InfoRow label="Email" value={personalInfo.email} />
          <InfoRow label="Age" value={personalInfo.age} />
          <InfoRow label="Location" value={`${personalInfo.currentState}, ${personalInfo.currentCountryName}`} />
          <InfoRow label="Languages" value={personalInfo.languages} />
        </div>

        {/* Appointment Information */}
        <SectionHeader title="Appointment Information" />
        <div className="bg-gray-50 rounded-lg p-3">
          <InfoRow label="Prayer Date" value={DateHelper.formatDateForDisplay(appointmentInfo.prayerDate)} />
          <InfoRow label="Interview Date" value={DateHelper.formatDateForDisplay(appointmentInfo.interviewDate)} />
          <InfoRow label="Departure Date" value={DateHelper.formatDateForDisplay(appointmentInfo.departureDate)} />
        </div>

        {/* Medical Information */}
        <SectionHeader title="Medical Information" />
        <div className="bg-gray-50 rounded-lg p-3">
          <InfoRow label="Problem" value={medicalInfo.problem} />
          <InfoRow label="Duration" value={medicalInfo.duration} />
          <InfoRow label="Medical Notes" value={medicalInfo.medical} />
        </div>

        {/* Interview Notes */}
        {interview.notes && (
          <>
            <SectionHeader title="Interview Notes" />
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-800">{interview.notes}</p>
            </div>
          </>
        )}

        {/* Call Status History */}
        <SectionHeader title="Call Status History" />
        {callStatuses.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-400">No call status records</p>
          </div>
        ) : (
          <div className="space-y-2">
            {callStatuses.map((cs, index) => (
              <div key={cs.callStatusId || index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 font-medium">
                    {cs.callStatus}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCallStatus(cs);
                        setShowCallStatusDialog(true);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCallStatus(cs)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <InfoRow label="Evangelist" value={cs.evangelistName} />
                <InfoRow label="Date of Call" value={DateHelper.formatDateForDisplay(cs.dateOfCall)} />
                <InfoRow label="Follow Up" value={cs.followUp ? 'Yes' : 'No'} />
                <InfoRow label="Has Testimony" value={cs.hasTestimony ? 'Yes' : 'No'} />
                {cs.hasTestimony && cs.dateOfTestimony && (
                  <InfoRow label="Testimony Date" value={DateHelper.formatDateForDisplay(cs.dateOfTestimony)} />
                )}
                {cs.notes && <InfoRow label="Notes" value={cs.notes} />}
              </div>
            ))}
          </div>
        )}

        {/* Notes Section */}
        <SectionHeader title="Notes" />
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAddingNote}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                newNote.trim() && !isAddingNote
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAddingNote ? '...' : 'Add'}
            </button>
          </div>

          {isLoadingNotes ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-gray-400 text-center py-2">No notes yet</p>
          ) : (
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={note.id || index} className="border-t border-gray-200 pt-2">
                  <p className="text-gray-800">{note.content}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400 text-xs">{note.createdBy}</span>
                    <span className="text-gray-400 text-xs">
                      {DateHelper.formatDateTimeForDisplay(note.dateCreated)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call Status Dialog */}
      <CallStatusDialog
        isOpen={showCallStatusDialog}
        callStatus={editingCallStatus}
        onSave={handleSaveCallStatus}
        onClose={() => {
          setShowCallStatusDialog(false);
          setEditingCallStatus(null);
        }}
      />
    </Modal>
  );
}
