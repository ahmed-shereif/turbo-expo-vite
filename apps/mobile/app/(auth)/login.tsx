import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { YStack, Text } from 'tamagui';
import { Screen, BrandCard, BrandButton, TextField } from '@repo/ui'
import { LoginSchema } from '../../src/forms/schemas';
import { useAuth } from '../../src/providers/AuthProvider';
import { AuthClientError } from '../../src/lib/authClient';
import { notify } from '../../src/lib/notify';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    // @ts-expect-error Allow zod resolver version mismatch in mobile app
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      notify.success('Logged in successfully');
      router.replace('/(app)');
    } catch (error) {
      if (error instanceof AuthClientError) {
        setServerError(error.message);
        notify.error(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
        notify.error('Unexpected error. Please try again.');
      }
    }
  };

  return (
    <Screen>
      <BrandCard>
        <Text fontSize="$6">Login</Text>
        <YStack space>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Email"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && <Text color="red">{errors.email.message}</Text>}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Password"
                onBlur={onBlur as any}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.password && <Text color="red">{errors.password.message}</Text>}

          <BrandButton icon="LogIn" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </BrandButton>
          {serverError && <Text color="red">{serverError}</Text>}
          <BrandButton variant="outline" icon="UserPlus" onPress={() => router.push('/(auth)/signup')}>
            Don't have an account? Sign up
          </BrandButton>
        </YStack>
      </BrandCard>
    </Screen>
  );
}
