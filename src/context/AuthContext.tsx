"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { DEMO_USERS } from "../lib/data";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
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
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_USER_KEY = "smart_menu_auth_user";
const STORAGE_USERS_LIST = "smart_menu_registered_users";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize from storage or stay logged out
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // 1. Load any extra registered users from localStorage
      const savedUsersList = localStorage.getItem(STORAGE_USERS_LIST);
      let allUsers = DEMO_USERS;
      if (savedUsersList) {
        const parsed = JSON.parse(savedUsersList);
        if (Array.isArray(parsed)) {
          allUsers = [
            ...DEMO_USERS,
            ...parsed.filter((p: User) => !DEMO_USERS.some((d) => d.email.toLowerCase() === p.email.toLowerCase())),
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

    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return {
        success: false,
        error: "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.",
      };
    }

    // Verify password (matches user password, or standard default passwords)
    const validPasswords = [foundUser.password, "password123", "admin123", "123456"].filter(Boolean);
    if (!validPasswords.includes(cleanPassword)) {
      return {
        success: false,
        error: "كلمة المرور غير صحيحة. يرجى التأكد من الرمز المدخل.",
      };
    }

    // Login successful
    setCurrentUser(foundUser);
    try {
      localStorage.setItem(STORAGE_USER_KEY, foundUser.id);
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
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);

    try {
      localStorage.setItem(STORAGE_USER_KEY, newUser.id);
      const customUsers = updatedUsers.filter((u) => !DEMO_USERS.some((d) => d.id === u.id));
      localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(customUsers));
    } catch (e) {}

    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
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
