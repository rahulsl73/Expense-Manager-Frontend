import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAppSelector } from '../hooks';

import Layout           from '../components/Layout';
import Login            from '../pages/Login';
import Register         from '../pages/Register';
import Dashboard        from '../pages/Dashboard';
import ExpenseList      from '../pages/ExpenseList';
import ExpenseForm      from '../pages/ExpenseForm';
import ExpenseDetail    from '../pages/ExpenseDetail';
import EditExpense      from '../pages/EditExpense';
import Settings         from '../pages/Settings';
import ProfileSettings  from '../pages/ProfileSettings';

export default function AppRouter() {
  const { user, loading: authLoading } = useAppSelector(state => state.auth);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-gray-700 dark:text-gray-300">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const ProtectedLayout: React.FC = () => (
    <Layout>
      <Outlet />
    </Layout>
  );

  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        {/* Dashboard */}
        <Route index path="/" element={<Dashboard />} />

        {/* Expenses */}
        <Route path="expenses">
          <Route index element={<ExpenseList />} />
          <Route
            path="new"
            element={<ExpenseForm onSuccess={() => window.location.href = '/expenses'} />}
          />
          <Route path=":id" element={<ExpenseDetail />} />
          <Route path=":id/edit" element={<EditExpense />} />
        </Route>

        {/* Settings */}
        <Route path="settings">
          <Route index element={<Settings />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}