import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { auth } from '../../lib/authClient';
import {
  listTrainerRequests,
  respondTrainerRequest,
  getTrainerProfile,
  updateTrainerProfile,
  listTrainerSessions,
  getAllCourts,
  getTrainerCalendar,
  getTrainerWorkingWindows,
  putWorkingWindows,
  listBlackouts,
  addBlackout,
  removeBlackout,
} from '@repo/trainer-api';

export function useTrainerRequests(status?: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['trainer-requests', status, page],
    queryFn: () => listTrainerRequests(auth, { status: status as any, page, pageSize }),
  });
}

export function useRespondTrainerRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, accept, comment }: { id: string; accept: boolean; comment?: string }) =>
      respondTrainerRequest(auth, id, accept, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-requests'] });
    },
    onError: (error: any) => {
      console.error('Failed to respond to trainer request:', error);
    },
  });
}

export function useTrainerProfile() {
  return useQuery({
    queryKey: ['trainer-profile'],
    queryFn: () => getTrainerProfile(auth),
  });
}

export function useUpdateTrainerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTrainerProfile.bind(null, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
    },
  });
}

export function useTrainerSessions(status?: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['trainer-sessions', status, page],
    queryFn: () => listTrainerSessions(auth, { status: status as any, page, pageSize }),
  });
}

export function useAllTrainerSessions(status?: string) {
  return useQuery({
    queryKey: ['trainer-sessions-all', status],
    queryFn: async () => {
      const allSessions: any[] = [];
      let page = 1;
      const pageSize = 50; // Maximum allowed by API
      let hasMore = true;

      while (hasMore) {
        const response = await listTrainerSessions(auth, { status: status as any, page, pageSize });
        allSessions.push(...response.items);
        
        // Check if we've fetched all available sessions
        hasMore = response.items.length === pageSize && allSessions.length < response.totalCount;
        page++;
      }

      return {
        items: allSessions,
        total: allSessions.length,
        page: 1,
        pageSize: allSessions.length,
        totalPages: 1
      };
    },
  });
}

export function useCourts() {
  return useQuery({
    queryKey: ['courts'],
    queryFn: () => getAllCourts(auth),
  });
}

export function useCourtsByAreas(areas: string[], enabled: boolean = true) {
  return useQuery({
    queryKey: ['courts', 'by-areas', areas],
    queryFn: () => getAllCourts(auth, { areas }),
    enabled: enabled && areas.length > 0,
  });
}

export function useTrainerCalendar(trainerId: string) {
  return useQuery({
    queryKey: ['trainer-calendar', trainerId],
    queryFn: () => getTrainerCalendar(auth, trainerId),
    enabled: !!trainerId,
  });
}

export function useTrainerWorkingWindows(trainerId: string) {
  return useQuery({
    queryKey: ['trainer-working-windows', trainerId],
    queryFn: () => getTrainerWorkingWindows(auth, trainerId),
    enabled: !!trainerId,
  });
}

export function useTrainerCalendarWithWindows(trainerId: string) {
  const calendarQuery = useTrainerCalendar(trainerId);
  const workingWindowsQuery = useTrainerWorkingWindows(trainerId);

  const data = useMemo(() => {
    if (calendarQuery.data && workingWindowsQuery.data) {
      return {
        ...calendarQuery.data.data,
        workingWindows: workingWindowsQuery.data.data || []
      };
    }
    return undefined;
  }, [calendarQuery.data, workingWindowsQuery.data]);

  return {
    data,
    isLoading: calendarQuery.isLoading || workingWindowsQuery.isLoading,
    isError: calendarQuery.isError || workingWindowsQuery.isError,
    error: calendarQuery.error || workingWindowsQuery.error,
    refetch: () => {
      calendarQuery.refetch();
      workingWindowsQuery.refetch();
    }
  };
}

export function useUpdateWorkingWindows(trainerId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => putWorkingWindows(auth, trainerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-calendar', trainerId] });
    },
  });
}

export function useBlackouts(trainerId: string) {
  return useQuery({
    queryKey: ['trainer-blackouts', trainerId],
    queryFn: () => listBlackouts(auth, trainerId),
    enabled: !!trainerId,
  });
}

export function useAddBlackout(trainerId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blackout: { startAt: string; endAt: string; reason?: string }) =>
      addBlackout(auth, trainerId, blackout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-blackouts', trainerId] });
    },
  });
}

export function useRemoveBlackout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blackoutId: string) => removeBlackout(auth, blackoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-blackouts'] });
    },
  });
}