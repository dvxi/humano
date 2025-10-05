import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import { db } from './db';
import { Resend } from 'resend';
import { createLogger } from './logger';

const logger = createLogger('auth');
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db) as any,
  providers: [
    // Email magic link
    EmailProvider({
      server: '', // Not needed with Resend
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (!resend) {
          logger.warn('Resend not configured, logging magic link URL');
          console.log(`Magic link for ${email}: ${url}`);
          return;
        }

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: email,
            subject: 'Sign in to Fitness App',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #000;">Sign in to Fitness App</h1>
                <p>Click the link below to sign in:</p>
                <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 24px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </div>
            `,
          });
          logger.info({ email }, 'Magic link sent');
        } catch (error) {
          logger.error({ error, email }, 'Failed to send magic link');
          throw error;
        }
      },
    }),

    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // GitHub OAuth
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch user role from database
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        session.user.role = dbUser?.role || 'USER';
      }
      return session;
    },
    async signIn({ user, account }) {
      logger.info({ userId: user.id, provider: account?.provider }, 'User signed in');
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      logger.info({ userId: user.id }, 'New user created');
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};
