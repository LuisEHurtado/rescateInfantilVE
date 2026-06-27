import { TimelineEvent } from '../../types';
import { formatDate, formatTime } from '../../utils/labels';
import { MapPin, ArrowRight, Stethoscope, Camera, User, Users, AlertCircle, Heart, FileText } from 'lucide-react';

const eventIcons: Record<string, any> = {
  REGISTERED: FileText,
  FOUND_LOCATION_SET: MapPin,
  TRANSFER: ArrowRight,
  MEDICAL_ADMISSION: Stethoscope,
  MEDICAL_UPDATE: Stethoscope,
  MEDICAL_DISCHARGE: Heart,
  PHOTO_ADDED: Camera,
  IDENTITY_UPDATED: User,
  FAMILY_ADDED: Users,
  FAMILY_VERIFIED: Users,
  STATUS_CHANGED: AlertCircle,
  REUNIFICATION: Heart,
  NOTE_ADDED: FileText,
};

const eventColors: Record<string, string> = {
  REGISTERED: 'bg-blue-500',
  FOUND_LOCATION_SET: 'bg-orange-500',
  TRANSFER: 'bg-indigo-500',
  MEDICAL_ADMISSION: 'bg-purple-500',
  MEDICAL_UPDATE: 'bg-purple-400',
  MEDICAL_DISCHARGE: 'bg-green-500',
  PHOTO_ADDED: 'bg-gray-500',
  IDENTITY_UPDATED: 'bg-yellow-500',
  FAMILY_ADDED: 'bg-teal-500',
  FAMILY_VERIFIED: 'bg-teal-600',
  STATUS_CHANGED: 'bg-amber-500',
  REUNIFICATION: 'bg-green-600',
  NOTE_ADDED: 'bg-gray-400',
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events.length) {
    return <p className="text-gray-500 text-sm text-center py-8">No hay eventos registrados aún.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {events.map((event) => {
          const Icon = eventIcons[event.eventType] || FileText;
          const color = eventColors[event.eventType] || 'bg-gray-500';
          return (
            <div key={event.id} className="relative flex gap-4 pl-12">
              <div className={`absolute left-2 top-1 w-6 h-6 rounded-full ${color} flex items-center justify-center ring-2 ring-white`}>
                <Icon size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-relaxed">{event.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{formatDate(event.occurredAt)} — {formatTime(event.occurredAt)}</span>
                  {event.user && <span className="text-xs text-gray-400">{event.user.fullName}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
