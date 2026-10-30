'use client';

// VORTEX GAMING — Authentication & RBAC Store
// Enforces role-based permissions: CUSTOMER, SUPPORT_AGENT, PRODUCT_MANAGER, ADMIN, SUPER_ADMIN

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CUSTOMER' | 'SUPPORT_AGENT' | 'PRODUCT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  discordId?: string | null;
  discordUsername?: string | null;
  role: UserRole;
  mfaEnabled: boolean;
  locale: string;
  currency: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (user: UserProfile, token: string) => {
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER'].includes(user.role);
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      updateUser: (updated) => {
        const current = get().user;
        if (!current) return;
        const nextUser = { ...current, ...updated };
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER'].includes(nextUser.role);
        set({ user: nextUser, isAdmin });
      },
    }),
    {
      name: 'vortex-auth-store',
    }
  )
);
