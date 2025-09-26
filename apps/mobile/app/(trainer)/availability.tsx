import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import { ScrollView } from 'react-native'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2, H3, H4 } from '@repo/ui'
import { auth } from '@repo/auth-client'
import { getTrainerCalendar, putWorkingWindows, listBlackouts, addBlackout, removeBlackout } from '@repo/trainer-api'
import { notify } from '../../src/lib/notify'
import { AuthGate, RoleGate } from '../../src/navigation/guards'
import { useAuth } from '../../src/providers/AuthProvider'

type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type TimeRange = { from: string; to: string }

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TrainerAvailability() {
  const { user } = useAuth()
  const [workingWindows, setWorkingWindows] = useState<Record<DayOfWeek, TimeRange[]>>({
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  })
  
  const queryClient = useQueryClient()

  const { data: calendar, isLoading: calendarLoading } = useQuery({
    queryKey: ['trainer-calendar', user?.id],
    queryFn: () => getTrainerCalendar(auth, user!.id),
    enabled: !!user?.id,
  })

  const { data: blackouts, isLoading: blackoutsLoading } = useQuery({
    queryKey: ['trainer-blackouts', user?.id],
    queryFn: () => listBlackouts(auth, user!.id),
    enabled: !!user?.id,
  })

  const saveMutation = useMutation({
    mutationFn: () => putWorkingWindows(auth, user!.id, { week: DAYS.map(day => ({
      day,
      ranges: workingWindows[day]
    })) }),
    onSuccess: () => {
      notify.success('Availability saved successfully')
      queryClient.invalidateQueries({ queryKey: ['trainer-calendar'] })
    },
    onError: (error: any) => {
      notify.error(error.message || 'Failed to save availability')
    },
  })

  const addBlackoutMutation = useMutation({
    mutationFn: (blackout: { startAt: string; endAt: string; reason?: string }) => 
      addBlackout(auth, user!.id, blackout),
    onSuccess: () => {
      notify.success('Blackout added successfully')
      queryClient.invalidateQueries({ queryKey: ['trainer-blackouts'] })
    },
    onError: (error: any) => {
      notify.error(error.message || 'Failed to add blackout')
    },
  })

  const removeBlackoutMutation = useMutation({
    mutationFn: (blackoutId: string) => removeBlackout(auth, blackoutId),
    onSuccess: () => {
      notify.success('Blackout removed successfully')
      queryClient.invalidateQueries({ queryKey: ['trainer-blackouts'] })
    },
    onError: (error: any) => {
      notify.error(error.message || 'Failed to remove blackout')
    },
  })

  const addTimeRange = (day: DayOfWeek) => {
    setWorkingWindows(prev => ({
      ...prev,
      [day]: [...prev[day], { from: '09:00', to: '17:00' }]
    }))
  }

  const removeTimeRange = (day: DayOfWeek, index: number) => {
    setWorkingWindows(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }))
  }

  const updateTimeRange = (day: DayOfWeek, index: number, field: 'from' | 'to', value: string) => {
    setWorkingWindows(prev => ({
      ...prev,
      [day]: prev[day].map((range, i) => 
        i === index ? { ...range, [field]: value } : range
      )
    }))
  }

  const copyDayToAll = (sourceDay: DayOfWeek) => {
    const sourceRanges = workingWindows[sourceDay]
    setWorkingWindows(prev => {
      const newWindows = { ...prev }
      DAYS.forEach(day => {
        if (day !== sourceDay) {
          newWindows[day] = [...sourceRanges]
        }
      })
      return newWindows
    })
  }

  const clearDay = (day: DayOfWeek) => {
    setWorkingWindows(prev => ({
      ...prev,
      [day]: []
    }))
  }

  const clearAll = () => {
    setWorkingWindows(prev => {
      const newWindows = { ...prev }
      DAYS.forEach(day => {
        newWindows[day] = []
      })
      return newWindows
    })
  }

  const formatBlackoutDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Cairo'
    })
  }

  const showAddBlackout = () => {
    Alert.prompt(
      'Add Blackout',
      'Enter start date and time (YYYY-MM-DDTHH:MM):',
      (startAt) => {
        if (startAt) {
          Alert.prompt(
            'Add Blackout',
            'Enter end date and time (YYYY-MM-DDTHH:MM):',
            (endAt) => {
              if (endAt) {
                Alert.prompt(
                  'Add Blackout',
                  'Enter reason (optional):',
                  (reason) => {
                    addBlackoutMutation.mutate({
                      startAt,
                      endAt,
                      reason: reason || undefined,
                    })
                  },
                  'plain-text'
                )
              }
            },
            'plain-text'
          )
        }
      },
      'plain-text'
    )
  }

  if (calendarLoading || blackoutsLoading) {
    return (
      <AuthGate>
        <RoleGate roles={['TRAINER']}>
          <Screen>
            <YStack space="$4" padding="$4">
              <H2>Availability</H2>
              <Text>Loading...</Text>
            </YStack>
          </Screen>
        </RoleGate>
      </AuthGate>
    )
  }

  return (
    <AuthGate>
      <RoleGate roles={['TRAINER']}>
        <Screen>
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack space="$4" padding="$4">
              <H2>Availability</H2>
              
              <Text fontSize="$sm" color="$gray10">
                Times are in Africa/Cairo timezone
              </Text>

              {/* Weekly Working Hours */}
              <BrandCard padding="$4">
                <YStack space="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Weekly Working Hours</H3>
                    <XStack space="$2">
                      <BrandButton
                        variant="ghost"
                        size="sm"
                        onPress={() => copyDayToAll('Mon')}
                      >
                        Copy Mon → Week
                      </BrandButton>
                      <BrandButton
                        variant="ghost"
                        size="sm"
                        onPress={clearAll}
                      >
                        Clear All
                      </BrandButton>
                    </XStack>
                  </XStack>

                  <YStack space="$3">
                    {DAYS.map(day => (
                      <YStack key={day} space="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="bold" minWidth={60}>{day}</Text>
                          <XStack space="$2">
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onPress={() => addTimeRange(day)}
                            >
                              Add Time
                            </BrandButton>
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onPress={() => clearDay(day)}
                              disabled={workingWindows[day].length === 0}
                            >
                              Clear
                            </BrandButton>
                          </XStack>
                        </XStack>

                        <YStack space="$2">
                          {workingWindows[day].map((range, index) => (
                            <XStack key={index} space="$2" alignItems="center">
                              <Text fontSize="$sm" minWidth={60}>
                                {range.from} - {range.to}
                              </Text>
                              <BrandButton
                                variant="ghost"
                                size="sm"
                                onPress={() => removeTimeRange(day, index)}
                              >
                                Remove
                              </BrandButton>
                            </XStack>
                          ))}
                          
                          {workingWindows[day].length === 0 && (
                            <Text fontSize="$sm" color="$gray10" fontStyle="italic">
                              No working hours set
                            </Text>
                          )}
                        </YStack>
                      </YStack>
                    ))}
                  </YStack>

                  <BrandButton
                    variant="primary"
                    onPress={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save Working Hours'}
                  </BrandButton>
                </YStack>
              </BrandCard>

              {/* Blackouts */}
              <BrandCard padding="$4">
                <YStack space="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Blackouts</H3>
                    <BrandButton
                      variant="secondary"
                      size="sm"
                      onPress={showAddBlackout}
                    >
                      Add Blackout
                    </BrandButton>
                  </XStack>

                  <YStack space="$2">
                    <Text fontWeight="bold">Current Blackouts</Text>
                    {blackouts && blackouts.length > 0 ? (
                      blackouts.map(blackout => (
                        <XStack key={blackout.id} justifyContent="space-between" alignItems="center" padding="$2" backgroundColor="$gray2" borderRadius="$2">
                          <YStack space="$1">
                            <Text fontSize="$sm" fontWeight="bold">
                              {formatBlackoutDate(blackout.startAt)} - {formatBlackoutDate(blackout.endAt)}
                            </Text>
                            {blackout.reason && (
                              <Text fontSize="$xs" color="$gray10">
                                {blackout.reason}
                              </Text>
                            )}
                          </YStack>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onPress={() => removeBlackoutMutation.mutate(blackout.id)}
                            disabled={removeBlackoutMutation.isPending}
                          >
                            Remove
                          </BrandButton>
                        </XStack>
                      ))
                    ) : (
                      <Text fontSize="$sm" color="$gray10" fontStyle="italic">
                        No blackouts scheduled
                      </Text>
                    )}
                  </YStack>
                </YStack>
              </BrandCard>
            </YStack>
          </ScrollView>
        </Screen>
      </RoleGate>
    </AuthGate>
  )
}
