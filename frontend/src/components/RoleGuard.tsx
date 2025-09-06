import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { profile } = useAuth();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Helper hooks for specific roles
export const useIsAdmin = () => {
  const { profile } = useAuth();
  return profile?.role === "admin";
};

export const useIsDoctor = () => {
  const { profile } = useAuth();
  return profile?.role === "doctor";
};

export const useIsNurse = () => {
  const { profile } = useAuth();
  return profile?.role === "nurse";
};

export const useIsStaff = () => {
  const { profile } = useAuth();
  return profile?.role === "staff";
};
