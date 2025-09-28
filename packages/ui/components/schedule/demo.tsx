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
      durationMinutes: 90,
      seats: { filled: 1, total: 3 },
      court: { id: 'court-2', name: 'Court B', area: 'Uptown' },
      creator: { playerId: 'player-2', name: 'Jane Smith' }
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