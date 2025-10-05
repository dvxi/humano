import { z } from 'zod';

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Vital
  VITAL_API_KEY: z.string().optional(),
  VITAL_API_SECRET: z.string().optional(),
  VITAL_WEBHOOK_SECRET: z.string().optional(),
  VITAL_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Terra
  TERRA_DEV_ID: z.string().optional(),
  TERRA_API_KEY: z.string().optional(),
  TERRA_WEBHOOK_SECRET: z.string().optional(),

  // Polar
  POLAR_CLIENT_ID: z.string().optional(),
  POLAR_CLIENT_SECRET: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),

  // Google Fit
  GOOGLE_FIT_CLIENT_ID: z.string().optional(),
  GOOGLE_FIT_CLIENT_SECRET: z.string().optional(),
  GOOGLE_FIT_WEBHOOK_SECRET: z.string().optional(),

  // Telemetry
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();
