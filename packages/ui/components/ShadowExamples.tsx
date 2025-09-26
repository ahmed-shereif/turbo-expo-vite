import { YStack, XStack, Text, View, Button } from 'tamagui'
import { 
  ShadowView, 
  CardShadow, 
  ButtonShadow, 
  ModalShadow, 
  FloatingShadow
} from './ShadowSystem'
import { BrandButton } from './BrandButton'
import { BrandCard } from './BrandCard'

/**
 * Shadow Examples Component
 * 
 * This component demonstrates proper usage of the shadow system
 * across different UI elements and states.
 */
export function ShadowExamples() {
  return (
    <YStack gap="$6" padding="$4" maxWidth={800} marginHorizontal="auto">
      <Text fontSize="$8" fontWeight="800" textAlign="center" marginBottom="$4">
        Shadow System Examples
      </Text>

      {/* Button Examples */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Buttons with Shadows
        </Text>
        
        <XStack gap="$4" flexWrap="wrap">
          <ButtonShadow color="primary">
            <Button backgroundColor="$primary" color="white" paddingHorizontal="$4" paddingVertical="$3">
              Primary Button
            </Button>
          </ButtonShadow>
          
          <ButtonShadow color="secondary">
            <Button backgroundColor="$secondary" color="white" paddingHorizontal="$4" paddingVertical="$3">
              Secondary Button
            </Button>
          </ButtonShadow>
          
          <ButtonShadow elevated={false}>
            <Button backgroundColor="transparent" color="$primary" paddingHorizontal="$4" paddingVertical="$3">
              Ghost Button
            </Button>
          </ButtonShadow>
        </XStack>
      </YStack>

      {/* Card Examples */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Cards with Shadows
        </Text>
        
        <XStack gap="$4" flexWrap="wrap">
          <ShadowView level="xs">
            <YStack backgroundColor="$surface" padding="$3" borderRadius="$3" minWidth={150}>
              <Text fontSize="$4" fontWeight="600">Subtle Card</Text>
              <Text fontSize="$3" color="$textMuted">xs shadow level</Text>
            </YStack>
          </ShadowView>
          
          <CardShadow>
            <YStack backgroundColor="$surface" padding="$4" borderRadius="$4" minWidth={150}>
              <Text fontSize="$4" fontWeight="600">Standard Card</Text>
              <Text fontSize="$3" color="$textMuted">md shadow level</Text>
            </YStack>
          </CardShadow>
          
          <ShadowView level="lg">
            <YStack backgroundColor="$surface" padding="$5" borderRadius="$5" minWidth={150}>
              <Text fontSize="$4" fontWeight="600">Floating Card</Text>
              <Text fontSize="$3" color="$textMuted">lg shadow level</Text>
            </YStack>
          </ShadowView>
        </XStack>
      </YStack>

      {/* Interactive States */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Interactive States
        </Text>
        
        <XStack gap="$4" flexWrap="wrap">
          <ShadowView level="sm" state="default" color="primary">
            <Button backgroundColor="$primary" color="white" paddingHorizontal="$4" paddingVertical="$3">
              Default State
            </Button>
          </ShadowView>
          
          <ShadowView level="sm" state="hover" color="primary">
            <Button backgroundColor="$primary" color="white" paddingHorizontal="$4" paddingVertical="$3">
              Hover State
            </Button>
          </ShadowView>
          
          <ShadowView level="sm" state="pressed" color="primary">
            <Button backgroundColor="$primary" color="white" paddingHorizontal="$4" paddingVertical="$3">
              Pressed State
            </Button>
          </ShadowView>
        </XStack>
      </YStack>

      {/* Modal and Overlay Examples */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Modals and Overlays
        </Text>
        
        <XStack gap="$4" flexWrap="wrap">
          <ModalShadow>
            <YStack backgroundColor="$surface" padding="$6" borderRadius="$4" minWidth={200}>
              <Text fontSize="$5" fontWeight="700" marginBottom="$2">Modal Dialog</Text>
              <Text fontSize="$4" color="$textMuted" marginBottom="$4">
                This demonstrates xl shadow level for modals
              </Text>
              <ButtonShadow color="primary">
                <Button backgroundColor="$primary" color="white" paddingHorizontal="$4" paddingVertical="$3">
                  Close
                </Button>
              </ButtonShadow>
            </YStack>
          </ModalShadow>
          
          <FloatingShadow>
            <YStack backgroundColor="$surface" padding="$4" borderRadius="$4" minWidth={180}>
              <Text fontSize="$4" fontWeight="600" marginBottom="$2">Floating Menu</Text>
              <Text fontSize="$3" color="$textMuted">lg shadow for floating elements</Text>
            </YStack>
          </FloatingShadow>
        </XStack>
      </YStack>

      {/* Brand Components */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Brand Components with Shadows
        </Text>
        
        <XStack gap="$4" flexWrap="wrap">
          <BrandButton variant="primary" size="md">
            Brand Primary
          </BrandButton>
          
          <BrandButton variant="secondary" size="md">
            Brand Secondary
          </BrandButton>
          
          <BrandButton variant="outline" size="md">
            Brand Outline
          </BrandButton>
          
          <BrandButton variant="ghost" size="md">
            Brand Ghost
          </BrandButton>
        </XStack>
        
        <XStack gap="$4" flexWrap="wrap">
          <BrandCard elevated={true} minWidth={200}>
            <Text fontSize="$4" fontWeight="600" marginBottom="$2">Elevated Card</Text>
            <Text fontSize="$3" color="$textMuted">Using BrandCard with elevation</Text>
          </BrandCard>
          
          <BrandCard elevated={false} minWidth={200}>
            <Text fontSize="$4" fontWeight="600" marginBottom="$2">Flat Card</Text>
            <Text fontSize="$3" color="$textMuted">Using BrandCard without elevation</Text>
          </BrandCard>
        </XStack>
      </YStack>

      {/* Shadow Levels Comparison */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Shadow Levels Comparison
        </Text>
        
        <YStack gap="$3">
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((level) => (
            <ShadowView key={level} level={level} color="default">
              <XStack 
                backgroundColor="$surface" 
                padding="$4" 
                borderRadius="$4"
                alignItems="center"
                justifyContent="space-between"
                minWidth={300}
              >
                <Text fontSize="$4" fontWeight="600" textTransform="uppercase">
                  {level} Shadow
                </Text>
                <Text fontSize="$3" color="$textMuted">
                  Level {level}
                </Text>
              </XStack>
            </ShadowView>
          ))}
        </YStack>
      </YStack>

      {/* Colored Shadows */}
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$textHigh">
          Colored Shadows
        </Text>
        
        <XStack gap="$4" flexWrap="wrap">
          <ShadowView level="md" color="primary">
            <View backgroundColor="$primary" padding="$4" borderRadius="$4" minWidth={120}>
              <Text color="white" fontSize="$4" fontWeight="600" textAlign="center">
                Primary
              </Text>
            </View>
          </ShadowView>
          
          <ShadowView level="md" color="secondary">
            <View backgroundColor="$secondary" padding="$4" borderRadius="$4" minWidth={120}>
              <Text color="white" fontSize="$4" fontWeight="600" textAlign="center">
                Secondary
              </Text>
            </View>
          </ShadowView>
          
          <ShadowView level="md" color="accent">
            <View backgroundColor="$accent" padding="$4" borderRadius="$4" minWidth={120}>
              <Text color="white" fontSize="$4" fontWeight="600" textAlign="center">
                Accent
              </Text>
            </View>
          </ShadowView>
          
          <ShadowView level="md" color="default">
            <View backgroundColor="$surface" padding="$4" borderRadius="$4" minWidth={120} borderWidth={1} borderColor="$color4">
              <Text color="$textHigh" fontSize="$4" fontWeight="600" textAlign="center">
                Default
              </Text>
            </View>
          </ShadowView>
        </XStack>
      </YStack>
    </YStack>
  )
}
