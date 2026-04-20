import { useCallback } from 'react';
import useAuthStore from '@/store/auth.store';
import { UserRole } from '@/type';

export const useRoleBasedAccess = () => {
  const { user } = useAuthStore();

  const hasRole = useCallback((requiredRoles: UserRole | UserRole[]) => {
    if (!user) return false;

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  }, [user]);

  const canAccessAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const canAccessKitchen = useCallback(() => hasRole(['kitchen', 'admin']), [hasRole]);
  const canAccessFrontDesk = useCallback(() => hasRole(['desk', 'admin']), [hasRole]);
  const canAccessWaiter = useCallback(() => hasRole(['waiter', 'admin']), [hasRole]);
  const canAccessCustomerDisplay = useCallback(() => hasRole(['admin', 'desk']), [hasRole]);
  const isCustomer = useCallback(() => hasRole('customer'), [hasRole]);

  return {
    user,
    hasRole,
    canAccessAdmin,
    canAccessKitchen,
    canAccessFrontDesk,
    canAccessWaiter,
    canAccessCustomerDisplay,
    isCustomer,
  };
};