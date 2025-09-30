import { BrandCard } from '../BrandCard';
import { BrandButton } from '../BrandButton';
import { SafeText } from '../SafeText';
import { YStack, XStack, H3, Button } from 'tamagui';
import dayjs from 'dayjs';
import type { WeekSchedule, DaySchedule } from './types';
import type { SessionSummary } from '@repo/trainer-api';

interface CalendarViewProps {
  weeklyTemplate: WeekSchedule;
  dailyOverrides: Record<string, DaySchedule>;
  sessions: SessionSummary[];
  currentDate: dayjs.Dayjs;
  onDateChange: (date: dayjs.Dayjs) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onClearOverrides: () => void;
  onToggleHourAvailability: (date: dayjs.Dayjs, hour: number) => void;
  onSave: () => void;
  onSessionClick?: (session: SessionSummary) => void;
  isSaving?: boolean;
}

export function CalendarView({
  weeklyTemplate,
  dailyOverrides,
  sessions,
  currentDate,
  onDateChange,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onClearOverrides,
  onToggleHourAvailability,
  onSave,
  onSessionClick,
  isSaving = false,
}: CalendarViewProps) {
  const getEffectiveDaySchedule = (date: dayjs.Dayjs): DaySchedule => {
    const dateKey = date.format('YYYY-MM-DD');
    const dayKey = date.format('ddd') as keyof WeekSchedule;
    
    // If there's a daily override, use it; otherwise use the weekly template
    return dailyOverrides[dateKey] || weeklyTemplate[dayKey];
  };

  const getSessionsForDate = (date: dayjs.Dayjs): SessionSummary[] => {
    if (!sessions) return [];
    return sessions.filter(session => 
      dayjs(session.startAt).isSame(date, 'day')
    );
  };

  const getSessionsForHour = (date: dayjs.Dayjs, hour: number): SessionSummary[] => {
    const sessionsForDate = getSessionsForDate(date);
    
    return sessionsForDate.filter(session => {
      // Convert UTC session times to local time for comparison
      const sessionStart = dayjs(session.startAt);
      
      // Get the local hour for the session start time
      const sessionStartHour = sessionStart.hour();
      
      // Only show sessions in their starting hour slot to avoid duplication
      return sessionStartHour === hour;
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

  const getWeekDays = () => {
    const startOfWeek = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  };

  return (
    <BrandCard>
      <YStack space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H3 color="$textHigh">Calendar View</H3>
          <XStack space="$2">
            <Button 
              size="$3" 
              variant="outlined"
              onPress={onPreviousWeek}
            >
              ← Previous
            </Button>
            <Button 
              size="$3" 
              variant="outlined"
              onPress={onToday}
            >
              Today
            </Button>
            <Button 
              size="$3" 
              variant="outlined"
              onPress={onNextWeek}
            >
              Next →
            </Button>
            <Button 
              size="$3" 
              variant="outlined"
              onPress={onClearOverrides}
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
                <YStack width={60} padding="$2" justifyContent="flex-start" flexShrink={0} borderBottomWidth={1} borderColor="$color6">
                  <SafeText textAlign="center" fontSize="$3" color="$textMuted">
                    {hour.toString().padStart(2, '0')}:00
                  </SafeText>
                </YStack>
                {getWeekDays().map((date) => {
                  const sessionsForHour = getSessionsForHour(date, hour);
                  const hasSession = sessionsForHour.length > 0;
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
                            : '$red9'
                      }
                      borderRadius="$2"
                      borderWidth={1}
                      borderColor={
                        hasSession 
                          ? '$accent' 
                          : isAvailable 
                            ? '$secondary' 
                            : '$red9'
                      }
                      cursor="pointer"
                      onPress={() => !hasSession && onToggleHourAvailability(date, hour)}
                      pressStyle={{ opacity: 0.8 }}
                      opacity={hasSession ? 0.7 : 1}
                      height={60}
                      justifyContent="center"
                      overflow="hidden"
                      boxShadow="inset 0 0 0 1px $color6"
                    >
                      {hasSession && (
                        <YStack space="$1" width="100%" height="100%" justifyContent="center">
                          {sessionsForHour.map((session, idx) => (
                            <YStack 
                              key={idx} 
                              padding="$1" 
                              backgroundColor="$surface" 
                              borderRadius="$2" 
                              width="100%" 
                              flex={1} 
                              justifyContent="center" 
                              boxShadow="inset 0 0 0 1px $color6"
                              cursor={onSessionClick ? "pointer" : "default"}
                              onPress={onSessionClick ? () => onSessionClick(session) : undefined}
                              pressStyle={onSessionClick ? { opacity: 0.8, scale: 0.98 } : undefined}
                              hoverStyle={onSessionClick ? { backgroundColor: "$color3" } : undefined}
                            >
                              <SafeText textAlign="center" fontSize="$2" fontWeight="600" color="$textHigh" numberOfLines={1}>
                                {session.court?.name || 'Session'}
                              </SafeText>
                              <SafeText textAlign="center" fontSize="$1" color="$textMuted" numberOfLines={1}>
                                {dayjs(session.startAt).format('HH:mm')} - {dayjs(session.startAt).add(session.durationMinutes, 'minutes').format('HH:mm')}
                              </SafeText>
                              {session.durationMinutes > 60 && (
                                <SafeText textAlign="center" fontSize="$1" color="$textMuted" numberOfLines={1}>
                                  ({session.durationMinutes}min)
                                </SafeText>
                              )}
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
              <YStack width={20} height={20} backgroundColor="$red9" borderRadius="$2" />
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

        {/* Save Button for Calendar View */}
        <BrandButton 
          onPress={onSave}
          disabled={isSaving}
          fullWidth
          size="lg"
        >
          {isSaving ? 'Saving Your Schedule...' : 'Save Weekly Template'}
        </BrandButton>
      </YStack>
    </BrandCard>
  );
}
