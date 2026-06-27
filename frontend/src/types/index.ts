export type Role = 'ADMIN' | 'RESCUER' | 'HOSPITAL' | 'VIEWER';
export type Sex = 'MALE' | 'FEMALE' | 'UNDETERMINED';
export type IdentityStatus = 'UNIDENTIFIED' | 'PARTIAL' | 'IDENTIFIED' | 'REUNIFIED';
export type CaseStatus = 'UNIDENTIFIED' | 'PARTIAL_IDENTITY' | 'IDENTIFIED' | 'HOSPITALIZED' | 'IN_OBSERVATION' | 'TRANSFERRED' | 'REUNIFIED' | 'DECEASED';
export type FamilyVerifyStatus = 'UNVERIFIED' | 'IN_PROCESS' | 'CONFIRMED';
export type TimelineEventType = 'REGISTERED' | 'FOUND_LOCATION_SET' | 'TRANSFER' | 'MEDICAL_ADMISSION' | 'MEDICAL_UPDATE' | 'MEDICAL_DISCHARGE' | 'PHOTO_ADDED' | 'IDENTITY_UPDATED' | 'FAMILY_ADDED' | 'FAMILY_VERIFIED' | 'STATUS_CHANGED' | 'REUNIFICATION' | 'NOTE_ADDED';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  email?: string;
  organization?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isMain: boolean;
  description?: string;
  uploadedAt: string;
}

export interface FindLocation {
  id: string;
  state: string;
  municipality: string;
  parish?: string;
  sector?: string;
  address?: string;
  gpsLat?: number;
  gpsLng?: number;
  foundAt: string;
  rescueOrg?: string;
  rescuerName?: string;
  photoUrl?: string;
  observations?: string;
}

export interface CurrentLocation {
  id: string;
  hospital: string;
  area?: string;
  bedNumber?: string;
  since: string;
  status?: string;
}

export interface Transfer {
  id: string;
  origin: string;
  destination: string;
  departedAt: string;
  arrivedAt?: string;
  reason?: string;
  transport?: string;
  responsible?: string;
  observations?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  hospital: string;
  admittedAt: string;
  diagnosis?: string;
  healthStatus?: string;
  doctor?: string;
  treatment?: string;
  dischargedAt?: string;
  observations?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  relationship: string;
  document?: string;
  phone?: string;
  address?: string;
  email?: string;
  verifyStatus: FamilyVerifyStatus;
  observations?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  description: string;
  occurredAt: string;
  user?: { fullName: string; role: Role };
}

export interface Child {
  id: string;
  code: string;
  firstName?: string;
  secondName?: string;
  lastName?: string;
  nickname?: string;
  sex: Sex;
  approximateAge?: number;
  birthDateEst?: string;
  nationality?: string;
  identityStatus: IdentityStatus;
  caseStatus: CaseStatus;
  rescueOrg?: string;
  rescuerName?: string;
  rescuedAt: string;
  observations?: string;
  skinColor?: string;
  eyeColor?: string;
  hairColor?: string;
  heightCm?: number;
  weightKg?: number;
  build?: string;
  specialMarks?: string;
  scars?: string;
  birthmarks?: string;
  physicalObs?: string;
  createdAt: string;
  findLocation?: FindLocation;
  currentLocation?: CurrentLocation;
  photos?: Photo[];
  transfers?: Transfer[];
  medicalRecords?: MedicalRecord[];
  familyMembers?: FamilyMember[];
  timeline?: TimelineEvent[];
}

export interface DashboardStats {
  total: number;
  unidentified: number;
  partialIdentity: number;
  identified: number;
  hospitalized: number;
  inObservation: number;
  transferred: number;
  reunified: number;
  deceased: number;
  withFamily: number;
  withoutFamily: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
