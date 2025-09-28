export const DAYS = [
  { key: 'Mon', label: 'Monday', short: 'Mon' },
  { key: 'Tue', label: 'Tuesday', short: 'Tue' },
  { key: 'Wed', label: 'Wednesday', short: 'Wed' },
  { key: 'Thu', label: 'Thursday', short: 'Thu' },
  { key: 'Fri', label: 'Friday', short: 'Fri' },
  { key: 'Sat', label: 'Saturday', short: 'Sat' },
  { key: 'Sun', label: 'Sunday', short: 'Sun' }
] as const;

export type DaySchedule = {
  enabled: boolean;
  ranges: Array<{ from: string; to: string }>;
};

export type WeekSchedule = Record<typeof DAYS[number]['key'], DaySchedule>;

export type PresetSchedule = {
  name: string;
  description: string;
  schedule: WeekSchedule;
};

export type ViewMode = 'list' | 'calendar';

export type BlackoutPeriod = {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string;
};

export type NewBlackout = {
  startAt: string;
  endAt: string;
  reason: string;
};

// Smart preset schedules for trainers
export const PRESET_SCHEDULES: PresetSchedule[] = [
  {
    name: 'Weekdays Only',
    description: 'Monday to Friday, 9 AM - 6 PM',
    schedule: {
      Mon: { enabled: true, ranges: [{ from: '09:00', to: '18:00' }] },
      Tue: { enabled: true, ranges: [{ from: '09:00', to: '18:00' }] },
      Wed: { enabled: true, ranges: [{ from: '09:00', to: '18:00' }] },
      Thu: { enabled: true, ranges: [{ from: '09:00', to: '18:00' }] },
      Fri: { enabled: true, ranges: [{ from: '09:00', to: '18:00' }] },
      Sat: { enabled: false, ranges: [] },
      Sun: { enabled: false, ranges: [] }
    }
  },
  {
    name: 'Weekends Only',
    description: 'Saturday & Sunday, 10 AM - 8 PM',
    schedule: {
      Mon: { enabled: false, ranges: [] },
      Tue: { enabled: false, ranges: [] },
      Wed: { enabled: false, ranges: [] },
      Thu: { enabled: false, ranges: [] },
      Fri: { enabled: false, ranges: [] },
      Sat: { enabled: true, ranges: [{ from: '10:00', to: '20:00' }] },
      Sun: { enabled: true, ranges: [{ from: '10:00', to: '20:00' }] }
    }
  },
  {
    name: 'Full Week',
    description: 'Every day, 8 AM - 10 PM',
    schedule: {
      Mon: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] },
      Tue: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] },
      Wed: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] },
      Thu: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] },
      Fri: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] },
      Sat: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] },
      Sun: { enabled: true, ranges: [{ from: '08:00', to: '22:00' }] }
    }
  },
  {
    name: 'Evenings Only',
    description: 'Monday to Friday, 6 PM - 11 PM',
    schedule: {
      Mon: { enabled: true, ranges: [{ from: '18:00', to: '23:00' }] },
      Tue: { enabled: true, ranges: [{ from: '18:00', to: '23:00' }] },
      Wed: { enabled: true, ranges: [{ from: '18:00', to: '23:00' }] },
      Thu: { enabled: true, ranges: [{ from: '18:00', to: '23:00' }] },
      Fri: { enabled: true, ranges: [{ from: '18:00', to: '23:00' }] },
      Sat: { enabled: false, ranges: [] },
      Sun: { enabled: false, ranges: [] }
    }
  }
];
