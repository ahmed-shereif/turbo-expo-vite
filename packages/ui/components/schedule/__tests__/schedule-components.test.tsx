import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViewModeToggle, SchedulePresets, WeeklyScheduleEditor, TimeOffManager, CalendarView } from '../index';
import { WeekSchedule, DAYS } from '../types';

// Mock Tamagui components
const mockWeekSchedule: WeekSchedule = DAYS.reduce((acc, day) => ({
  ...acc,
  [day.key]: { enabled: false, ranges: [] }
}), {} as WeekSchedule);

describe('Schedule Components', () => {
  it('ViewModeToggle renders correctly', () => {
    const mockOnModeChange = vi.fn();
    render(
      <ViewModeToggle 
        currentMode="list" 
        onModeChange={mockOnModeChange} 
      />
    );
    
    expect(screen.getByText('List View')).toBeInTheDocument();
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
  });

  it('SchedulePresets renders correctly', () => {
    const mockOnApplyPreset = vi.fn();
    const mockOnCopyMondayToWeek = vi.fn();
    const mockOnClearAll = vi.fn();
    
    render(
      <SchedulePresets
        onApplyPreset={mockOnApplyPreset}
        onCopyMondayToWeek={mockOnCopyMondayToWeek}
        onClearAll={mockOnClearAll}
      />
    );
    
    expect(screen.getByText('Quick Setup')).toBeInTheDocument();
  });

  it('WeeklyScheduleEditor renders correctly', () => {
    const mockOnUpdateDay = vi.fn();
    const mockOnAddTimeRange = vi.fn();
    const mockOnRemoveTimeRange = vi.fn();
    const mockOnUpdateTimeRange = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <WeeklyScheduleEditor
        weeklyTemplate={mockWeekSchedule}
        onUpdateDay={mockOnUpdateDay}
        onAddTimeRange={mockOnAddTimeRange}
        onRemoveTimeRange={mockOnRemoveTimeRange}
        onUpdateTimeRange={mockOnUpdateTimeRange}
        onSave={mockOnSave}
        isSaving={false}
      />
    );
    
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
  });

  it('TimeOffManager renders correctly', () => {
    const mockOnAddBlackout = vi.fn();
    const mockOnRemoveBlackout = vi.fn();
    
    render(
      <TimeOffManager
        blackouts={[]}
        onAddBlackout={mockOnAddBlackout}
        onRemoveBlackout={mockOnRemoveBlackout}
        isAdding={false}
        isRemoving={false}
      />
    );
    
    expect(screen.getByText('Time Off')).toBeInTheDocument();
  });

  it('CalendarView renders correctly', () => {
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
        sessions={[]}
        currentDate={new Date()}
        onDateChange={() => {}}
        onPreviousWeek={mockOnPreviousWeek}
        onNextWeek={mockOnNextWeek}
        onToday={mockOnToday}
        onClearOverrides={mockOnClearOverrides}
        onToggleHourAvailability={mockOnToggleHourAvailability}
        onSave={mockOnSave}
        isSaving={false}
      />
    );
    
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
  });
});
