import { getStatusColor } from '../utils/colorMap';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const colors = getStatusColor(status);
  const paddingClass = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`rounded-full ${colors.bg} ${colors.text} ${paddingClass} ${textClass} font-medium capitalize inline-block mr-1 mb-1`}
    >
      {status}
    </span>
  );
}
