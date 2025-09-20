import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+\d{8,15}$/i, 'Use international format, e.g. +201234567890'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/\d/, 'At least one digit'),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/i, 'Use format YYYY-MM-DD'),
  role: z.enum(['PLAYER', 'TRAINER', 'COURT_OWNER']),
});
