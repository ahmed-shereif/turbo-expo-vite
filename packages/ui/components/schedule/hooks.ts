import { useState } from 'react';
import dayjs from 'dayjs';
import { DAYS } from './types';
import type { WeekSchedule, DaySchedule } from './types';

export const useScheduleTemplate = (initialSchedule?: WeekSchedule) => {
  const [weeklyTemplate, setWeeklyTemplate] = useState<WeekSchedule>(() => 
    initialSchedule || DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule)
  );

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

  const clearAll = () => {
    setWeeklyTemplate(DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: false, ranges: [] }
    }), {} as WeekSchedule));
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
  };

  return {
    weeklyTemplate,
    setWeeklyTemplate,
    updateWeeklyTemplate,
    addTimeRangeToTemplate,
    removeTimeRangeFromTemplate,
    updateTimeRangeInTemplate,
    clearAll,
    copyMondayToWeek,
  };
};

export const useDailyOverrides = () => {
  const [dailyOverrides, setDailyOverrides] = useState<Record<string, DaySchedule>>({});

  const getEffectiveDaySchedule = (date: dayjs.Dayjs, weeklyTemplate: WeekSchedule): DaySchedule => {
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
  };

  return {
    dailyOverrides,
    getEffectiveDaySchedule,
    updateDailyOverride,
    clearDailyOverride,
    clearAllDailyOverrides,
  };
};

export const useCalendarNavigation = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const getWeekDays = () => {
    const startOfWeek = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prev => prev.subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => prev.add(1, 'week'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  return {
    currentDate,
    setCurrentDate,
    getWeekDays,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  };
};
