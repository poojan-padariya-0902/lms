'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from '@/store';
import { hydrateAuth } from '@/store/slices/authSlice';
import { Toaster } from '@/components/ui/sonner';

interface ReduxProviderProps {
  children: React.ReactNode;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </AuthInitializer>
    </Provider>
  );
}

export default ReduxProvider;

