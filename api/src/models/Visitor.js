import mongoose from 'mongoose';

const callStatusInfoSchema = new mongoose.Schema({
  callStatusId: {
    type: String,
    default: '',
  },
  callStatus: {
    type: String,
    default: '',
  },
  followUp: {
    type: Boolean,
    default: false,
  },
  evangelistName: {
    type: String,
    default: '',
  },
  dateOfCall: {
    type: String,
    default: '',
  },
  hasTestimony: {
    type: Boolean,
    default: false,
  },
  dateOfTestimony: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  _id: false,
});

const visitorSchema = new mongoose.Schema({
  _id: {
    type: String, // Custom ID like REG1, REG2
  },
  photo: {
    type: String,
    default: '',
  },
  personalInfo: {
    firstName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    address: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    licenseId: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    age: { type: String, default: '' },
    countryOrigin: { type: String, default: '' },
    countryOriginName: { type: String, default: '' },
    currentCountry: { type: String, default: '' },
    currentCountryName: { type: String, default: '' },
    currentState: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    languages: { type: String, default: '' },
  },
  appointment: {
    departureDate: { type: String, default: '' },
    departureTime: { type: String, default: '' },
    interviewDate: { type: String, default: '' },
    prayerDate: { type: String, default: '' },
    prayerTime: { type: String, default: '' },
    prayerRequest: { type: String, default: '' },
    status: { type: String, default: '' },
  },
  medicalInfo: {
    problem: { type: String, default: '' },
    duration: { type: String, default: '' },
    medical: { type: String, default: '' },
  },
  interview: {
    notes: { type: String, default: '' },
    problems: [{ type: String }],
  },
  status: [{
    type: String,
  }],
  statusNotes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  metadata: {
    submissionDate: { type: String, default: '' },
  },
  documents: [{
    name: String,
    content: String,
    dateAdded: String,
  }],
  callStatusInfo: [callStatusInfoSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'v3prayelineRegistration', // Use existing collection
  _id: false, // Don't auto-generate _id
});

// Update updated_at on save
visitorSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Virtual for full name
visitorSchema.virtual('fullName').get(function() {
  return `${this.personalInfo?.firstName || ''} ${this.personalInfo?.lastName || ''}`.trim();
});

// Transform output
visitorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    // Map appointment to appointmentInfo for frontend compatibility
    if (ret.appointment) {
      ret.appointmentInfo = {
        departureDate: ret.appointment.departureDate || '',
        departureTime: ret.appointment.departureTime || '',
        interviewDate: ret.appointment.interviewDate || '',
        prayerDate: ret.appointment.prayerDate || '',
      };
    }
    // Map callStatusInfo to callStatuses for frontend compatibility
    if (ret.callStatusInfo) {
      ret.callStatuses = ret.callStatusInfo;
    } else {
      ret.callStatuses = [];
    }
    return ret;
  },
});

export const Visitor = mongoose.model('Visitor', visitorSchema);
