import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isSuperAdmin: boolean;
  canManageOfficials: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  const isSuperAdmin = profile?.role === 'super_admin';
  const canManageOfficials = isSuperAdmin;

  const value = {
    isSuperAdmin,
    canManageOfficials
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};