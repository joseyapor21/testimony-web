export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  licenseId: string;
  dateOfBirth: string;
  age: string;
  countryOrigin: string;
  countryOriginName: string;
  currentCountry: string;
  currentCountryName: string;
  currentState: string;
  phone: string;
  email: string;
  languages: string;
}

export interface AppointmentInfo {
  departureDate: string;
  departureTime: string;
  interviewDate: string;
  prayerDate: string;
}

export interface MedicalInfo {
  problem: string;
  duration: string;
  medical: string;
}

export interface InterviewInfo {
  notes: string;
  problems: string[];
}

export interface StatusNotes {
  notes: Record<string, unknown>;
}

export interface Metadata {
  submissionDate: string;
  language: string;
}

export interface CallStatusInfo {
  callStatusId: string;
  callStatus: string;
  followUp: boolean;
  evangelistName: string;
  dateOfCall: string;
  hasTestimony: boolean;
  dateOfTestimony?: string;
  notes: string;
}

export interface CallRecord {
  id: string;
  photo: string;
  personalInfo: PersonalInfo;
  appointmentInfo: AppointmentInfo;
  medicalInfo: MedicalInfo;
  interview: InterviewInfo;
  status: string[];
  statusNotes: StatusNotes;
  metadata: Metadata;
  callStatuses: CallStatusInfo[];
}

export interface Note {
  id?: string;
  visitorId: string;
  content: string;
  dateCreated: string;
  createdBy: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface CallHistory {
  date: string;
  notes: string;
  status: string;
}

export interface FilterOptions {
  evangelistName?: string;
  callStatus?: string;
  followUpOnly?: boolean;
  hasTestimonyOnly?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  dateType?: 'call' | 'prayer' | 'interview' | 'testimony';
}

export interface GroupedRecords {
  [sundayDate: string]: CallRecord[];
}
