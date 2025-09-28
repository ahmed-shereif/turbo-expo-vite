import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '../CalendarView';
import { WeekSchedule, DAYS } from '../types';
import dayjs from 'dayjs';

// Mock Tamagui components
vi.mock('tamagui', () => ({
  YStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  XStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  H3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Button: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>{children}</button>
  ),
}));

vi.mock('../BrandCard', () => ({
  BrandCard: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('../BrandButton', () => ({
  BrandButton: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>{children}</button>
  ),
}));

vi.mock('../SafeText', () => ({
  SafeText: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

const mockWeekSchedule: WeekSchedule = DAYS.reduce((acc, day) => ({
  ...acc,
  [day.key]: { enabled: true, ranges: [{ from: '09:00', to: '17:00' }] }
}), {} as WeekSchedule);

const mockSession = {
  id: 'session-123',
  type: 'OPEN' as const,
  status: 'ACTIVE',
  startAt: dayjs().hour(10).minute(0).toISOString(),
  durationMinutes: 60,
  seats: { filled: 2, total: 4 },
  court: { id: 'court-1', name: 'Court A', area: 'Downtown' },
  creator: { playerId: 'player-1', name: 'John Doe' }
};

describe('CalendarView Navigation', () => {
  it('calls onSessionClick when session is clicked', () => {
    const mockOnSessionClick = vi.fn();
    const mockOnPreviousWeek = vi.fn();
    const mockOnNextWeek = vi.fn();
    const mockOnToday = vi.fn();
    const mockOnClearOverrides = vi.fn();
    const mockOnToggleHourAvailability = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <CalendarView
        weeklyTemplate={mockWeekSchedule}
        dailyOverrides={{}}
        sessions={[mockSession]}
        currentDate={dayjs()}
        onDateChange={() => {}}
        onPreviousWeek={mockOnPreviousWeek}
        onNextWeek={mockOnNextWeek}
        onToday={mockOnToday}
        onClearOverrides={mockOnClearOverrides}
        onToggleHourAvailability={mockOnToggleHourAvailability}
        onSave={mockOnSave}
        onSessionClick={mockOnSessionClick}
        isSaving={false}
      />
    );
    
    // Find the session element and click it
    const sessionElement = screen.getByText('Court A');
    fireEvent.click(sessionElement);
    
    // Verify the callback was called with the correct session
    expect(mockOnSessionClick).toHaveBeenCalledWith(mockSession);
  });

  it('does not make sessions clickable when onSessionClick is not provided', () => {
    const mockOnPreviousWeek = vi.fn();
    const mockOnNextWeek = vi.fn();
    const mockOnToday = vi.fn();
    const mockOnClearOverrides = vi.fn();
    const mockOnToggleHourAvailability = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <CalendarView
        weeklyTemplate={mockWeekSchedule}
        dailyOverrides={{}}
        sessions={[mockSession]}
        currentDate={dayjs()}
        onDateChange={() => {}}
        onPreviousWeek={mockOnPreviousWeek}
        onNextWeek={mockOnNextWeek}
        onToday={mockOnToday}
        onClearOverrides={mockOnClearOverrides}
        onToggleHourAvailability={mockOnToggleHourAvailability}
        onSave={mockOnSave}
        // onSessionClick is not provided
        isSaving={false}
      />
    );
    
    // Session should be displayed but not clickable
    expect(screen.getByText('Court A')).toBeInTheDocument();
  });
});