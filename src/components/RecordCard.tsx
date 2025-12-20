import { CallRecord } from '../types';
import { Avatar } from './Avatar';
import { StatusChip } from './StatusChip';
import { DateHelper } from '../utils/dateUtils';
import { StringHelper } from '../utils/stringUtils';

interface RecordCardProps {
  record: CallRecord;
  onClick: () => void;
}

export function RecordCard({ record, onClick }: RecordCardProps) {
  const { personalInfo, appointmentInfo, callStatuses, status } = record;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
  const latestCallStatus = callStatuses.length > 0 ? callStatuses[0] : null;

  const displayDate = DateHelper.formatDateForDisplay(appointmentInfo.prayerDate);

  return (
    <div
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all"
      onClick={onClick}
    >
      <div className="flex">
        {/* Avatar */}
        <Avatar
          photoUrl={record.photo}
          firstName={personalInfo.firstName}
          lastName={personalInfo.lastName}
          size="md"
        />

        {/* Info */}
        <div className="flex-1 ml-3 min-w-0">
          {/* Name and Phone */}
          <h3 className="text-gray-900 font-semibold text-base truncate">
            {StringHelper.ifEmpty(fullName, 'Unknown')}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {StringHelper.formatPhoneNumber(personalInfo.phone)}
          </p>

          {/* Date */}
          <div className="flex items-center mt-1">
            <span className="text-gray-400 text-xs">Prayer Date: </span>
            <span className="text-gray-600 text-xs font-medium ml-1">
              {displayDate}
            </span>
          </div>

          {/* Status Chips */}
          {status.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {status.slice(0, 3).map((s, index) => (
                <StatusChip key={index} status={s} size="sm" />
              ))}
              {status.length > 3 && (
                <span className="bg-gray-300 rounded-full px-2 py-0.5 text-gray-600 text-xs">
                  +{status.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Call Status Info */}
          {latestCallStatus && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center">
                <span className="bg-blue-100 rounded px-2 py-0.5 text-blue-700 text-xs font-medium">
                  {latestCallStatus.callStatus}
                </span>
                {latestCallStatus.evangelistName && (
                  <span className="text-gray-400 text-xs ml-2">
                    by {latestCallStatus.evangelistName}
                  </span>
                )}
              </div>
              {latestCallStatus.followUp && (
                <p className="text-orange-600 text-xs font-medium mt-1">
                  Follow-up required
                </p>
              )}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center ml-2">
          <span className="text-gray-300 text-lg">&rsaquo;</span>
        </div>
      </div>
    </div>
  );
}
