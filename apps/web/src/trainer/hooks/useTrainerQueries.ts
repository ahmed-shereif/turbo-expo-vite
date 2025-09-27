import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../lib/authClient';
import {
  listTrainerRequests,
  respondTrainerRequest,
  getTrainerProfile,
  updateTrainerProfile,
  listTrainerSessions,
  getAllCourts,
  getTrainerCalendar,
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

export function useCourts() {
  return useQuery({
    queryKey: ['courts'],
    queryFn: () => getAllCourts(auth),
  });
}

export function useTrainerCalendar(trainerId: string) {
  return useQuery({
    queryKey: ['trainer-calendar', trainerId],
    queryFn: () => getTrainerCalendar(auth, trainerId),
    enabled: !!trainerId,
  });
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