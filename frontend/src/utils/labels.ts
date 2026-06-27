import { CaseStatus, IdentityStatus, Sex, FamilyVerifyStatus, Role } from '../types';

export const caseStatusLabel: Record<CaseStatus, string> = {
  UNIDENTIFIED: 'Sin identificar',
  PARTIAL_IDENTITY: 'Identidad parcial',
  IDENTIFIED: 'Identificado',
  HOSPITALIZED: 'Hospitalizado',
  IN_OBSERVATION: 'En observación',
  TRANSFERRED: 'Trasladado',
  REUNIFIED: 'Reunificado',
  DECEASED: 'Fallecido',
};

export const caseStatusColor: Record<CaseStatus, string> = {
  UNIDENTIFIED: 'bg-red-100 text-red-800',
  PARTIAL_IDENTITY: 'bg-yellow-100 text-yellow-800',
  IDENTIFIED: 'bg-blue-100 text-blue-800',
  HOSPITALIZED: 'bg-purple-100 text-purple-800',
  IN_OBSERVATION: 'bg-orange-100 text-orange-800',
  TRANSFERRED: 'bg-indigo-100 text-indigo-800',
  REUNIFIED: 'bg-green-100 text-green-800',
  DECEASED: 'bg-gray-100 text-gray-800',
};

export const identityStatusLabel: Record<IdentityStatus, string> = {
  UNIDENTIFIED: 'Sin identificar',
  PARTIAL: 'Identidad parcial',
  IDENTIFIED: 'Identificado',
  REUNIFIED: 'Reunificado',
};

export const sexLabel: Record<Sex, string> = {
  MALE: 'Masculino',
  FEMALE: 'Femenino',
  UNDETERMINED: 'No determinado',
};

export const familyVerifyLabel: Record<FamilyVerifyStatus, string> = {
  UNVERIFIED: 'No verificado',
  IN_PROCESS: 'En proceso',
  CONFIRMED: 'Confirmado',
};

export const roleLabel: Record<Role, string> = {
  ADMIN: 'Administrador',
  RESCUER: 'Rescatista',
  HOSPITAL: 'Hospital',
  VIEWER: 'Solo lectura',
};

export function formatDate(date: string | Date, withTime = false): string {
  const d = new Date(date);
  if (withTime) return d.toLocaleString('es-VE', { timeZone: 'America/Caracas' });
  return d.toLocaleDateString('es-VE', { timeZone: 'America/Caracas' });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' });
}
