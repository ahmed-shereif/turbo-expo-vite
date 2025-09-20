import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { YStack, Input, Button, Text } from 'tamagui';
import { LoginSchema } from '../../src/forms/schemas';
import { useAuth } from '../../src/providers/AuthProvider';
import { AuthClientError } from '../../src/lib/authClient';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      router.replace('/(app)');
    } catch (error) {
      if (error instanceof AuthClientError) {
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <YStack space padding="$4">
      <Text fontSize="$6">Login</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Email"
            onBlur={onBlur}
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
          <Input
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text color="red">{errors.password.message}</Text>}

      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
      {serverError && <Text color="red">{serverError}</Text>}
      <Button onPress={() => router.push('/(auth)/signup')}>
        Don't have an account? Sign up
      </Button>
    </YStack>
  );
}
