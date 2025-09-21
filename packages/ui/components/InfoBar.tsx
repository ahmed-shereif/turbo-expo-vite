import React, { createContext, useContext } from 'react'
import { XStack, Paragraph, Separator, Spacer, YStack, useMedia } from 'tamagui'

// UI-level current user shape (kept minimal to avoid leaking app specifics)
export interface CurrentUser {
  firstName?: string
  lastName?: string
  fullName?: string
  rank?: string
  role?: string
}

type CurrentUserContextValue = {
  user: CurrentUser | null
}

const CurrentUserContext = createContext<CurrentUserContextValue>({ user: null })

export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext).user
}

export function CurrentUserProvider({ children, user }: { children: React.ReactNode; user: CurrentUser | null }) {
  return <CurrentUserContext.Provider value={{ user }}>{children}</CurrentUserContext.Provider>
}

function getGreetingName(user: CurrentUser | null): string {
  if (!user) return 'there'
  const first = (user.firstName || '').trim()
  const last = (user.lastName || '').trim()
  const full = (user.fullName || '').trim()
  const name = [first, last].filter(Boolean).join(' ') || full
  return name || 'there'
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <XStack backgroundColor="$gray3" borderRadius="$2" paddingHorizontal="$2" paddingVertical="$1">
      <Paragraph size="$2" color="$gray11" numberOfLines={1}>
        {children}
      </Paragraph>
    </XStack>
  )
}

export function InfoBar() {
  const user = useCurrentUser()
  const name = getGreetingName(user)
  const media = useMedia()

  return (
    <YStack role="banner" aria-label="User info bar">
      <XStack
        position="relative"
        top={0}
        zIndex={100}
        backgroundColor="$background"
        borderBottomWidth={1}
        borderColor="$gray6"
        paddingHorizontal="$3"
        paddingVertical="$2"
        alignItems="center"
        justifyContent="space-between"
        gap="$2"
      >
        {/* Left: Greeting */}
        <Paragraph
          size="$3"
          color="$color12"
          numberOfLines={1}
          wordWrap="normal"
          maxWidth="60%"
        >
          Hi, {name}
        </Paragraph>

        {/* Middle separator for >= md */}
        {media.md ? (
          <XStack alignItems="center">
            <Separator vertical aria-hidden borderColor="$gray6" />
          </XStack>
        ) : null}

        {/* Right: Rank / Role */}
        <XStack
          alignItems="center"
          gap="$2"
          flexShrink={1}
          justifyContent="flex-end"
        >
          {media.md ? (
            // Desktop/Tablet: labeled with separator
            <XStack alignItems="center" gap="$3">
              {user?.rank ? (
                <XStack alignItems="center" gap="$2">
                  <Paragraph size="$3" color="$gray11">Rank:</Paragraph>
                  <Pill>{user.rank}</Pill>
                </XStack>
              ) : null}
              <Spacer size="$2" />
              {user?.role ? (
                <XStack alignItems="center" gap="$2">
                  <Paragraph size="$3" color="$gray11">Role:</Paragraph>
                  <Pill>{user.role}</Pill>
                </XStack>
              ) : null}
            </XStack>
          ) : (
            // Mobile: compact dot separators, no labels
            <XStack alignItems="center" gap="$2">
              {user?.rank ? <Pill>{user.rank}</Pill> : null}
              {user?.role ? (
                <>
                  <Paragraph aria-hidden color="$gray8">•</Paragraph>
                  <Pill>{user.role}</Pill>
                </>
              ) : null}
            </XStack>
          )}
        </XStack>
      </XStack>
    </YStack>
  )
}

export default InfoBar


