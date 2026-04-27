import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'CLIENT' | 'ADMIN';
    } & DefaultSession['user'];
  }
  interface User {
    role?: 'CLIENT' | 'ADMIN';
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: 'CLIENT' | 'ADMIN';
  }
}

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        const parsed = credSchema.safeParse(creds);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const found = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
        if (found.length === 0) return null;
        const u = found[0];
        const ok = await bcrypt.compare(password, u.password);
        if (!ok) return null;
        return {
          id: u.id,
          email: u.email,
          name: u.name ?? undefined,
          role: u.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: 'CLIENT' | 'ADMIN' }).role ?? 'CLIENT';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || '';
        session.user.role = (token.role as 'CLIENT' | 'ADMIN') || 'CLIENT';
      }
      return session;
    },
  },
});
