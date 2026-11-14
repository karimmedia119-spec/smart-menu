"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { DEMO_USERS } from "../lib/data";

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  users: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  login: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "smart_menu_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // Default Super Admin

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEY);
      if (savedUserId) {
        const found = DEMO_USERS.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (e) {}
  }, []);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem(STORAGE_KEY, user.id);
      } catch (e) {}
    }
  };

  const switchRole = (role: UserRole) => {
    const matchingUser = users.find((u) => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser);
      try {
        localStorage.setItem(STORAGE_KEY, matchingUser.id);
      } catch (e) {}
    } else {
      // Create a temporary profile for that role
      const tempUser: User = {
        id: `usr-${role.toLowerCase()}-${Date.now()}`,
        name: `مستخدم تجريبي (${role})`,
        email: `${role.toLowerCase()}@smartmenu.app`,
        role: role,
        tenantId: role === "SUPER_ADMIN" ? undefined : "tenant-el-prince",
      };
      setCurrentUser(tempUser);
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (currentUser.role === "SUPER_ADMIN") return true; // Super Admin has universal access
    return allowedRoles.includes(currentUser.role);
  };

  const login = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalized);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(STORAGE_KEY, found.id);
      } catch (e) {}
      return true;
    }
    return false;
  };

  const logout = () => {
    // Revert to customer/guest
    const customerUser = users.find((u) => u.role === "CUSTOMER") || users[4];
    setCurrentUser(customerUser);
    try {
      localStorage.setItem(STORAGE_KEY, customerUser.id);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        users,
        switchUser,
        switchRole,
        hasRole,
        login,
        logout,
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
