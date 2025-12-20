import { useState } from 'react';
import { StringHelper } from '../utils/stringUtils';

interface AvatarProps {
  photoUrl?: string;
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ photoUrl, firstName, lastName, size = 'md' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  const initials = StringHelper.getInitials(firstName, lastName);

  if (photoUrl && !imageError) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary-500 flex items-center justify-center text-white font-bold`}
    >
      {initials}
    </div>
  );
}
