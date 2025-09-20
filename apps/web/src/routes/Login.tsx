import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LoginSchema } from '../forms/schemas';
import { useAuth, AuthClientError } from '../auth/AuthContext';
import { BrandButton, BrandCard, TextField, View, Text } from '@repo/ui';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function Login() {
  const navigate = useNavigate();
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
      navigate('/');
    } catch (error) {
      if (error instanceof AuthClientError) {
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <View flex={1} minHeight="100vh" backgroundColor="$bgSoft" justifyContent="center" alignItems="center" padding="$6">
      <BrandCard elevated width={420} maxWidth="94%">
        <View gap="$4">
          <Text fontSize="$8" fontWeight="800" color="$textHigh">Login</Text>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextField fullWidth placeholder="Email" {...field} />
                )}
              />
              {errors.email && (
                <Text color="#ef4444" fontSize="$3">{errors.email.message}</Text>
              )}
            </div>

            <div>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <TextField fullWidth placeholder="Password" type="password" {...field} />
                )}
              />
              {errors.password && (
                <Text color="#ef4444" fontSize="$3">{errors.password.message}</Text>
              )}
            </div>

            {serverError && (
              <Text color="#ef4444" fontSize="$3">{serverError}</Text>
            )}

            <BrandButton type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Login'}
            </BrandButton>
          </form>

          <View alignItems="center">
            <BrandButton variant="ghost" onPress={() => navigate('/signup')}>
              Don't have an account? Sign up
            </BrandButton>
          </View>
        </View>
      </BrandCard>
    </View>
  );
}
