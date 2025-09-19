import { useState } from 'react'
import { View, Text } from '@tamagui/core'
import { Button } from '@tamagui/button'
import { Card } from '@tamagui/card'
import { Input } from '@tamagui/input'
import { Switch } from '@tamagui/switch'

export function TamaguiAdvancedTest() {
  const [switchValue, setSwitchValue] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <Card padding="$4" margin="$4" backgroundColor="$background" borderRadius="$4">
      <View gap="$3">
        <Text fontSize="$6" fontWeight="bold">Advanced Tamagui Test</Text>
        
        <Input
          placeholder="Test input"
          value={inputValue}
          onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
          size="$4"
        />
        
        <View flexDirection="row" alignItems="center" gap="$3">
          <Switch
            checked={switchValue}
            onCheckedChange={setSwitchValue}
            size="$4"
          />
          <Text>Toggle: {switchValue ? 'On' : 'Off'}</Text>
        </View>
        
        <View flexDirection="row" gap="$2">
          <Button theme="active" size="$3">
            Primary Button
          </Button>
          <Button variant="outlined" size="$3">
            Outlined
          </Button>
        </View>
        
        <Text fontSize="$3" color="$gray10">
          Input: {inputValue || 'Empty'}
        </Text>
      </View>
    </Card>
  )
}