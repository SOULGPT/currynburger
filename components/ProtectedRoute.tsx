import React from 'react';
import { Redirect } from 'expo-router';
import useAuthStore from '@/store/auth.store';
import { UserRole } from '@/type';

interface ProtectedRouteProps {
  requiredRoles: UserRole | UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles,
  children,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Redirect href="/sign-in" />;
  }

  const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'customer') {
      return <Redirect href="/(tabs)" />;
    } else if (user.role === 'waiter') {
      return <Redirect href="/(waiter)" />;
    } else if (user.role === 'kitchen') {
      return <Redirect href="/(kitchen)" />;
    } else if (user.role === 'desk') {
      return <Redirect href="/(frontdesk)" />;
    } else if (user.role === 'admin') {
      return <Redirect href="/(admin)" />;
    }
    return <Redirect href="/" />;
  }

  return <>{children}</>;
};