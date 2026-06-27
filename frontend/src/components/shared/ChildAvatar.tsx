import { User } from 'lucide-react';
import { Photo, Sex } from '../../types';

interface ChildAvatarProps {
  photos?: Photo[];
  sex?: Sex;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24', xl: 'w-36 h-36' };
const iconSizes = { sm: 16, md: 24, lg: 36, xl: 48 };
const bgColors = { MALE: 'bg-blue-100 text-blue-400', FEMALE: 'bg-pink-100 text-pink-400', UNDETERMINED: 'bg-gray-100 text-gray-400' };

export function ChildAvatar({ photos, sex = 'UNDETERMINED', size = 'md', className = '' }: ChildAvatarProps) {
  const mainPhoto = photos?.find(p => p.isMain) || photos?.[0];

  if (mainPhoto?.thumbnailUrl || mainPhoto?.url) {
    return (
      <img
        src={mainPhoto.thumbnailUrl || mainPhoto.url}
        alt="Foto del niño"
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center ${bgColors[sex]} ${className}`}>
      <User size={iconSizes[size]} />
    </div>
  );
}
