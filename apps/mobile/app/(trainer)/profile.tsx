import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ScrollView, Alert } from 'react-native'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2, H3, TextField } from '@repo/ui'
import { auth } from '@repo/auth-client'
import { getTrainerProfile, updateTrainerProfile, getAllCourts, Rank } from '@repo/trainer-api'
import { EG_CITIES, getAreasByCity } from '@repo/geo-eg'
import { notify } from '../../src/lib/notify'
import { AuthGate, RoleGate } from '../../src/navigation/guards'

const profileSchema = z.object({
  hourlyPriceLE: z.number().min(50).max(10000),
  maxLevel: z.enum(['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D']),
  city: z.string().min(1),
  areasCovered: z.array(z.string()).min(1),
  acceptedCourtIds: z.array(z.string()),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function TrainerProfile() {
  const [selectedCity, setSelectedCity] = useState('Cairo')
  const [availableAreas, setAvailableAreas] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const [showCourtPicker, setShowCourtPicker] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['trainer-profile'],
    queryFn: () => getTrainerProfile(auth),
  })

  const { data: courts, isLoading: courtsLoading } = useQuery({
    queryKey: ['courts'],
    queryFn: () => getAllCourts(auth),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProfileForm>) => updateTrainerProfile(auth, data),
    onSuccess: () => {
      notify.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] })
    },
    onError: (error: any) => {
      if (error.fieldErrors) {
        notify.error('Please fix the highlighted fields')
      } else {
        notify.error(error.message || 'Could not save profile')
      }
    },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hourlyPriceLE: 500,
      maxLevel: 'UNKNOWN',
      city: 'Cairo',
      areasCovered: [],
      acceptedCourtIds: [],
    }
  })

  // Update available areas when city changes
  useEffect(() => {
    const areas = getAreasByCity(selectedCity)
    setAvailableAreas(areas)
    
    // Clear selected areas if they're not available in the new city
    const validAreas = selectedAreas.filter(area => areas.includes(area))
    if (validAreas.length !== selectedAreas.length) {
      setSelectedAreas(validAreas)
      setValue('areasCovered', validAreas)
    }
  }, [selectedCity, setValue])

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setValue('hourlyPriceLE', profile.hourlyPriceLE)
      setValue('maxLevel', profile.maxLevel)
      setValue('areasCovered', profile.areasCovered)
      setValue('acceptedCourtIds', profile.acceptedCourtIds)
      setSelectedAreas(profile.areasCovered)
      setSelectedCourts(profile.acceptedCourtIds)
      
      // Try to determine city from areas
      const firstArea = profile.areasCovered[0]
      if (firstArea) {
        const city = EG_CITIES.find(c => c.areas.includes(firstArea))
        if (city) {
          setSelectedCity(city.name)
        }
      }
    }
  }, [profile, setValue])

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      hourlyPriceLE: data.hourlyPriceLE,
      maxLevel: data.maxLevel,
      areasCovered: selectedAreas,
      acceptedCourtIds: selectedCourts,
    })
  }

  const toggleArea = (area: string) => {
    const newAreas = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area]
    setSelectedAreas(newAreas)
    setValue('areasCovered', newAreas)
  }

  const toggleCourt = (courtId: string) => {
    const newCourts = selectedCourts.includes(courtId)
      ? selectedCourts.filter(id => id !== courtId)
      : [...selectedCourts, courtId]
    setSelectedCourts(newCourts)
    setValue('acceptedCourtIds', newCourts)
  }

  const showAreaSelection = () => {
    Alert.alert(
      'Select Areas',
      'Choose areas you cover:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Done', onPress: () => setShowAreaPicker(false) }
      ],
      { cancelable: true }
    )
    setShowAreaPicker(true)
  }

  const showCourtSelection = () => {
    Alert.alert(
      'Select Courts',
      'Choose courts where you train:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Done', onPress: () => setShowCourtPicker(false) }
      ],
      { cancelable: true }
    )
    setShowCourtPicker(true)
  }

  if (profileLoading) {
    return (
      <AuthGate>
        <RoleGate roles={['TRAINER']}>
          <Screen>
            <YStack space="$4" padding="$4">
              <H2>Trainer Profile</H2>
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
              <H2>Trainer Profile</H2>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <YStack space="$4">
                  {/* Hourly Price */}
                  <BrandCard padding="$4">
                    <YStack space="$3">
                      <H3>Hourly Rate</H3>
                      <YStack space="$2">
                        <Text fontSize="$sm" fontWeight="bold">Price per hour (LE)</Text>
                        <TextField
                          placeholder="500"
                          keyboardType="numeric"
                          {...register('hourlyPriceLE', { valueAsNumber: true })}
                        />
                        {errors.hourlyPriceLE && (
                          <Text fontSize="$sm" color="$red10">
                            {errors.hourlyPriceLE.message}
                          </Text>
                        )}
                      </YStack>
                    </YStack>
                  </BrandCard>

                  {/* Max Level */}
                  <BrandCard padding="$4">
                    <YStack space="$3">
                      <H3>Maximum Level</H3>
                      <YStack space="$2">
                        <Text fontSize="$sm" fontWeight="bold">Highest level you can coach</Text>
                        <BrandButton
                          variant="secondary"
                          onPress={() => {
                            Alert.alert(
                              'Select Level',
                              'Choose the highest level you can coach:',
                              [
                                { text: 'Unknown', onPress: () => setValue('maxLevel', 'UNKNOWN') },
                                { text: 'Low Division', onPress: () => setValue('maxLevel', 'LOW_D') },
                                { text: 'Mid Division', onPress: () => setValue('maxLevel', 'MID_D') },
                                { text: 'High Division', onPress: () => setValue('maxLevel', 'HIGH_D') },
                                { text: 'Cancel', style: 'cancel' }
                              ]
                            )
                          }}
                        >
                          {watch('maxLevel') === 'UNKNOWN' ? 'Unknown' :
                           watch('maxLevel') === 'LOW_D' ? 'Low Division' :
                           watch('maxLevel') === 'MID_D' ? 'Mid Division' :
                           watch('maxLevel') === 'HIGH_D' ? 'High Division' : 'Select Level'}
                        </BrandButton>
                      </YStack>
                    </YStack>
                  </BrandCard>

                  {/* Areas Covered */}
                  <BrandCard padding="$4">
                    <YStack space="$3">
                      <H3>Areas Covered</H3>
                      <YStack space="$2">
                        <Text fontSize="$sm" fontWeight="bold">City</Text>
                        <BrandButton
                          variant="secondary"
                          onPress={() => {
                            Alert.alert(
                              'Select City',
                              'Choose your city:',
                              [
                                ...EG_CITIES.map(city => ({
                                  text: city.name,
                                  onPress: () => setSelectedCity(city.name)
                                })),
                                { text: 'Cancel', style: 'cancel' }
                              ]
                            )
                          }}
                        >
                          {selectedCity}
                        </BrandButton>
                      </YStack>
                      
                      <YStack space="$2">
                        <Text fontSize="$sm" fontWeight="bold">Areas (select one or more)</Text>
                        <BrandButton
                          variant="secondary"
                          onPress={showAreaSelection}
                        >
                          {selectedAreas.length > 0 
                            ? `${selectedAreas.length} area${selectedAreas.length > 1 ? 's' : ''} selected`
                            : 'Select Areas'
                          }
                        </BrandButton>
                        
                        {selectedAreas.length > 0 && (
                          <YStack space="$1">
                            {selectedAreas.map(area => (
                              <Text key={area} fontSize="$sm" color="$gray10">
                                • {area}
                              </Text>
                            ))}
                          </YStack>
                        )}
                      </YStack>
                    </YStack>
                  </BrandCard>

                  {/* Accepted Courts */}
                  <BrandCard padding="$4">
                    <YStack space="$3">
                      <H3>Accepted Courts</H3>
                      <YStack space="$2">
                        <Text fontSize="$sm" fontWeight="bold">
                          Courts where you're available to train
                        </Text>
                        <Text fontSize="$xs" color="$gray10">
                          Selecting courts helps players find you. You can leave this empty to train anywhere.
                        </Text>
                        
                        <BrandButton
                          variant="secondary"
                          onPress={showCourtSelection}
                        >
                          {selectedCourts.length > 0 
                            ? `${selectedCourts.length} court${selectedCourts.length > 1 ? 's' : ''} selected`
                            : 'Select Courts'
                          }
                        </BrandButton>
                        
                        {selectedCourts.length > 0 && (
                          <YStack space="$1">
                            {selectedCourts.map(courtId => {
                              const court = courts?.find(c => c.id === courtId)
                              return court ? (
                                <Text key={courtId} fontSize="$sm" color="$gray10">
                                  • {court.name} {court.area && `(${court.area})`}
                                </Text>
                              ) : null
                            })}
                          </YStack>
                        )}
                      </YStack>
                    </YStack>
                  </BrandCard>

                  {/* Save Button */}
                  <BrandButton
                    variant="primary"
                    onPress={handleSubmit(onSubmit)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </BrandButton>
                </YStack>
              </form>
            </YStack>
          </ScrollView>
        </Screen>
      </RoleGate>
    </AuthGate>
  )
}
