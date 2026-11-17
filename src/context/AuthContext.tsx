"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { INITIAL_USERS } from "../lib/data";
import {
  createSessionToken,
  verifyPassword,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "../lib/security";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
  remainingAttempts?: number;
}

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => LoginResult;
  registerUser: (params: RegisterParams) => User;
  addAdminUser: (params: RegisterParams) => User;
  updateAdminUser: (id: string, updates: Partial<User>) => void;
  deleteAdminUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_USER_KEY = "smart_menu_auth_user";
const STORAGE_USERS_LIST = "smart_menu_registered_users";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize from storage or stay logged out
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // 1. Load any extra registered users from localStorage
      const savedUsersList = localStorage.getItem(STORAGE_USERS_LIST);
      let allUsers = INITIAL_USERS;
      if (savedUsersList) {
        const parsed = JSON.parse(savedUsersList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allUsers = [
            ...INITIAL_USERS,
            ...parsed.filter((p: User) => !INITIAL_USERS.some((d) => d.email.toLowerCase() === p.email.toLowerCase())),
          ];
          setUsers(allUsers);
        }
      }

      // 2. Check if a user had actively logged in previously
      const savedUserId = localStorage.getItem(STORAGE_USER_KEY);
      if (savedUserId) {
        const found = allUsers.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (e) {
      console.error("Auth initialization error:", e);
    }
  }, []);

  const login = (email: string, password: string): LoginResult => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!normalizedEmail) {
      return { success: false, error: "يرجى إدخال البريد الإلكتروني" };
    }
    if (!cleanPassword) {
      return { success: false, error: "يرجى إدخال كلمة المرور" };
    }

    // Rate limiting: 5 attempts max
    const rateCheck = checkRateLimit(normalizedEmail, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `تم إيقاف محاولات الدخول مؤقتاً لأسباب أمنية. يرجى المحاولة بعد ${Math.ceil(
          rateCheck.retryAfterSeconds / 60
        )} دقيقة.`,
      };
    }

    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      const fail = recordFailedAttempt(normalizedEmail, 5);
      return {
        success: false,
        error: "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.",
        remainingAttempts: Math.max(0, 5 - (fail.blocked ? 5 : 1)),
      };
    }

    if (foundUser.isActive === false) {
      return {
        success: false,
        error: "هذا الحساب موقوف من قبل الإدارة المركزية.",
      };
    }

    // Verify password strictly against user account password
    const isMatch = foundUser.password === cleanPassword;
    if (!isMatch) {
      const fail = recordFailedAttempt(normalizedEmail, 5);
      return {
        success: false,
        error: "كلمة المرور غير صحيحة. يرجى التأكد من الرمز المدخل.",
        remainingAttempts: Math.max(0, 5 - (fail.blocked ? 5 : 1)),
      };
    }

    // Success - reset rate limits
    resetRateLimit(normalizedEmail);

    // Login successful
    setCurrentUser(foundUser);
    try {
      localStorage.setItem(STORAGE_USER_KEY, foundUser.id);

      // Create and set secure session token in cookies for Next.js middleware
      createSessionToken({
        userId: foundUser.id,
        role: foundUser.role,
        tenantId: foundUser.tenantId,
      }).then((token) => {
        document.cookie = `smart_menu_session=${token}; path=/; max-age=86400; SameSite=Lax`;
      });
    } catch (e) {}

    return { success: true, user: foundUser };
  };

  const registerUser = (params: RegisterParams): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: params.name,
      email: params.email.trim().toLowerCase(),
      password: params.password,
      phone: params.phone || "",
      role: params.role,
      tenantId: params.tenantId,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);

    try {
      localStorage.setItem(STORAGE_USER_KEY, newUser.id);
      const customUsers = updatedUsers.filter((u) => !INITIAL_USERS.some((d) => d.id === u.id));
      localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(customUsers));
    } catch (e) {}

    return newUser;
  };

  const addAdminUser = (params: RegisterParams): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: params.name,
      email: params.email.trim().toLowerCase(),
      password: params.password,
      phone: params.phone || "",
      role: params.role,
      tenantId: params.tenantId,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    try {
      const customUsers = updatedUsers.filter((u) => !INITIAL_USERS.some((d) => d.id === u.id));
      localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(customUsers));
    } catch (e) {}

    return newUser;
  };

  const updateAdminUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updatedUsers);
    if (currentUser?.id === id) {
      setCurrentUser({ ...currentUser, ...updates });
    }
    try {
      const customUsers = updatedUsers.filter((u) => !INITIAL_USERS.some((d) => d.id === u.id));
      localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(customUsers));
    } catch (e) {}
  };

  const deleteAdminUser = (id: string) => {
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    try {
      const customUsers = updatedUsers.filter((u) => !INITIAL_USERS.some((d) => d.id === u.id));
      localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(customUsers));
    } catch (e) {}
  };

  const toggleUserStatus = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      updateAdminUser(id, { isActive: target.isActive === false ? true : false });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      document.cookie = "smart_menu_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {}
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "SUPER_ADMIN") return true; // Super Admin has universal access
    return allowedRoles.includes(currentUser.role);
  };

  const currentRole: UserRole = currentUser ? currentUser.role : "CUSTOMER";
  const isAuthenticated = !!currentUser && currentUser.role !== "CUSTOMER";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        users,
        login,
        registerUser,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        toggleUserStatus,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
