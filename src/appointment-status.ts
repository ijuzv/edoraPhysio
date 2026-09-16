export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CURRENT'
  | 'DISCONTINUED'
  | 'DISCHARGED'
  | 'FOLLOWUP_NEEDED'
  | 'CANCELLED'
  | 'NO_SHOW';

export const appointmentStatuses: AppointmentStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CURRENT',
  'DISCONTINUED',
  'DISCHARGED',
  'FOLLOWUP_NEEDED',
  'CANCELLED',
  'NO_SHOW',
];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CURRENT: 'Current',
  DISCONTINUED: 'Discontinued',
  DISCHARGED: 'Discharged',
  FOLLOWUP_NEEDED: 'Followup needed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
};

export const finalAppointmentStatuses = new Set<AppointmentStatus>([
  'DISCONTINUED',
  'DISCHARGED',
  'CANCELLED',
  'NO_SHOW',
]);

export function isFinalAppointmentStatus(status: string): boolean {
  return finalAppointmentStatuses.has(status as AppointmentStatus);
}

export function isAppointmentStatus(value: string): value is AppointmentStatus {
  return appointmentStatuses.includes(value as AppointmentStatus);
}
