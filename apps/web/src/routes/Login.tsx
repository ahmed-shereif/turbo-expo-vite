import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LoginSchema } from '../forms/schemas';
import { useAuth, AuthClientError } from '../auth/AuthContext';
import { notify } from '../lib/notify';
import { Screen, BrandCard, BrandButton, TextField } from '@repo/ui'

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
      notify.success('Logged in successfully');
      // Navigation is handled by the login function in AuthContext based on user role
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
    <Screen containerMaxWidth={640}>
      <BrandCard style={{ alignSelf: 'center', width: '100%' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
          <div>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField placeholder="Email" fullWidth {...field} />
              )}
            />
            {errors.email && (
              <div style={{ color: '#ef4444' }}>{errors.email.message}</div>
            )}
          </div>

          <div>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <TextField placeholder="Password" type="password" fullWidth {...field} />
              )}
            />
            {errors.password && (
              <div style={{ color: '#ef4444' }}>{errors.password.message}</div>
            )}
          </div>

          {serverError && (
            <div style={{ color: '#ef4444' }}>{serverError}</div>
          )}

          <BrandButton disabled={isSubmitting} onPress={handleSubmit(onSubmit)} fullWidth icon="LogIn">
            {isSubmitting ? 'Logging in…' : 'Login'}
          </BrandButton>
        </form>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          <BrandButton variant="outline" onPress={() => navigate('/signup')} fullWidth icon="UserPlus">
            Don't have an account? Sign up
          </BrandButton>
        </div>
      </BrandCard>
    </Screen>
  );
}
