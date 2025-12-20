import { AuthService } from './auth';
import { CallRecord, CallStatusInfo, Note, CallHistory } from '../types';

const BASE_URL = 'http://localhost:3001';

export const ApiService = {
  async getRegistrations(): Promise<CallRecord[]> {
    const headers = AuthService.getHeaders();
    const response = await fetch(`${BASE_URL}/api/v3/testimonies/visitors`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch registrations: ${response.status}`);
    }

    const data = await response.json();
    return data.map((item: unknown) => parseCallRecord(item));
  },

  async getCallHistories(recordId: string): Promise<CallHistory[]> {
    const headers = AuthService.getHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v3/testimonies/call-histories/${recordId}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch call histories: ${response.status}`);
    }

    return await response.json();
  },

  async addCallHistory(recordId: string, callHistory: CallHistory): Promise<void> {
    const headers = AuthService.getHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v3/testimonies/call-histories/${recordId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(callHistory),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add call history: ${response.status}`);
    }
  },

  async updateCallStatus(recordId: string, callStatus: CallStatusInfo): Promise<void> {
    const headers = AuthService.getHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v3/testimonies/call-status/${recordId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(callStatus),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update call status: ${response.status}`);
    }
  },

  async deleteCallStatus(recordId: string, callStatusId: string): Promise<void> {
    const headers = AuthService.getHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v3/testimonies/call-status/${recordId}/${callStatusId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete call status: ${response.status}`);
    }
  },

  async getNotes(visitorId: string): Promise<Note[]> {
    const headers = AuthService.getHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v3/testimonies/notes/${visitorId}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.status}`);
    }

    return await response.json();
  },

  async addNote(visitorId: string, note: Omit<Note, 'id'>): Promise<Note> {
    const headers = AuthService.getHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v3/testimonies/notes/${visitorId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(note),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add note: ${response.status}`);
    }

    return await response.json();
  },
};

function parseCallRecord(data: unknown): CallRecord {
  const d = data as Record<string, unknown>;
  const personalInfo = (d.personalInfo || {}) as Record<string, unknown>;
  const appointmentInfo = (d.appointmentInfo || {}) as Record<string, unknown>;
  const medicalInfo = (d.medicalInfo || {}) as Record<string, unknown>;
  const interview = (d.interview || {}) as Record<string, unknown>;
  const statusNotes = (d.statusNotes || {}) as Record<string, unknown>;
  const metadata = (d.metadata || {}) as Record<string, unknown>;
  const callStatuses = (d.callStatuses || []) as Record<string, unknown>[];

  return {
    id: (d.id || d._id || '') as string,
    photo: (d.photo || '') as string,
    personalInfo: {
      firstName: (personalInfo.firstName || '') as string,
      middleName: (personalInfo.middleName || '') as string,
      lastName: (personalInfo.lastName || '') as string,
      licenseId: (personalInfo.licenseId || '') as string,
      dateOfBirth: (personalInfo.dateOfBirth || '') as string,
      age: (personalInfo.age || '') as string,
      countryOrigin: (personalInfo.countryOrigin || '') as string,
      countryOriginName: (personalInfo.countryOriginName || '') as string,
      currentCountry: (personalInfo.currentCountry || '') as string,
      currentCountryName: (personalInfo.currentCountryName || '') as string,
      currentState: (personalInfo.currentState || '') as string,
      phone: (personalInfo.phone || '') as string,
      email: (personalInfo.email || '') as string,
      languages: (personalInfo.languages || '') as string,
    },
    appointmentInfo: {
      departureDate: (appointmentInfo.departureDate || '') as string,
      departureTime: (appointmentInfo.departureTime || '') as string,
      interviewDate: (appointmentInfo.interviewDate || '') as string,
      prayerDate: (appointmentInfo.prayerDate || '') as string,
    },
    medicalInfo: {
      problem: (medicalInfo.problem || '') as string,
      duration: (medicalInfo.duration || '') as string,
      medical: (medicalInfo.medical || '') as string,
    },
    interview: {
      notes: (interview.notes || '') as string,
      problems: (interview.problems || []) as string[],
    },
    status: Array.isArray(d.status) ? d.status as string[] : [],
    statusNotes: {
      notes: (statusNotes.notes || {}) as Record<string, unknown>,
    },
    metadata: {
      submissionDate: (metadata.submissionDate || '') as string,
      language: (metadata.language || '') as string,
    },
    callStatuses: callStatuses.map((cs) => ({
      callStatusId: (cs.callStatusId || cs._id || '') as string,
      callStatus: (cs.callStatus || '') as string,
      followUp: (cs.followUp || false) as boolean,
      evangelistName: (cs.evangelistName || '') as string,
      dateOfCall: (cs.dateOfCall || '') as string,
      hasTestimony: (cs.hasTestimony || false) as boolean,
      dateOfTestimony: cs.dateOfTestimony as string | undefined,
      notes: (cs.notes || '') as string,
    })),
  };
}
