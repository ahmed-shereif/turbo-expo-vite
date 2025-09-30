import { BrandCard } from '../BrandCard';
import { BrandButton } from '../BrandButton';
import { SafeText } from '../SafeText';
import { YStack, XStack, H3, Button, View } from 'tamagui';
import { useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import type { WeekSchedule, DaySchedule } from './types';
// import type { SessionSummary } from '@repo/trainer-api';

// Temporary type definition until trainer-api is available
type SessionSummary = {
  id: string;
  type: 'OPEN' | 'PRIVATE';
  status: string;
  startAt: string;
  durationMinutes?: number;
  seats?: { filled: number; total: number };
  court?: { id: string; name: string; area?: string };
  creator?: { playerId: string; name?: string };
};

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

// ===== Layout types =====
const SLOT_HEIGHT = 60; // px per hour (each half-hour = 30px, quarter-hour = 15px)
const PX_PER_MIN = SLOT_HEIGHT / 60; // 1px per minute
const MIN_CARD_HEIGHT = 40; // increased for better readability of short sessions
const COMPACT_HEIGHT_THRESHOLD = 50; // threshold for compact vs full layout
const COLUMN_GUTTER = 8; // inner spacing between overlapping session columns

interface PositionedSession {
  session: SessionSummary;
  top: number; // px from 00:00 in the day column
  height: number; // px
  leftPct: number; // 0..100
  widthPct: number; // 0..100
}

export function CalendarView({
  weeklyTemplate,
  dailyOverrides,
  sessions,
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onClearOverrides,
  onToggleHourAvailability,
  onSave,
  onSessionClick,
  isSaving = false,
}: CalendarViewProps) {
  // ===== Helpers preserved from original =====
  const getEffectiveDaySchedule = useCallback((date: dayjs.Dayjs): DaySchedule => {
    const dateKey = date.format('YYYY-MM-DD');
    const dayKey = date.format('ddd') as keyof WeekSchedule;
    return dailyOverrides[dateKey] || weeklyTemplate[dayKey];
  }, [dailyOverrides, weeklyTemplate]);

  const isHourAvailable = useCallback((date: dayjs.Dayjs, hour: number): boolean => {
    const daySchedule = getEffectiveDaySchedule(date);
    if (!daySchedule?.enabled) return false;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    return daySchedule.ranges?.some((range) => timeStr >= range.from && timeStr < range.to) ?? false;
  }, [getEffectiveDaySchedule]);

  const weekDays = useMemo(() => {
    const start = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  }, [currentDate]);

  // ===== Sessions per day (local time) =====
  const sessionsByDate = useMemo(() => {
    const map: Record<string, SessionSummary[]> = {};
    if (!sessions) return map;
    for (const s of sessions) {
      const d = dayjs(s.startAt);
      const key = d.format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    // sort each day for stable layout
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());
    }
    return map;
  }, [sessions]);

  // ===== Overlap grouping & column assignment per day =====
  type Span = { idx: number; startMin: number; endMin: number };

  const computeColumns = (daySessions: SessionSummary[]): { colIndex: number; colCount: number }[] => {
    if (daySessions.length === 0) return [];
    // Build spans in minutes from midnight
    const spans: Span[] = daySessions.map((s, idx) => {
      const start = dayjs(s.startAt);
      const startMin = start.hour() * 60 + start.minute();
      // Clip end to 24:00 for display purposes
      const endMin = Math.min(startMin + (s.durationMinutes || 0), 24 * 60);
      return { idx, startMin, endMin };
    });

    // Sweep groups by overlap
    const result: { colIndex: number; colCount: number }[] = new Array(daySessions.length).fill(0).map(() => ({ colIndex: 0, colCount: 1 }));

    // Sort by start time, then process to assign columns greedily within active overlap set
    const order = spans.map((s) => s.idx).sort((i, j) => spans[i].startMin - spans[j].startMin);
    let active: number[] = []; // indices in spans

    const endOf = (i: number) => spans[i].endMin;

    // Helper to recompute columnCount within current overlapping cluster
    const flushCluster = (cluster: number[]) => {
      if (cluster.length === 0) return;
      // Greedy column assignment
      const columns: number[][] = [];
      for (const si of cluster.sort((a, b) => spans[a].startMin - spans[b].startMin)) {
        let placed = false;
        for (let c = 0; c < columns.length; c++) {
          const last = columns[c][columns[c].length - 1];
          if (spans[last].endMin <= spans[si].startMin) {
            columns[c].push(si);
            result[spans[si].idx].colIndex = c;
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([si]);
          result[spans[si].idx].colIndex = columns.length - 1;
        }
      }
      const colCount = columns.length;
      for (const si of cluster) result[spans[si].idx].colCount = colCount;
    };

    let cluster: number[] = [];
    let clusterEnd = -1;

    for (const si of order) {
      // remove finished from active
      active = active.filter((a) => endOf(a) > spans[si].startMin);
      // if starting a new cluster
      if (active.length === 0 && cluster.length > 0 && spans[si].startMin >= clusterEnd) {
        flushCluster(cluster);
        cluster = [];
      }
      active.push(si);
      cluster.push(si);
      // extend clusterEnd
      clusterEnd = Math.max(clusterEnd, spans[si].endMin);
    }
    // flush last cluster
    flushCluster(cluster);

    return result;
  };

  // ===== Compute positioned sessions per day =====
  const positionedByDate = useMemo(() => {
    const map: Record<string, PositionedSession[]> = {};
    for (const date of weekDays) {
      const key = date.format('YYYY-MM-DD');
      const daySessions = sessionsByDate[key] || [];
      if (daySessions.length === 0) {
        map[key] = [];
        continue;
      }
      const colInfo = computeColumns(daySessions);
      const items: PositionedSession[] = daySessions.map((s, i) => {
        const start = dayjs(s.startAt);
        const minutesSinceMidnight = start.hour() * 60 + start.minute();
        const rawHeight = (s.durationMinutes || 0) * PX_PER_MIN;
        const top = minutesSinceMidnight * PX_PER_MIN;
        const height = Math.max(rawHeight, MIN_CARD_HEIGHT);
        const colCount = Math.max(1, colInfo[i].colCount);
        const colIndex = colInfo[i].colIndex;
        // width/left with gutter distributed across columns
        const widthPct = 100 / colCount;
        const leftPct = (100 / colCount) * colIndex;
        return {
          session: s,
          top,
          height,
          // We will apply gutter via padding container; keep percentages simple here
          leftPct,
          widthPct,
        };
      });
      map[key] = items;
    }
    return map;
  }, [sessionsByDate, weekDays]);

  // Click on empty space to toggle availability by hour (snap to hour from y offset)
  const handleDayColumnPress = useCallback((date: dayjs.Dayjs, yClient: number, columnTop: number) => {
    const y = Math.max(0, yClient - columnTop); // px inside the day column
    const minutes = Math.floor(y / PX_PER_MIN);
    const hour = Math.min(23, Math.max(0, Math.floor(minutes / 60)));
    onToggleHourAvailability(date, hour);
  }, [onToggleHourAvailability]);

  // Utility to format times
  const fmtRange = (s: SessionSummary) => {
    const start = dayjs(s.startAt);
    const end = start.add(s.durationMinutes || 0, 'minute');
    return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
  };

  return (
    <BrandCard>
      <YStack space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H3 color="$textHigh">Calendar View</H3>
          <XStack space="$2">
            <Button size="$3" variant="outlined" onPress={onPreviousWeek}>← Previous</Button>
            <Button size="$3" variant="outlined" onPress={onToday}>Today</Button>
            <Button size="$3" variant="outlined" onPress={onNextWeek}>Next →</Button>
            <Button size="$3" variant="outlined" onPress={onClearOverrides}>Clear Overrides</Button>
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
              <SafeText textAlign="center" fontSize="$3" fontWeight="600" color="$textMuted">Time</SafeText>
            </YStack>
            {weekDays.map((date) => {
              const dateKey = date.format('YYYY-MM-DD');
              const hasOverride = !!dailyOverrides[dateKey];
              return (
                <YStack key={dateKey} flex={1} padding="$2" minWidth={120} maxWidth={200} width={150} marginHorizontal="$1">
                  <SafeText textAlign="center" fontSize="$3" fontWeight="600" color="$textHigh">{date.format('ddd')}</SafeText>
                  <SafeText textAlign="center" fontSize="$2" color="$textMuted">{date.format('MMM D')}</SafeText>
                  {hasOverride && (
                    <SafeText textAlign="center" fontSize="$1" color="$accent" fontWeight="600">Override</SafeText>
                  )}
                </YStack>
              );
            })}
          </XStack>

          {/* Scrollable Calendar Container */}
          <YStack maxHeight={600} overflow="scroll" borderWidth={1} borderColor="$color6" borderRadius="$3" padding="$2">
            {/* Hour rows - keep the left ruler */}
            <XStack space="$2">
              {/* Time ruler */}
              <YStack width={60} flexShrink={0} position="relative">
                {Array.from({ length: 24 }, (_, hour) => (
                  <YStack key={hour} height={SLOT_HEIGHT} borderBottomWidth={1} borderColor="$color6" justifyContent="flex-start" paddingTop={4}>
                    <SafeText textAlign="center" fontSize="$3" color="$textMuted">{hour.toString().padStart(2, '0')}:00</SafeText>
                  </YStack>
                ))}
              </YStack>

              {/* 7 day columns */}
              {weekDays.map((date) => {
                const dateKey = date.format('YYYY-MM-DD');
                const items = positionedByDate[dateKey] || [];

                return (
                  <YStack key={dateKey} flex={1} minWidth={120} maxWidth={200} width={150} marginHorizontal="$1" position="relative" overflow="visible">
                    {/* Background availability blocks per hour */}
                      <View position="absolute" top={0} left={0} right={0} height={24 * SLOT_HEIGHT} zIndex={0} pointerEvents="none">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const available = isHourAvailable(date, hour);
                        return (
                          <YStack
                            key={hour}
                            position="absolute"
                            top={hour * SLOT_HEIGHT}
                            left={0}
                            right={0}
                            height={SLOT_HEIGHT}
                            backgroundColor={available ? '$color3' : '$red2'}
                            borderBottomWidth={1}
                            borderColor={available ? '$color6' : '$red6'}
                          />
                        );
                      })}

                      {/* Half-hour faint lines */}
                      {Array.from({ length: 24 }, (_, hour) => (
                        <View key={`hh-${hour}`} position="absolute" top={hour * SLOT_HEIGHT + SLOT_HEIGHT / 2} left={0} right={0} height={1} backgroundColor="$color6" opacity={0.3} />
                      ))}
                    </View>

                    {/* Click-capture layer for empty space: we detect y to hour */}
                    <View
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      height={24 * SLOT_HEIGHT}
                      onPress={async (e: any) => {
                        try {
                          const yClient = e?.nativeEvent?.pageY ?? 0;
                          if ((e?.currentTarget as any)?.measureInWindow) {
                            const top = await awaitMeasureTop(e?.currentTarget);
                            handleDayColumnPress(date, yClient, top);
                          } else {
                            handleDayColumnPress(date, yClient, 0);
                          }
                        } catch {
                          // fallback: toggle noon
                          onToggleHourAvailability(date, 12);
                        }
                      }}
                    />

                    {/* Sessions layer */}
                    <View position="relative" height={24 * SLOT_HEIGHT} overflow="visible" zIndex={2}>
                      {items.map((it, idx) => (
                        <YStack
                          key={idx}
                          position="absolute"
                          top={it.top}
                          left={`${it.leftPct}%`}
                          width={`${it.widthPct}%`}
                          marginLeft={it.leftPct === 0 ? 0 : COLUMN_GUTTER / 2}
                          marginRight={it.leftPct + it.widthPct >= 100 ? 0 : COLUMN_GUTTER / 2}
                          height={it.height} 
                          overflow="visible"
                          backgroundColor="$accent"
                          borderRadius="$3"
                          padding={it.height < COMPACT_HEIGHT_THRESHOLD ? "$1" : "$2"}
                          borderWidth={1}
                          borderColor="$accent"
                          shadowColor="$shadowColor"
                          shadowOffset={{ width: 0, height: 2 }}
                          shadowOpacity={0.1}
                          shadowRadius={4}
                          elevation={2}
                          cursor={onSessionClick ? 'pointer' : 'default'}
                          onPress={onSessionClick ? () => onSessionClick(it.session) : undefined}
                          pressStyle={onSessionClick ? { opacity: 0.95, scale: 0.98 } : undefined}
                          hoverStyle={onSessionClick ? { opacity: 0.95 } : undefined}
                          aria-label={`${it.session.court?.name || 'Session'}, ${fmtRange(it.session)}, ${(it.session.durationMinutes || 0)} minutes`}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {/* Adaptive content based on session height */}
                          {it.height < COMPACT_HEIGHT_THRESHOLD ? (
                            // Ultra-compact layout for very short sessions (30-50px)
                            <YStack space="$1" alignItems="center" justifyContent="center" width="100%">
                              <SafeText 
                                textAlign="center" 
                                fontSize="$2" 
                                fontWeight="700" 
                                color="$white" 
                                numberOfLines={1}
                                lineHeight="$1"
                                width="100%"
                              >
                                {it.session.court?.name || 'Session'}
                              </SafeText>
                              <SafeText 
                                textAlign="center" 
                                fontSize="$1" 
                                color="$white" 
                                opacity={0.8}
                                numberOfLines={1}
                                lineHeight="$1"
                                width="100%"
                              >
                                {fmtRange(it.session)}
                              </SafeText>
                            </YStack>
                          ) : it.height < 80 ? (
                            // Compact layout for medium sessions (50-80px)
                            <YStack space="$1" alignItems="center" justifyContent="center" width="100%">
                              <SafeText 
                                textAlign="center" 
                                fontSize="$3" 
                                fontWeight="700" 
                                color="$white" 
                                numberOfLines={1}
                                width="100%"
                              >
                                {it.session.court?.name || 'Session'}
                              </SafeText>
                              <SafeText 
                                textAlign="center" 
                                fontSize="$2" 
                                color="$white" 
                                opacity={0.9}
                                numberOfLines={1}
                                width="100%"
                              >
                                {fmtRange(it.session)}
                              </SafeText>
                            </YStack>
                          ) : (
                            // Full layout for longer sessions (80px+)
                            <YStack space="$2" alignItems="center" justifyContent="center" width="100%">
                              <SafeText 
                                textAlign="center" 
                                fontSize="$4" 
                                fontWeight="700" 
                                color="$white" 
                                numberOfLines={1}
                                width="100%"
                              >
                                {it.session.court?.name || 'Session'}
                              </SafeText>
                              <SafeText 
                                textAlign="center" 
                                fontSize="$3" 
                                color="$white" 
                                opacity={0.9}
                                numberOfLines={1}
                                width="100%"
                              >
                                {fmtRange(it.session)}
                              </SafeText>
                              {it.session.seats && (
                                <SafeText 
                                  textAlign="center" 
                                  fontSize="$2" 
                                  color="$white" 
                                  opacity={0.8}
                                  numberOfLines={1}
                                  width="100%"
                                >
                                  {it.session.seats.filled}/{it.session.seats.total} seats
                                </SafeText>
                              )}
                            </YStack>
                          )}
                        </YStack>
                      ))}
                    </View>
                  </YStack>
                );
              })}
            </XStack>
          </YStack>
        </YStack>

        {/* Legend */}
        <YStack space="$2" padding="$3" backgroundColor="$bgSoft" borderRadius="$3">
          <SafeText textAlign="left" fontWeight="600" color="$textHigh" fontSize="$4">Legend</SafeText>
          <SafeText textAlign="left" fontSize="$3" color="$textMuted" marginBottom="$2">
            Calendar view shows your weekly template as the base. You can click on hours to override specific days without affecting your weekly template. Session cards span half-hours smoothly.
          </SafeText>
          <XStack space="$4" flexWrap="wrap">
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$color3" borderRadius="$3" borderWidth={1} borderColor="$color6" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">Available (from template)</SafeText>
            </XStack>
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$accent" borderRadius="$3" borderWidth={1} borderColor="$accent" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">Booked Session</SafeText>
            </XStack>
            <XStack space="$2" alignItems="center">
              <YStack width={20} height={20} backgroundColor="$red2" borderRadius="$3" borderWidth={1} borderColor="$red6" />
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">Not Available</SafeText>
            </XStack>
            <XStack space="$2" alignItems="center">
              <SafeText textAlign="left" fontSize="$3" color="$accent" fontWeight="600">"Override"</SafeText>
              <SafeText textAlign="left" fontSize="$3" color="$textMuted">Day has custom schedule</SafeText>
            </XStack>
          </XStack>
        </YStack>

        {/* Save Button */}
        <BrandButton onPress={onSave} disabled={isSaving} fullWidth size="lg">
          {isSaving ? 'Saving Your Schedule...' : 'Save Weekly Template'}
        </BrandButton>
      </YStack>
    </BrandCard>
  );
}

// Utility to measure absolute top of a target View in window coords (React Native/Tamagui)
async function awaitMeasureTop(target: any): Promise<number> {
  return new Promise((resolve) => {
    try {
      target.measureInWindow((_: number, y: number) => resolve(y));
    } catch {
      resolve(0);
    }
  });
}
