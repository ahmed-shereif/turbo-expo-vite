import React from 'react'
import { YStack, XStack, H2 } from 'tamagui'
import { Skeleton } from './Skeleton'
import { BrandCard } from './BrandCard'

export function TrainerProfileSkeleton() {
  return (
    <YStack space="$4" padding="$4">
      <H2>
        <Skeleton width={200} height={32} />
      </H2>

      <BrandCard>
        <YStack space="$4" padding="$4">
          {/* Price Input Skeleton */}
          <YStack space="$2">
            <Skeleton width={120} height={20} />
            <XStack alignItems="center" space="$2">
              <Skeleton width="100%" height={48} borderRadius="$4" />
            </XStack>
          </YStack>

          {/* Level Select Skeleton */}
          <YStack space="$2">
            <Skeleton width={100} height={20} />
            <Skeleton width="100%" height={48} borderRadius="$4" />
          </YStack>

          {/* City Select Skeleton */}
          <YStack space="$2">
            <Skeleton width={60} height={20} />
            <Skeleton width="100%" height={48} borderRadius="$4" />
          </YStack>

          {/* Areas Covered Skeleton */}
          <YStack space="$2">
            <Skeleton width={100} height={20} />
            <Skeleton width={200} height={16} />
            <YStack space="$2" maxHeight={200}>
              {Array.from({ length: 6 }).map((_, i) => (
                <XStack key={i} space="$2" alignItems="center">
                  <Skeleton width={20} height={20} borderRadius="$2" />
                  <Skeleton width={120} height={16} />
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Courts Skeleton */}
          <YStack space="$2">
            <Skeleton width={120} height={20} />
            <Skeleton width={180} height={16} />
            <YStack space="$2" maxHeight={200}>
              {Array.from({ length: 4 }).map((_, i) => (
                <XStack key={i} space="$2" alignItems="center">
                  <Skeleton width={20} height={20} borderRadius="$2" />
                  <Skeleton width={150} height={16} />
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Save Button Skeleton */}
          <Skeleton width="100%" height={48} borderRadius="$5" />
        </YStack>
      </BrandCard>
    </YStack>
  )
}
