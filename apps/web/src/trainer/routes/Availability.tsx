import { useState, useEffect } from 'react';
import { Screen, BrandCard, BrandButton, CheckboxField, TextField, SafeText } from '@repo/ui';
import { useAuth } from '../../auth/AuthContext';
import { 
  useTrainerCalendarWithWindows, 
  useUpdateWorkingWindows, 
  useBlackouts, 
  useAddBlackout, 
  useRemoveBlackout,
  useAllTrainerSessions
} from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, H3, Label, ScrollView, Button } from 'tamagui';
import { SessionSummary } from '@repo/trainer-api';
import { notify } from '../../lib/notify';
import dayjs from 'dayjs';

const DAYS = [
  { key: 'Mon', label: 'Monday', short: 'Mon' },
  { key: 'Tue', label: 'Tuesday', short: 'Tue' },
  { key: 'Wed', label: 'Wednesday', short: 'Wed' },
  { key: 'Thu', label: 'Thursday', short: 'Thu' },
  { key: 'Fri', label: 'Friday', short: 'Fri' },
  { key: 'Sat', label: 'Saturday', short: 'Sat' },
  { key: 'Sun', label: 'Sunday', short: 'Sun' }
] as const;

type DaySchedule = {
  enabled: boolean;
  ranges: Array<{ from: string; to: string }>;
};

type WeekSchedule = Record<typeof DAYS[number]['key'], DaySchedule>;

type PresetSchedule = {
  name: string;
  description: string;
  schedule: WeekSchedule;
};

// Smart preset schedules for trainers
const PRESET_SCHEDULES: PresetSchedule[] = [
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

export default function TrainerAvailability() {
  const { user } = useAuth();
  const trainerId = user?.id || '';
  
  // Weekly template - this is the persistent template that doesn't change with calendar modifications
  const [weeklyTemplate, setWeeklyTemplate] = useState<WeekSchedule>(() => 
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule)
  );
  
  // Daily calendar overrides - specific day modifications that don't affect the weekly template
  const [dailyOverrides, setDailyOverrides] = useState<Record<string, DaySchedule>>({});
  
  const [newBlackout, setNewBlackout] = useState({
    startAt: '',
    endAt: '',
    reason: '',
  });
  
  const [showPresets, setShowPresets] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { data: calendar } = useTrainerCalendarWithWindows(trainerId);
  const { data: blackouts = [] } = useBlackouts(trainerId);
  const { data: sessionsData } = useAllTrainerSessions('ALL'); // Get all sessions for calendar view
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
  }, [calendar]);

  // Weekly template functions - these affect the persistent weekly template
  const updateWeeklyTemplate = (day: typeof DAYS[number]['key'], schedule: DaySchedule) => {
    setWeeklyTemplate(prev => ({
      ...prev,
      [day]: schedule,
    }));
  };

  const addTimeRangeToTemplate = (day: typeof DAYS[number]['key']) => {
    updateWeeklyTemplate(day, {
      ...weeklyTemplate[day],
      ranges: [...weeklyTemplate[day].ranges, { from: '09:00', to: '17:00' }],
    });
  };

  const removeTimeRangeFromTemplate = (day: typeof DAYS[number]['key'], index: number) => {
    updateWeeklyTemplate(day, {
      ...weeklyTemplate[day],
      ranges: weeklyTemplate[day].ranges.filter((_, i) => i !== index),
    });
  };

  const updateTimeRangeInTemplate = (day: typeof DAYS[number]['key'], index: number, field: 'from' | 'to', value: string) => {
    const newRanges = [...weeklyTemplate[day].ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    updateWeeklyTemplate(day, {
      ...weeklyTemplate[day],
      ranges: newRanges,
    });
  };

  // Daily calendar override functions - these affect specific days without changing the template
  const getEffectiveDaySchedule = (date: dayjs.Dayjs): DaySchedule => {
    const dateKey = date.format('YYYY-MM-DD');
    const dayKey = date.format('ddd') as keyof WeekSchedule;
    
    // If there's a daily override, use it; otherwise use the weekly template
    return dailyOverrides[dateKey] || weeklyTemplate[dayKey];
  };

  const updateDailyOverride = (date: dayjs.Dayjs, schedule: DaySchedule) => {
    const dateKey = date.format('YYYY-MM-DD');
    setDailyOverrides(prev => ({
      ...prev,
      [dateKey]: schedule,
    }));
  };

  // Helper function for future use - clears override for a specific day
  const clearDailyOverride = (date: dayjs.Dayjs) => {
    const dateKey = date.format('YYYY-MM-DD');
    setDailyOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[dateKey];
      return newOverrides;
    });
  };


  const clearAllDailyOverrides = () => {
    setDailyOverrides({});
    notify.success('All daily overrides cleared. Calendar will now use weekly template.');
  };

  const applyPreset = (preset: PresetSchedule) => {
    setWeeklyTemplate(preset.schedule);
    setShowPresets(false);
    notify.success(`Applied ${preset.name} schedule`);
  };

  const copyMondayToWeek = () => {
    const mondaySchedule = weeklyTemplate.Mon;
    const newSchedule = { ...weeklyTemplate };
    DAYS.forEach(day => {
      if (day.key !== 'Mon') {
        newSchedule[day.key] = { ...mondaySchedule };
      }
    });
    setWeeklyTemplate(newSchedule);
    notify.success('Monday schedule copied to all days');
  };

  const clearAll = () => {
    setWeeklyTemplate(DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule));
    notify.success('All schedules cleared');
  };

  // Calendar view helpers
  const getSessionsForDate = (date: dayjs.Dayjs): SessionSummary[] => {
    if (!sessionsData?.items) return [];
    return sessionsData.items.filter(session => 
      dayjs(session.startAt).isSame(date, 'day')
    );
  };

  const getSessionsForHour = (date: dayjs.Dayjs, hour: number): SessionSummary[] => {
    const sessions = getSessionsForDate(date);
    
    return sessions.filter(session => {
      // Convert UTC session times to local time for comparison
      const sessionStart = dayjs(session.startAt);
      const sessionEnd = sessionStart.add(session.durationMinutes, 'minutes');
      
      // Get the local hour for the session start time
      const sessionStartHour = sessionStart.hour();
      const sessionEndHour = sessionEnd.hour();
      
      // Check if the session overlaps with this hour slot
      // A session overlaps if it starts in this hour OR ends in this hour OR spans this hour
      return (sessionStartHour === hour) || 
             (sessionEndHour === hour) || 
             (sessionStartHour < hour && sessionEndHour > hour);
    });
  };

  const isHourAvailable = (date: dayjs.Dayjs, hour: number): boolean => {
    const daySchedule = getEffectiveDaySchedule(date);
    
    if (!daySchedule.enabled) return false;
    
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    return daySchedule.ranges.some(range => 
      timeStr >= range.from && timeStr < range.to
    );
  };

  const toggleHourAvailability = (date: dayjs.Dayjs, hour: number) => {
    const daySchedule = getEffectiveDaySchedule(date);
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

  const getWeekDays = () => {
    const startOfWeek = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
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

  const handleAddBlackout = async () => {
    if (!newBlackout.startAt || !newBlackout.endAt) {
      notify.error('Please fill in start and end times');
      return;
    }

    try {
      await addBlackoutMutation.mutateAsync({
        startAt: new Date(newBlackout.startAt).toISOString(),
        endAt: new Date(newBlackout.endAt).toISOString(),
        reason: newBlackout.reason || undefined,
      });
      setNewBlackout({ startAt: '', endAt: '', reason: '' });
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

  // Calendar view component
  const renderCalendarView = () => (
    <BrandCard>
      <YStack space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H3 color="$textHigh">Calendar View</H3>
          <XStack space="$2">
            <Button 
              size="$3" 
              variant="outlined"
              onPress={() => setCurrentDate(currentDate.subtract(1, 'week'))}
            >
              ← Previous
            </Button>
            <Button 
              size="$3" 
              variant="outlined"
              onPress={() => setCurrentDate(dayjs())}
            >
              Today
            </Button>
            <Button 
              size="$3" 
              variant="outlined"
              onPress={() => setCurrentDate(currentDate.add(1, 'week'))}
            >
              Next →
            </Button>
            <Button 
              size="$3" 
              variant="outlined"
              onPress={clearAllDailyOverrides}
            >
              Clear Overrides
            </Button>
          </XStack>
        </XStack>

        <SafeText textAlign="center" color="$textMuted" fontSize="$4">
          Week of {currentDate.startOf('week').format('MMM D')} - {currentDate.endOf('week').format('MMM D, YYYY')}
        </SafeText>

        {/* Calendar Grid */}
        <YStack space="$2" maxWidth="100%" overflow="hidden">
          {/* Header with day names */}
          <XStack space="$2" minWidth={0} marginBottom="$2">
            <YStack width={60} padding="$2" flexShrink={0}>
              <SafeText textAlign="center" fontSize="$3" fontWeight="600" color="$textMuted">
                Time
              </SafeText>
            </YStack>
            {getWeekDays().map((date) => {
              const dateKey = date.format('YYYY-MM-DD');
              const hasOverride = dailyOverrides[dateKey];
              return (
                <YStack key={date.format('YYYY-MM-DD')} flex={1} padding="$2" minWidth={120} maxWidth={200} width={150} marginHorizontal="$1">
                  <SafeText textAlign="center" fontSize="$3" fontWeight="600" color="$textHigh">
                    {date.format('ddd')}
                  </SafeText>
                  <SafeText textAlign="center" fontSize="$2" color="$textMuted">
                    {date.format('MMM D')}
                  </SafeText>
                  {hasOverride && (
                    <SafeText textAlign="center" fontSize="$1" color="$accent" fontWeight="600">
                      Override
                    </SafeText>
                  )}
                </YStack>
              );
            })}
          </XStack>

          {/* Scrollable Calendar Container */}
          <YStack maxHeight={600} overflow="scroll" borderWidth={1} borderColor="$color6" borderRadius="$3" padding="$2">
            {/* Hour rows */}
            {Array.from({ length: 24 }, (_, hour) => (
              <XStack key={hour} space="$2" minHeight={60} marginBottom="$1">
                <YStack width={60} padding="$2" justifyContent="center" flexShrink={0} borderBottomWidth={1} borderColor="$color6">
                  <SafeText textAlign="center" fontSize="$3" color="$textMuted">
                    {hour.toString().padStart(2, '0')}:00
                  </SafeText>
                </YStack>
                {getWeekDays().map((date) => {
                  const sessions = getSessionsForHour(date, hour);
                  const hasSession = sessions.length > 0;
                  const isAvailable = isHourAvailable(date, hour);
                  
                  return (
                    <YStack 
                      key={`${date.format('YYYY-MM-DD')}-${hour}`} 
                      flex={1} 
                      minWidth={120}
                      maxWidth={200}
                      width={150}
                      padding="$2"
                      marginHorizontal="$1"
                      backgroundColor={
                        hasSession 
                          ? '$accent' 
                          : isAvailable 
                            ? '$secondary' 
                            : '$color3'
                      }
                      borderRadius="$2"
                      borderWidth={1}
                      borderColor={
                        hasSession 
                          ? '$accent' 
                          : isAvailable 
                            ? '$secondary' 
                            : '$color6'
                      }
                      cursor="pointer"
                      onPress={() => !hasSession && toggleHourAvailability(date, hour)}
                      pressStyle={{ opacity: 0.8 }}
                      opacity={hasSession ? 0.7 : 1}
                      height={60}
                      justifyContent="center"
                      overflow="hidden"
                      boxShadow="inset 0 0 0 1px $color6"
                    >
                      {hasSession && (
                        <YStack space="$1" width="100%" height="100%" justifyContent="center">
                          {sessions.map((session, idx) => (
                            <YStack key={idx} padding="$1" backgroundColor="$surface" borderRadius="$2" width="100%" flex={1} justifyContent="center" boxShadow="inset 0 0 0 1px $color6">
                              <SafeText textAlign="center" fontSize="$2" fontWeight="600" color="$textHigh" numberOfLines={1}>
                                {session.court?.name || 'Session'}
                              </SafeText>
                              <SafeText textAlign="center" fontSize="$1" color="$textMuted" numberOfLines={1}>
                                {dayjs(session.startAt).format('HH:mm')} - {dayjs(session.startAt).add(session.durationMinutes, 'minutes').format('HH:mm')}
                              </SafeText>
                            </YStack>
                          ))}
                        </YStack>
                      )}
                    </YStack>
                  );
                })}
              </XStack>
            ))}
          </YStack>
        </YStack>

        {/* Legend */}
        <YStack space="$2" padding="$3" backgroundColor="$bgSoft" borderRadius="$3">
          <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">
            Legend
          </SafeText>
          <SafeText textAlign="left" fontSize="$3" color="$textMuted" marginBottom="$2">
            Calendar view shows your weekly template as the base. You can click on hours to override specific days without affecting your weekly template.
          </SafeText>
          <XStack space="$4" flexWrap="wrap">
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$secondary" borderRadius="$2" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                Available (from template)
              </SafeText>
            </XStack>
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$accent" borderRadius="$2" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                Has Session
              </SafeText>
            </XStack>
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$color3" borderRadius="$2" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                Not Available
              </SafeText>
            </XStack>
            <XStack space="$2" alignItems="center">
              <SafeText textAlign="left" fontSize="$3" color="$accent" fontWeight="600">
                "Override"
              </SafeText>
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                Day has custom schedule
              </SafeText>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </BrandCard>
  );

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
              <XStack space="$2">
                <BrandButton 
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  onPress={() => setViewMode('list')}
                >
                  List View
                </BrandButton>
                <BrandButton 
                  variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                  onPress={() => setViewMode('calendar')}
                >
                  Calendar View
                </BrandButton>
              </XStack>
            </XStack>
          </YStack>

          {/* Conditional Content Based on View Mode */}
          {viewMode === 'calendar' ? (
            renderCalendarView()
          ) : (
            <>
              {/* Quick Presets */}
              <BrandCard>
                <YStack space="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3 color="$textHigh">Quick Setup</H3>
                    <BrandButton 
                      variant="outline" 
                      size="sm"
                      onPress={() => setShowPresets(!showPresets)}
                    >
                      {showPresets ? 'Hide Presets' : 'Show Presets'}
                    </BrandButton>
                  </XStack>
                  
                  {showPresets && (
                    <YStack space="$3">
                      <SafeText textAlign="left" color="$textMuted" fontSize="$3">
                        Choose a preset schedule to get started quickly:
                      </SafeText>
                      <XStack space="$3" flexWrap="wrap">
                        {PRESET_SCHEDULES.map((preset) => (
                          <BrandCard key={preset.name} elevated={false} padding="$3" minWidth={200}>
                            <YStack space="$2">
                              <SafeText textAlign="left" fontWeight="600" color="$textHigh">
                                {preset.name}
                              </SafeText>
                              <SafeText textAlign="left" color="$textMuted" fontSize="$3">
                                {preset.description}
                              </SafeText>
                              <BrandButton 
                                size="sm" 
                                variant="outline"
                                onPress={() => applyPreset(preset)}
                              >
                                Use This
                              </BrandButton>
                            </YStack>
                          </BrandCard>
                        ))}
                      </XStack>
                    </YStack>
                  )}
                </YStack>
              </BrandCard>

              {/* Weekly Schedule */}
              <BrandCard>
                <YStack space="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3 color="$textHigh">Weekly Schedule</H3>
                    <XStack space="$2">
                      <BrandButton 
                        variant="outline" 
                        size="sm"
                        onPress={copyMondayToWeek}
                      >
                        Copy Monday
                      </BrandButton>
                      <BrandButton 
                        variant="outline" 
                        size="sm"
                        onPress={clearAll}
                      >
                        Clear All
                      </BrandButton>
                    </XStack>
                  </XStack>

                  <YStack space="$4">
                    {DAYS.map((day) => (
                      <BrandCard key={day.key} elevated={false} padding="$4">
                        <YStack space="$3">
                          <XStack justifyContent="space-between" alignItems="center">
                            <CheckboxField
                              label={day.label}
                              checked={weeklyTemplate[day.key].enabled}
                              onCheckedChange={(checked) => updateWeeklyTemplate(day.key, {
                                ...weeklyTemplate[day.key],
                                enabled: checked,
                                ranges: checked ? weeklyTemplate[day.key].ranges : [],
                              })}
                            />
                            {weeklyTemplate[day.key].enabled && (
                              <BrandButton 
                                size="sm" 
                                variant="outline"
                                onPress={() => addTimeRangeToTemplate(day.key)}
                              >
                                Add Time
                              </BrandButton>
                            )}
                          </XStack>

                          {weeklyTemplate[day.key].enabled && (
                            <YStack space="$3" paddingLeft="$6">
                              {weeklyTemplate[day.key].ranges.length === 0 ? (
                                <SafeText textAlign="left" color="$textMuted" fontSize="$3" fontStyle="italic">
                                  No time slots added yet. Click "Add Time" to get started.
                                </SafeText>
                              ) : (
                                weeklyTemplate[day.key].ranges.map((range, index) => (
                                  <XStack key={index} space="$3" alignItems="center">
                                    <YStack space="$1" flex={1}>
                                      <Label fontSize="$3" color="$textMedium">From</Label>
                                      <TextField
                                        value={range.from}
                                        onChangeText={(value) => updateTimeRangeInTemplate(day.key, index, 'from', value)}
                                        placeholder="09:00"
                                        type="time"
                                      />
                                    </YStack>
                                    <SafeText textAlign="center" color="$textMuted" fontSize="$4" marginTop="$6">
                                      to
                                    </SafeText>
                                    <YStack space="$1" flex={1}>
                                      <Label fontSize="$3" color="$textMedium">To</Label>
                                      <TextField
                                        value={range.to}
                                        onChangeText={(value) => updateTimeRangeInTemplate(day.key, index, 'to', value)}
                                        placeholder="17:00"
                                        type="time"
                                      />
                                    </YStack>
                                    <BrandButton 
                                      size="sm" 
                                      variant="outline"
                                      onPress={() => removeTimeRangeFromTemplate(day.key, index)}
                                      marginTop="$6"
                                    >
                                      Remove
                                    </BrandButton>
                                  </XStack>
                                ))
                              )}
                            </YStack>
                          )}
                        </YStack>
                      </BrandCard>
                    ))}
                  </YStack>

                  <BrandButton 
                    onPress={saveWorkingWindows}
                    disabled={updateWorkingMutation.isPending}
                    fullWidth
                    size="lg"
                  >
                    {updateWorkingMutation.isPending ? 'Saving Your Schedule...' : 'Save My Availability'}
                  </BrandButton>
                </YStack>
              </BrandCard>
            </>
          )}

          {/* Blackout Periods */}
          <BrandCard>
            <YStack space="$4">
              <H3 color="$textHigh">Time Off</H3>
              <SafeText textAlign="left" color="$textMuted" fontSize="$4">
                Block out specific dates when you're not available (vacation, personal time, etc.)
              </SafeText>

              {/* Add Blackout Form */}
              <YStack space="$4" padding="$4" backgroundColor="$bgSoft" borderRadius="$4">
                <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">
                  Add Time Off
                </SafeText>
                
                <XStack space="$3" flexWrap="wrap">
                  <YStack space="$2" flex={1} minWidth={200}>
                    <Label fontSize="$3" color="$textMedium">Start Date & Time</Label>
                    <TextField
                      value={newBlackout.startAt}
                      onChangeText={(value) => setNewBlackout(prev => ({ ...prev, startAt: value }))}
                      placeholder="2024-01-15T09:00"
                      type="datetime-local"
                    />
                  </YStack>
                  
                  <YStack space="$2" flex={1} minWidth={200}>
                    <Label fontSize="$3" color="$textMedium">End Date & Time</Label>
                    <TextField
                      value={newBlackout.endAt}
                      onChangeText={(value) => setNewBlackout(prev => ({ ...prev, endAt: value }))}
                      placeholder="2024-01-20T18:00"
                      type="datetime-local"
                    />
                  </YStack>
                  
                  <YStack space="$2" flex={1} minWidth={200}>
                    <Label fontSize="$3" color="$textMedium">Reason (Optional)</Label>
                    <TextField
                      placeholder="e.g., Vacation, Personal time"
                      value={newBlackout.reason}
                      onChangeText={(value) => setNewBlackout(prev => ({ ...prev, reason: value }))}
                    />
                  </YStack>
                  
                  <BrandButton 
                    size="sm"
                    onPress={handleAddBlackout}
                    disabled={addBlackoutMutation.isPending}
                    alignSelf="flex-end"
                  >
                    {addBlackoutMutation.isPending ? 'Adding...' : 'Add Time Off'}
                  </BrandButton>
                </XStack>
              </YStack>

              {/* Current Blackouts */}
              <YStack space="$3">
                <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">
                  Current Time Off
                </SafeText>
                
                {blackouts.length === 0 ? (
                  <SafeText textAlign="left" color="$textMuted" fontSize="$4" fontStyle="italic">
                    No time off scheduled
                  </SafeText>
                ) : (
                  <YStack space="$2">
                    {blackouts.map((blackout) => (
                      <XStack key={blackout.id} justifyContent="space-between" alignItems="center" padding="$3" backgroundColor="$bgSoft" borderRadius="$3">
                        <YStack space="$1">
                          <SafeText textAlign="left" fontSize="$4" fontWeight="500">
                            {new Date(blackout.startAt).toLocaleDateString()} {new Date(blackout.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' → '}
                            {new Date(blackout.endAt).toLocaleDateString()} {new Date(blackout.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </SafeText>
                          {blackout.reason && (
                            <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                              {blackout.reason}
                            </SafeText>
                          )}
                        </YStack>
                        <BrandButton 
                          size="sm" 
                          variant="outline"
                          onPress={() => handleRemoveBlackout(blackout.id)}
                          disabled={removeBlackoutMutation.isPending}
                        >
                          Remove
                        </BrandButton>
                      </XStack>
                    ))}
                  </YStack>
                )}
              </YStack>
            </YStack>
          </BrandCard>
        </YStack>
      </ScrollView>
    </Screen>
  );
}