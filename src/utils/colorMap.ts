export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  deliverance: { bg: 'bg-purple-500', text: 'text-white' },
  prophecy: { bg: 'bg-blue-500', text: 'text-white' },
  breakthrough: { bg: 'bg-green-500', text: 'text-white' },
  testimony: { bg: 'bg-orange-500', text: 'text-white' },
  'follow up': { bg: 'bg-orange-600', text: 'text-white' },
  followup: { bg: 'bg-orange-600', text: 'text-white' },
  'has testimony': { bg: 'bg-teal-500', text: 'text-white' },
  pending: { bg: 'bg-yellow-500', text: 'text-black' },
  'in progress': { bg: 'bg-blue-400', text: 'text-white' },
  completed: { bg: 'bg-green-600', text: 'text-white' },
  'no answer': { bg: 'bg-gray-500', text: 'text-white' },
  voicemail: { bg: 'bg-indigo-500', text: 'text-white' },
  'callback requested': { bg: 'bg-cyan-500', text: 'text-white' },
  'wrong number': { bg: 'bg-red-500', text: 'text-white' },
  default: { bg: 'bg-gray-400', text: 'text-white' },
};

export const getStatusColor = (status: string): { bg: string; text: string } => {
  const key = status.toLowerCase().trim();
  return STATUS_COLORS[key] || STATUS_COLORS.default;
};

export const CALL_STATUS_OPTIONS = [
  'Pending',
  'In Progress',
  'Completed',
  'No Answer',
  'Voicemail',
  'Callback Requested',
  'Wrong Number',
];
