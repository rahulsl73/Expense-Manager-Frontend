import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout as logoutAction } from '../store/slices/authSlice';
import { saveSettings } from '../store/slices/settingsSlice';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`hover:underline px-2 py-1 rounded ${
        isActive
          ? 'text-blue-600 dark:text-blue-400 font-semibold'
          : 'text-gray-600 dark:text-gray-300'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const settings = useAppSelector(state => state.settings.settings);
  const loadingSettings = useAppSelector(state => state.settings.loadingFetch);

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
    setOpen(false);
  };

  const toggleTheme = () => {
    if (!settings) return;
    dispatch(
      saveSettings({
        currencyCode: settings.currencyCode,
        theme: settings.theme === 'LIGHT' ? 'DARK' : 'LIGHT',
      })
    );
    setOpen(false);
  };

  // Always render the navbar shell
  return (
    <nav className="bg-white dark:bg-gray-800 shadow fixed w-full z-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
          ExpenseManager
        </Link>

        {user && (
          <>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-gray-800 dark:text-gray-200 focus:outline-none"
              onClick={() => setOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/expenses">Expenses</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              <NavLink to="/settings/profile">Profile</NavLink>

              {/* Theme toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                aria-label="Toggle light/dark mode"
                className="p-2 rounded focus:outline-none text-gray-600 dark:text-gray-300 transition-colors"
                disabled={loadingSettings || !settings}
              >
                {loadingSettings || !settings ? (
                  <span className="animate-pulse">…</span>
                ) : settings.theme === 'DARK' ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
              </motion.button>

              {/* Currency display */}
              <span className="px-2 py-1 border rounded text-gray-600 dark:text-gray-300 transition-colors">
                {loadingSettings || !settings
                  ? <span className="animate-pulse">…</span>
                  : settings.currencyCode}
              </span>

              {/* User greeting */}
              <span className="text-gray-600 dark:text-gray-300 transition-colors">
                Hi, {user.username}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline focus:outline-none transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile side menu */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.2 }}
                  className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white dark:bg-gray-800 shadow-lg p-6 pt-12 z-50 md:hidden transition-colors"
                >
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-gray-700 dark:text-gray-200"
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>

                  <ul className="flex flex-col gap-4">
                    <li><NavLink to="/">Dashboard</NavLink></li>
                    <li><NavLink to="/expenses">Expenses</NavLink></li>
                    <li><NavLink to="/settings">Settings</NavLink></li>
                    <li><NavLink to="/settings/profile">Profile</NavLink></li>
                    <li>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                        aria-label="Toggle light/dark mode"
                        disabled={loadingSettings || !settings}
                      >
                        {loadingSettings || !settings
                          ? <span className="animate-pulse">…</span>
                          : settings.theme === 'DARK'
                            ? <><Sun size={20} /><span>Light Mode</span></>
                            : <><Moon size={20} /><span>Dark Mode</span></>
                        }
                      </motion.button>
                    </li>
                    <li>
                      {loadingSettings || !settings ? (
                        <div className="text-sm px-2 py-1 border rounded animate-pulse">…</div>
                      ) : (
                        <div className="text-sm px-2 py-1 border rounded text-gray-600 dark:text-gray-300">
                          {settings.currencyCode}
                        </div>
                      )}
                    </li>
                    <li>
                      <div className="text-gray-600 dark:text-gray-300">Hi, {user.username}</div>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-red-500 hover:underline focus:outline-none transition-colors"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
