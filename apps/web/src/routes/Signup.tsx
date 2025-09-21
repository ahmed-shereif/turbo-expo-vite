import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SignupSchema } from '../forms/schemas';
import { useAuth, AuthClientError } from '../auth/AuthContext';
// Using simple HTML elements to avoid UI package coupling in this build
import { notify } from '../lib/notify';
import { Screen, BrandCard, BrandButton, TextField } from '@repo/ui'

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
      // Navigation is handled by the login function in AuthContext based on user role
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
    <Screen containerMaxWidth={720}>
      <BrandCard style={{ alignSelf: 'center', width: '100%' }}>
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
          <div>
            <Controller control={control} name="name" render={({ field }) => (<TextField placeholder="Name" fullWidth {...field} />)} />
            {errors.name && <div style={{ color: '#ef4444' }}>{errors.name.message}</div>}
          </div>
          <div>
            <Controller control={control} name="phone" render={({ field }) => (<TextField placeholder="Phone (+201234567890)" fullWidth {...field} />)} />
            {errors.phone && <div style={{ color: '#ef4444' }}>{errors.phone.message}</div>}
          </div>
          <div>
            <Controller control={control} name="email" render={({ field }) => (<TextField placeholder="Email" fullWidth {...field} />)} />
            {errors.email && <div style={{ color: '#ef4444' }}>{errors.email.message}</div>}
          </div>
          <div>
            <Controller control={control} name="password" render={({ field }) => (<TextField placeholder="Password" type="password" fullWidth {...field} />)} />
            {errors.password && <div style={{ color: '#ef4444' }}>{errors.password.message}</div>}
          </div>
          <div>
            <Controller control={control} name="birthday" render={({ field }) => (<TextField placeholder="Birthday (YYYY-MM-DD)" fullWidth {...field} />)} />
            {errors.birthday && <div style={{ color: '#ef4444' }}>{errors.birthday.message}</div>}
          </div>
          <div>
            <div>You are a</div>
            <Controller
              control={control}
              name="role"
              render={({ field: { value, onChange } }) => (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                  <BrandButton icon="User" variant={value === 'PLAYER' ? 'primary' : 'outline'} onPress={() => onChange('PLAYER')} fullWidth>Player</BrandButton>
                  <BrandButton icon="Building" variant={value === 'COURT_OWNER' ? 'primary' : 'outline'} onPress={() => onChange('COURT_OWNER')} fullWidth>Court owner</BrandButton>
                  <BrandButton icon="Dumbbell" variant={value === 'TRAINER' ? 'primary' : 'outline'} onPress={() => onChange('TRAINER')} fullWidth>Trainer</BrandButton>
                </div>
              )}
            />
            {errors.role && <div style={{ color: '#ef4444' }}>{(errors as any).role?.message}</div>}
          </div>
          {serverError && <div style={{ color: '#ef4444' }}>{serverError}</div>}
          <BrandButton icon="UserPlus" disabled={isSubmitting} onPress={handleSubmit(onSubmit)} fullWidth>{isSubmitting ? 'Signing up…' : 'Sign up'}</BrandButton>
        </form>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          <BrandButton variant="outline" icon="LogIn" onPress={() => navigate('/login')} fullWidth>Already have an account? Log in</BrandButton>
        </div>
      </BrandCard>
    </Screen>
  );
}
