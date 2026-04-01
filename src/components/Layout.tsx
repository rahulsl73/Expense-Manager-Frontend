import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchSettings } from '../store/slices/settingsSlice';
import Navbar from './Navbar';
import { Navigate } from 'react-router-dom';

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(s => s.auth.user);
  const userId = user?.id;

  const loadingFetch = useAppSelector(s => s.settings.loadingFetch);
  const fetchError = useAppSelector(s => s.settings.error);
  const theme = useAppSelector(s => s.settings.settings?.theme); 

  const hasFetched = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'DARK') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (userId && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchSettings());
    }
    if (!userId) {
      hasFetched.current = false;
    }
  }, [userId, dispatch]);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (loadingFetch) {
    return <div className="p-4 text-center">Loading settings…</div>;
  }

  if (fetchError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Settings error: {fetchError}</p>
        <button
          onClick={() => dispatch(fetchSettings())}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="p-4 max-w-4xl mx-auto pt-16">{children}</main>
    </div>
  );
};

export default Layout;
