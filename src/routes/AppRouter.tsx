import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

import Layout from '../components/Layout';       
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ExpenseList from '../pages/ExpenseList';
import ExpenseForm from '../pages/ExpenseForm';
import ExpenseDetail from '../pages/ExpenseDetail';
import Settings from '../pages/Settings';
import EditExpense from '../pages/EditExpense';
import ProfileSettings from '../pages/ProfileSettings';

export default function AppRouter() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* Wrap protected routes in Layout so Navbar (and Logout) shows */}
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/expenses"
            element={
              <Layout>
                <ExpenseList />
              </Layout>
            }
          />
          <Route
            path="/expenses/new"
            element={
              <Layout>
                <ExpenseForm onSuccess={() => { window.location.href = '/expenses'; }} />
              </Layout>
            }
          />
          <Route
            path="/expenses/:id"
            element={
              <Layout>
                <ExpenseDetail />
              </Layout>
            }
          />
          <Route
            path="/expenses/:id/edit"
            element={
              <Layout>
                  <EditExpense />              
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />

          <Route
            path="/settings/profile"
            element={
              <Layout>
                <ProfileSettings />
              </Layout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}
