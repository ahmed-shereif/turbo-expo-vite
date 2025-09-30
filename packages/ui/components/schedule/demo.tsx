import React from 'react';
import { CalendarView } from './CalendarView';
import { WeekSchedule, DAYS } from './types';
import dayjs from 'dayjs';

// Demo component to test session navigation
export function CalendarDemo() {
  const mockWeekSchedule: WeekSchedule = DAYS.reduce((acc, day) => ({
    ...acc,
    [day.key]: { enabled: true, ranges: [{ from: '09:00', to: '17:00' }] }
  }), {} as WeekSchedule);

  const mockSessions = [
    {
      id: 'session-30min',
      type: 'OPEN' as const,
      status: 'ACTIVE',
      startAt: dayjs().hour(9).minute(30).toISOString(),
      durationMinutes: 30, // 0.5 hours - testing ultra-compact layout
      seats: { filled: 1, total: 2 },
      court: { id: 'court-1', name: 'Quick Court', area: 'Downtown' },
      creator: { playerId: 'player-1', name: 'John Doe' }
    },
    {
      id: 'session-123',
      type: 'OPEN' as const,
      status: 'ACTIVE',
      startAt: dayjs().hour(10).minute(0).toISOString(),
      durationMinutes: 60,
      seats: { filled: 2, total: 4 },
      court: { id: 'court-1', name: 'Court A', area: 'Downtown' },
      creator: { playerId: 'player-1', name: 'John Doe' }
    },
    {
      id: 'session-456',
      type: 'OPEN' as const,
      status: 'ACTIVE',
      startAt: dayjs().hour(14).minute(0).toISOString(),
      durationMinutes: 90, // 1.5 hours - this should now display properly
      seats: { filled: 1, total: 3 },
      court: { id: 'court-2', name: 'Court B', area: 'Uptown' },
      creator: { playerId: 'player-2', name: 'Jane Smith' }
    },
    {
      id: 'session-789',
      type: 'OPEN' as const,
      status: 'ACTIVE',
      startAt: dayjs().hour(16).minute(30).toISOString(),
      durationMinutes: 90, // Another 1.5 hour session
      seats: { filled: 3, total: 4 },
      court: { id: 'court-3', name: 'Court C', area: 'Midtown' },
      creator: { playerId: 'player-3', name: 'Bob Wilson' }
    },
    {
      id: 'session-long',
      type: 'PRIVATE' as const,
      status: 'ACTIVE',
      startAt: dayjs().hour(18).minute(0).toISOString(),
      durationMinutes: 180, // 3 hours - testing full layout
      seats: { filled: 2, total: 4 },
      court: { id: 'court-4', name: 'Premium Court', area: 'Uptown' },
      creator: { playerId: 'player-4', name: 'Alice Johnson' }
    }
  ];

  const handleSessionClick = (session: any) => {
    console.log('Session clicked:', session);
    alert(`Navigating to session: ${session.id} at ${session.court.name}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Calendar Navigation Demo</h2>
      <p>Click on any session in the calendar to test navigation:</p>
      
      <CalendarView
        weeklyTemplate={mockWeekSchedule}
        dailyOverrides={{}}
        sessions={mockSessions}
        currentDate={dayjs()}
        onDateChange={() => {}}
        onPreviousWeek={() => console.log('Previous week')}
        onNextWeek={() => console.log('Next week')}
        onToday={() => console.log('Today')}
        onClearOverrides={() => console.log('Clear overrides')}
        onToggleHourAvailability={() => console.log('Toggle hour')}
        onSave={() => console.log('Save')}
        onSessionClick={handleSessionClick}
        isSaving={false}
      />
    </div>
  );
}