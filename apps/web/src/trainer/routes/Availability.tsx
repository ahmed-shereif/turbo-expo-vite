import { useState, useEffect } from 'react';
import { Screen, BrandCard, BrandButton, CheckboxField, TextField, SafeText } from '@repo/ui';
import { useAuth } from '../../auth/AuthContext';
import { 
  useTrainerCalendar, 
  useUpdateWorkingWindows, 
  useBlackouts, 
  useAddBlackout, 
  useRemoveBlackout,
  useTrainerSessions
} from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, H3, Label, ScrollView, Button } from 'tamagui';
import { WorkingWindow, SessionSummary } from '@repo/trainer-api';
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
  
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(() => 
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule)
  );
  
  const [newBlackout, setNewBlackout] = useState({
    startAt: '',
    endAt: '',
    reason: '',
  });
  
  const [showPresets, setShowPresets] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { data: calendar } = useTrainerCalendar(trainerId);
  const { data: blackouts = [] } = useBlackouts(trainerId);
  const { data: sessionsData } = useTrainerSessions('ALL', 1, 100); // Get all sessions for calendar
  const updateWorkingMutation = useUpdateWorkingWindows(trainerId);
  const addBlackoutMutation = useAddBlackout(trainerId);
  const removeBlackoutMutation = useRemoveBlackout();

  useEffect(() => {
    if (calendar?.workingWindows) {
      const schedule: WeekSchedule = DAYS.reduce((acc, day) => ({
        ...acc,
        [day.key]: { enabled: false, ranges: [] }
      }), {} as WeekSchedule);

      calendar.workingWindows.forEach((window: WorkingWindow) => {
        schedule[window.day] = {
          enabled: true,
          ranges: window.ranges,
        };
      });

      setWeekSchedule(schedule);
    }
  }, [calendar]);

  const updateDaySchedule = (day: typeof DAYS[number]['key'], schedule: DaySchedule) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: schedule,
    }));
  };

  const addTimeRange = (day: typeof DAYS[number]['key']) => {
    updateDaySchedule(day, {
      ...weekSchedule[day],
      ranges: [...weekSchedule[day].ranges, { from: '09:00', to: '17:00' }],
    });
  };

  const removeTimeRange = (day: typeof DAYS[number]['key'], index: number) => {
    updateDaySchedule(day, {
      ...weekSchedule[day],
      ranges: weekSchedule[day].ranges.filter((_, i) => i !== index),
    });
  };

  const updateTimeRange = (day: typeof DAYS[number]['key'], index: number, field: 'from' | 'to', value: string) => {
    const newRanges = [...weekSchedule[day].ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    updateDaySchedule(day, {
      ...weekSchedule[day],
      ranges: newRanges,
    });
  };

  const applyPreset = (preset: PresetSchedule) => {
    setWeekSchedule(preset.schedule);
    setShowPresets(false);
    notify.success(`Applied ${preset.name} schedule`);
  };

  const copyMondayToWeek = () => {
    const mondaySchedule = weekSchedule.Mon;
    const newSchedule = { ...weekSchedule };
    DAYS.forEach(day => {
      if (day.key !== 'Mon') {
        newSchedule[day.key] = { ...mondaySchedule };
      }
    });
    setWeekSchedule(newSchedule);
    notify.success('Monday schedule copied to all days');
  };

  const clearAll = () => {
    setWeekSchedule(DAYS.reduce((acc, day) => ({
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

  const isHourAvailable = (date: dayjs.Dayjs, hour: number): boolean => {
    const dayKey = date.format('ddd') as keyof WeekSchedule;
    const daySchedule = weekSchedule[dayKey];
    
    if (!daySchedule.enabled) return false;
    
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    return daySchedule.ranges.some(range => 
      timeStr >= range.from && timeStr < range.to
    );
  };

  const toggleHourAvailability = (date: dayjs.Dayjs, hour: number) => {
    const dayKey = date.format('ddd') as keyof WeekSchedule;
    const daySchedule = weekSchedule[dayKey];
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!daySchedule.enabled) {
      // Enable the day and add this hour
      updateDaySchedule(dayKey, {
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
        
        updateDaySchedule(dayKey, {
          ...daySchedule,
          ranges: newRanges.length > 0 ? newRanges : []
        });
      } else {
        // Add this hour
        const newRanges = [...daySchedule.ranges, { 
          from: timeStr, 
          to: `${(hour + 1).toString().padStart(2, '0')}:00` 
        }].sort((a, b) => a.from.localeCompare(b.from));
        
        updateDaySchedule(dayKey, {
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
      const workingWindows: WorkingWindow[] = DAYS
        .filter(day => weekSchedule[day.key].enabled && weekSchedule[day.key].ranges.length > 0)
        .map(day => ({
          day: day.key,
          ranges: weekSchedule[day.key].ranges,
        }));

      await updateWorkingMutation.mutateAsync({ week: workingWindows });
      notify.success('Your availability has been saved! 🎉');
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
          </XStack>
        </XStack>

        <SafeText textAlign="center" color="$textMuted" fontSize="$4">
          Week of {currentDate.startOf('week').format('MMM D')} - {currentDate.endOf('week').format('MMM D, YYYY')}
        </SafeText>

        {/* Calendar Grid */}
        <YStack space="$2">
          {/* Header with day names */}
          <XStack space="$1">
            <YStack width={60} padding="$2">
              <SafeText textAlign="center" fontSize="$3" fontWeight="600" color="$textMuted">
                Time
              </SafeText>
            </YStack>
            {getWeekDays().map((date) => (
              <YStack key={date.format('YYYY-MM-DD')} flex={1} padding="$2">
                <SafeText textAlign="center" fontSize="$3" fontWeight="600" color="$textHigh">
                  {date.format('ddd')}
                </SafeText>
                <SafeText textAlign="center" fontSize="$2" color="$textMuted">
                  {date.format('MMM D')}
                </SafeText>
              </YStack>
            ))}
          </XStack>

          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, hour) => (
            <XStack key={hour} space="$1" minHeight={40}>
              <YStack width={60} padding="$2" justifyContent="center">
                <SafeText textAlign="center" fontSize="$3" color="$textMuted">
                  {hour.toString().padStart(2, '0')}:00
                </SafeText>
              </YStack>
              {getWeekDays().map((date) => {
                const sessions = getSessionsForDate(date);
                const hasSession = sessions.some(session => 
                  dayjs(session.startAt).hour() === hour
                );
                const isAvailable = isHourAvailable(date, hour);
                
                return (
                  <YStack 
                    key={`${date.format('YYYY-MM-DD')}-${hour}`} 
                    flex={1} 
                    padding="$1"
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
                  >
                    {hasSession && (
                      <YStack space="$1">
                        {sessions
                          .filter(session => dayjs(session.startAt).hour() === hour)
                          .map((session, idx) => (
                            <YStack key={idx} padding="$1" backgroundColor="$surface" borderRadius="$1">
                              <SafeText textAlign="center" fontSize="$2" fontWeight="500" color="$textHigh">
                                {session.court?.name || 'Session'}
                              </SafeText>
                              <SafeText textAlign="center" fontSize="$1" color="$textMuted">
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

        {/* Legend */}
        <YStack space="$2" padding="$3" backgroundColor="$bgSoft" borderRadius="$3">
          <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">
            Legend
          </SafeText>
          <XStack space="$4" flexWrap="wrap">
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$secondary" borderRadius="$2" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">
                Available
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
                              checked={weekSchedule[day.key].enabled}
                              onCheckedChange={(checked) => updateDaySchedule(day.key, {
                                ...weekSchedule[day.key],
                                enabled: checked,
                                ranges: checked ? weekSchedule[day.key].ranges : [],
                              })}
                            />
                            {weekSchedule[day.key].enabled && (
                              <BrandButton 
                                size="sm" 
                                variant="outline"
                                onPress={() => addTimeRange(day.key)}
                              >
                                Add Time
                              </BrandButton>
                            )}
                          </XStack>

                          {weekSchedule[day.key].enabled && (
                            <YStack space="$3" paddingLeft="$6">
                              {weekSchedule[day.key].ranges.length === 0 ? (
                                <SafeText textAlign="left" color="$textMuted" fontSize="$3" fontStyle="italic">
                                  No time slots added yet. Click "Add Time" to get started.
                                </SafeText>
                              ) : (
                                weekSchedule[day.key].ranges.map((range, index) => (
                                  <XStack key={index} space="$3" alignItems="center">
                                    <YStack space="$1" flex={1}>
                                      <Label fontSize="$3" color="$textMedium">From</Label>
                                      <TextField
                                        value={range.from}
                                        onChangeText={(value) => updateTimeRange(day.key, index, 'from', value)}
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
                                        onChangeText={(value) => updateTimeRange(day.key, index, 'to', value)}
                                        placeholder="17:00"
                                        type="time"
                                      />
                                    </YStack>
                                    <BrandButton 
                                      size="sm" 
                                      variant="outline"
                                      onPress={() => removeTimeRange(day.key, index)}
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