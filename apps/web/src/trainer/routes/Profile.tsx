import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2, H3, Sheet } from '@repo/ui'
import { auth } from '../../lib/authClient'
// @ts-ignore
import { getTrainerProfile, updateTrainerProfile, getAllCourts } from '@repo/trainer-api'
// @ts-ignore
import { EG_CITIES, getAreasByCity } from '@repo/geo-eg'
import { notify } from '../../lib/notify'

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
  const [courtSearchOpen, setCourtSearchOpen] = useState(false)
  const [courtSearchTerm, setCourtSearchTerm] = useState('')
  
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
        // Handle field errors
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          // You could set field errors here if needed
          console.error(`Field error for ${field}:`, message)
        })
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

  const watchedAreas = watch('areasCovered')
  const watchedCourtIds = watch('acceptedCourtIds')

  // Update available areas when city changes
  useEffect(() => {
    const areas = getAreasByCity(selectedCity)
    setAvailableAreas(areas)
    
    // Clear selected areas if they're not available in the new city
    const currentAreas = watch('areasCovered')
    const validAreas = currentAreas.filter(area => areas.includes(area))
    if (validAreas.length !== currentAreas.length) {
      setValue('areasCovered', validAreas)
    }
  }, [selectedCity, setValue, watch])

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setValue('hourlyPriceLE', profile.hourlyPriceLE)
      setValue('maxLevel', profile.maxLevel)
      setValue('areasCovered', profile.areasCovered)
      setValue('acceptedCourtIds', profile.acceptedCourtIds)
      
      // Try to determine city from areas
      const firstArea = profile.areasCovered[0]
      if (firstArea) {
        const city = EG_CITIES.find((c: any) => c.areas.includes(firstArea))
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
      areasCovered: data.areasCovered,
      acceptedCourtIds: data.acceptedCourtIds,
    })
  }

  const toggleArea = (area: string) => {
    const currentAreas = watch('areasCovered')
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area]
    setValue('areasCovered', newAreas)
  }

  const toggleCourt = (courtId: string) => {
    const currentCourts = watch('acceptedCourtIds')
    const newCourts = currentCourts.includes(courtId)
      ? currentCourts.filter(id => id !== courtId)
      : [...currentCourts, courtId]
    setValue('acceptedCourtIds', newCourts)
  }

  const filteredCourts = courts?.filter((court: any) => 
    court.name.toLowerCase().includes(courtSearchTerm.toLowerCase()) ||
    court.area?.toLowerCase().includes(courtSearchTerm.toLowerCase())
  ) || []

  if (profileLoading) {
    return (
      <Screen>
        <YStack space="$4" padding="$4">
          <H2>Trainer Profile</H2>
          <Text>Loading...</Text>
        </YStack>
      </Screen>
    )
  }

  return (
    <Screen>
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
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    {...register('hourlyPriceLE', { valueAsNumber: true })}
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px'
                    }}
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
                  <select
                    {...register('maxLevel')}
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px'
                    }}
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="LOW_D">Low Division</option>
                    <option value="MID_D">Mid Division</option>
                    <option value="HIGH_D">High Division</option>
                  </select>
                  {errors.maxLevel && (
                    <Text fontSize="$sm" color="$red10">
                      {errors.maxLevel.message}
                    </Text>
                  )}
                </YStack>
              </YStack>
            </BrandCard>

            {/* Areas Covered */}
            <BrandCard padding="$4">
              <YStack space="$3">
                <H3>Areas Covered</H3>
                <YStack space="$2">
                  <Text fontSize="$sm" fontWeight="bold">City</Text>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px'
                    }}
                  >
                    {EG_CITIES.map((city: any) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </YStack>
                
                <YStack space="$2">
                  <Text fontSize="$sm" fontWeight="bold">Areas (select one or more)</Text>
                  <YStack space="$1" maxHeight={200} overflow="scroll">
                    {availableAreas.map(area => (
                      <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={watchedAreas.includes(area)}
                          onChange={() => toggleArea(area)}
                        />
                        <Text fontSize="$sm">{area}</Text>
                      </label>
                    ))}
                  </YStack>
                  {errors.areasCovered && (
                    <Text fontSize="$sm" color="$red10">
                      {errors.areasCovered.message}
                    </Text>
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
                  
                  <XStack space="$2">
                    <BrandButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onPress={() => setCourtSearchOpen(true)}
                    >
                      {watchedCourtIds.length > 0 
                        ? `${watchedCourtIds.length} court${watchedCourtIds.length > 1 ? 's' : ''} selected`
                        : 'Select Courts'
                      }
                    </BrandButton>
                  </XStack>
                  
                  {watchedCourtIds.length > 0 && (
                    <YStack space="$1">
                      <Text fontSize="$sm" fontWeight="bold">Selected Courts:</Text>
                      {watchedCourtIds.map(courtId => {
                        const court = courts?.find((c: any) => c.id === courtId)
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
            <XStack justifyContent="flex-end">
              <BrandButton
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
              </BrandButton>
            </XStack>
          </YStack>
        </form>

        {/* Court Selection Modal */}
        <Sheet
          modal
          open={courtSearchOpen}
          onOpenChange={setCourtSearchOpen}
        >
          <Sheet.Overlay />
          <Sheet.Frame>
            <YStack space="$4" padding="$4" maxHeight="80vh">
              <H3>Select Courts</H3>
              
              <YStack space="$2">
                <Text fontSize="$sm" fontWeight="bold">Search Courts</Text>
                <input
                  type="text"
                  placeholder="Search by name or area..."
                  value={courtSearchTerm}
                  onChange={(e) => setCourtSearchTerm(e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%'
                  }}
                />
              </YStack>

              <YStack space="$1" flex={1} overflow="scroll">
                {courtsLoading ? (
                  <Text>Loading courts...</Text>
                ) : (
                  filteredCourts.map((court: any) => (
                    <label key={court.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
                      <input
                        type="checkbox"
                        checked={watchedCourtIds.includes(court.id)}
                        onChange={() => toggleCourt(court.id)}
                      />
                      <YStack space="$1" flex={1}>
                        <Text fontSize="$sm" fontWeight="bold">{court.name}</Text>
                        <Text fontSize="$xs" color="$gray10">
                          {court.area && `${court.area} • `}LE {court.priceHourlyLE}/hour
                        </Text>
                      </YStack>
                    </label>
                  ))
                )}
              </YStack>

              <XStack space="$2" justifyContent="flex-end">
                <BrandButton
                  variant="ghost"
                  onPress={() => setCourtSearchOpen(false)}
                >
                  Cancel
                </BrandButton>
                <BrandButton
                  variant="primary"
                  onPress={() => setCourtSearchOpen(false)}
                >
                  Done
                </BrandButton>
              </XStack>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </Screen>
  )
}
