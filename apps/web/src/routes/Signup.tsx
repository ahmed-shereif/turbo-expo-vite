import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SignupSchema } from '../forms/schemas';
import { useAuth, AuthClientError } from '../auth/AuthContext';
import { BrandButton, BrandCard, TextField, View, Text } from '@repo/ui';
import { notify } from '../lib/notify';

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    try {
      await signup(data.name, data.email, data.phone, data.password, data.role);
      await login(data.email, data.password);
      notify.success('Account created');
      if (data.role === 'TRAINER') {
        navigate('/trainer', { replace: true });
      } else if (data.role === 'COURT_OWNER') {
        navigate('/', { replace: true }); // Placeholder, add court-owner route if available
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            setError(field as keyof SignupFormValues, { message });
          }
          notify.error('Please fix the highlighted fields');
        } else {
          setServerError(error.message);
          notify.error(error.message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
        notify.error('Unexpected error. Please try again.');
      }
    }
  };

  return (
    <View flex={1} minHeight="100vh" backgroundColor="$bgSoft" justifyContent="center" alignItems="center" padding="$6">
      <BrandCard elevated width={420} maxWidth="94%">
        <View gap="$4">
          <Text fontSize="$8" fontWeight="800" color="$textHigh">Sign up</Text>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField fullWidth placeholder="Name" {...field} />
                )}
              />
              {errors.name && (
                <Text color="#ef4444" fontSize="$3">{errors.name.message}</Text>
              )}
            </div>

            <div>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextField fullWidth placeholder="Phone (+201234567890)" {...field} />
                )}
              />
              {errors.phone && (
                <Text color="#ef4444" fontSize="$3">{errors.phone.message}</Text>
              )}
            </div>

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

            <div>
              <Controller
                control={control}
                name="birthday"
                render={({ field }) => (
                  <TextField fullWidth placeholder="Birthday (YYYY-MM-DD)" {...field} />
                )}
              />
              {errors.birthday && (
                <Text color="#ef4444" fontSize="$3">{errors.birthday.message}</Text>
              )}
            </div>

            <div>
              <Text fontWeight="700">You are a</Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { value, onChange } }) => (
                  <View gap="$3" flexDirection="row">
                    <BrandButton
                      variant={value === 'PLAYER' ? 'primary' : 'outline'}
                      onPress={() => onChange('PLAYER')}
                    >
                      Player
                    </BrandButton>
                    <BrandButton
                      variant={value === 'COURT_OWNER' ? 'primary' : 'outline'}
                      onPress={() => onChange('COURT_OWNER')}
                    >
                      Court owner
                    </BrandButton>
                    <BrandButton
                      variant={value === 'TRAINER' ? 'primary' : 'outline'}
                      onPress={() => onChange('TRAINER')}
                    >
                      Trainer
                    </BrandButton>
                  </View>
                )}
              />
              {errors.role && (
                <Text color="#ef4444" fontSize="$3">{(errors as any).role?.message}</Text>
              )}
            </div>

            {serverError && (
              <Text color="#ef4444" fontSize="$3">{serverError}</Text>
            )}

            <BrandButton fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Signing up…' : 'Sign up'}
            </BrandButton>
          </form>

          <View alignItems="center">
            <BrandButton variant="ghost" onPress={() => navigate('/login')}>
              Already have an account? Log in
            </BrandButton>
          </View>
        </View>
      </BrandCard>
    </View>
  );
}
