import { useEffect, useState } from 'react';
import { 
  Screen, 
  SafeText,
  ViewModeToggle,
  SchedulePresets,
  WeeklyScheduleEditor,
  TimeOffManager,
  CalendarView,
  useScheduleTemplate,
  useDailyOverrides,
  useCalendarNavigation,
  DAYS
} from '@repo/ui';
import type { WeekSchedule } from '@repo/ui';
import { useAuth } from '../../auth/AuthContext';
import { 
  useTrainerCalendarWithWindows, 
  useUpdateWorkingWindows, 
  useBlackouts, 
  useAddBlackout, 
  useRemoveBlackout,
  useAllTrainerSessions
} from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, ScrollView } from 'tamagui';
import { notify } from '../../lib/notify';
import dayjs from 'dayjs';


export default function TrainerAvailability() {
  const { user } = useAuth();
  const trainerId = user?.id || '';
  
  // Use custom hooks for state management
  const {
    weeklyTemplate,
    setWeeklyTemplate,
    addTimeRangeToTemplate,
    removeTimeRangeFromTemplate,
    updateTimeRangeInTemplate,
    clearAll,
    copyMondayToWeek,
  } = useScheduleTemplate();
  
  const {
    dailyOverrides,
    getEffectiveDaySchedule,
    updateDailyOverride,
    clearAllDailyOverrides,
  } = useDailyOverrides();
  
  const {
    currentDate,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useCalendarNavigation();
  
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const { data: calendar } = useTrainerCalendarWithWindows(trainerId);
  const { data: blackouts = [] } = useBlackouts(trainerId);
  const { data: sessionsData } = useAllTrainerSessions('ALL');
  const updateWorkingMutation = useUpdateWorkingWindows(trainerId);
  const addBlackoutMutation = useAddBlackout(trainerId);
  const removeBlackoutMutation = useRemoveBlackout();

  useEffect(() => {
    if (calendar?.workingWindows) {
      const schedule: WeekSchedule = DAYS.reduce((acc, day) => ({
        ...acc,
        [day.key]: { enabled: false, ranges: [] }
      }), {} as WeekSchedule);

      // Convert backend format to frontend format
      const dayNumberToName: Record<number, string> = {
        0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
      };

      calendar.workingWindows.forEach((window: any) => {
        // Backend format: { dow: [1,2,3], startLocal: "09:00", endLocal: "17:00" }
        window.dow.forEach((dayNumber: number) => {
          const dayName = dayNumberToName[dayNumber] as keyof WeekSchedule;
          if (dayName && schedule[dayName]) {
            schedule[dayName] = {
              enabled: true,
              ranges: [
                ...(schedule[dayName].ranges || []),
                { from: window.startLocal, to: window.endLocal }
              ],
            };
          }
        });
      });

      setWeeklyTemplate(schedule);
    }
  }, [calendar, setWeeklyTemplate]);

  // Event handlers
  const applyPreset = (preset: any) => {
    setWeeklyTemplate(preset.schedule);
    notify.success(`Applied ${preset.name} schedule`);
  };

  const handleClearAll = () => {
    clearAll();
    notify.success('All schedules cleared');
  };

  const handleCopyMondayToWeek = () => {
    copyMondayToWeek();
    notify.success('Monday schedule copied to all days');
  };

  const handleClearAllDailyOverrides = () => {
    clearAllDailyOverrides();
    notify.success('All daily overrides cleared. Calendar will now use weekly template.');
  };

  // Calendar view helpers
  const toggleHourAvailability = (date: dayjs.Dayjs, hour: number) => {
    const daySchedule = getEffectiveDaySchedule(date, weeklyTemplate);
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!daySchedule.enabled) {
      // Enable the day and add this hour
      updateDailyOverride(date, {
        enabled: true,
        ranges: [{ from: timeStr, to: `${(hour + 1).toString().padStart(2, '0')}:00` }]
      });
    } else {
      // Check if this hour is already covered
      const existingRange = daySchedule.ranges.find(range => 
        timeStr >= range.from && timeStr < range.to
      );
      
      if (existingRange) {
        // Remove this hour from the range
        const newRanges = daySchedule.ranges.map(range => {
          if (range === existingRange) {
            if (timeStr === range.from) {
              // Remove from start
              return { from: `${(hour + 1).toString().padStart(2, '0')}:00`, to: range.to };
            } else if (timeStr === range.to) {
              // Remove from end
              return { from: range.from, to: `${hour.toString().padStart(2, '0')}:00` };
            } else {
              // Split the range
              return [
                { from: range.from, to: `${hour.toString().padStart(2, '0')}:00` },
                { from: `${(hour + 1).toString().padStart(2, '0')}:00`, to: range.to }
              ];
            }
          }
          return range;
        }).flat().filter(range => range.from !== range.to);
        
        updateDailyOverride(date, {
          ...daySchedule,
          ranges: newRanges.length > 0 ? newRanges : []
        });
      } else {
        // Add this hour
        const newRanges = [...daySchedule.ranges, { 
          from: timeStr, 
          to: `${(hour + 1).toString().padStart(2, '0')}:00` 
        }].sort((a, b) => a.from.localeCompare(b.from));
        
        updateDailyOverride(date, {
          ...daySchedule,
          ranges: newRanges
        });
      }
    }
  };

  const saveWorkingWindows = async () => {
    try {
      // Transform frontend data structure to backend format
      const windows = DAYS
        .filter(day => weeklyTemplate[day.key].enabled && weeklyTemplate[day.key].ranges.length > 0)
        .map(day => {
          // Convert day name to day of week number (0=Sunday, 1=Monday, etc.)
          const dayToNumber: Record<string, number> = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
          };
          
          // For each time range, create a separate window entry
          return weeklyTemplate[day.key].ranges.map(range => ({
            dow: [dayToNumber[day.key]],
            startLocal: range.from,
            endLocal: range.to,
            effectiveFrom: dayjs().format('YYYY-MM-DD'), // Start from today
            effectiveTo: dayjs().add(1, 'year').format('YYYY-MM-DD'), // Valid for 1 year
          }));
        })
        .flat(); // Flatten the array since we create multiple entries per day

      await updateWorkingMutation.mutateAsync({ windows });
      notify.success('Your weekly availability template has been saved! 🎉');
    } catch (error) {
      notify.error('Failed to save availability. Please try again.');
    }
  };

  const handleAddBlackout = async (blackout: { startAt: string; endAt: string; reason?: string }) => {
    if (!blackout.startAt || !blackout.endAt) {
      notify.error('Please fill in start and end times');
      return;
    }

    try {
      await addBlackoutMutation.mutateAsync({
        startAt: new Date(blackout.startAt).toISOString(),
        endAt: new Date(blackout.endAt).toISOString(),
        reason: blackout.reason || undefined,
      });
      notify.success('Blackout added successfully');
    } catch (error) {
      notify.error('Failed to add blackout');
    }
  };

  const handleRemoveBlackout = async (blackoutId: string) => {
    try {
      await removeBlackoutMutation.mutateAsync(blackoutId);
      notify.success('Blackout removed successfully');
    } catch (error) {
      notify.error('Failed to remove blackout');
    }
  };


  return (
    <Screen>
      <ScrollView>
        <YStack space="$6" padding="$4" maxWidth={1200} alignSelf="center" width="100%">
          {/* Header Section */}
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack space="$2">
                <H2 color="$textHigh">Set Your Availability</H2>
                <SafeText textAlign="left" color="$textMuted" fontSize="$4">
                  Tell players when you're available for training sessions. All times are in Africa/Cairo timezone.
                </SafeText>
              </YStack>
              <ViewModeToggle 
                currentMode={viewMode} 
                onModeChange={setViewMode} 
              />
            </XStack>
          </YStack>

          {/* Conditional Content Based on View Mode */}
          {viewMode === 'calendar' ? (
            <CalendarView
              weeklyTemplate={weeklyTemplate}
              dailyOverrides={dailyOverrides}
              sessions={sessionsData?.items || []}
              currentDate={currentDate}
              onDateChange={() => {}} // Not used in this implementation
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
              onClearOverrides={handleClearAllDailyOverrides}
              onToggleHourAvailability={toggleHourAvailability}
              onSave={saveWorkingWindows}
              isSaving={updateWorkingMutation.isPending}
            />
          ) : (
            <>
              {/* Quick Presets */}
              <SchedulePresets
                onApplyPreset={applyPreset}
                onCopyMondayToWeek={handleCopyMondayToWeek}
                onClearAll={handleClearAll}
              />

              {/* Weekly Schedule */}
              <WeeklyScheduleEditor
                weeklyTemplate={weeklyTemplate}
                onUpdateDay={(day, schedule) => {
                  setWeeklyTemplate(prev => ({
                    ...prev,
                    [day]: schedule,
                  }));
                }}
                onAddTimeRange={addTimeRangeToTemplate}
                onRemoveTimeRange={removeTimeRangeFromTemplate}
                onUpdateTimeRange={updateTimeRangeInTemplate}
                onSave={saveWorkingWindows}
                isSaving={updateWorkingMutation.isPending}
              />
            </>
          )}

          {/* Time Off Manager */}
          <TimeOffManager
            blackouts={blackouts}
            onAddBlackout={handleAddBlackout}
            onRemoveBlackout={handleRemoveBlackout}
            isAdding={addBlackoutMutation.isPending}
            isRemoving={removeBlackoutMutation.isPending}
          />
        </YStack>
      </ScrollView>
    </Screen>
  );
}