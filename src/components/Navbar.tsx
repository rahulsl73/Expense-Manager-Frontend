import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeCurrencyContext } from '../contexts/ThemeCurrencyContext';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { currencyCode, theme, updateSettings } = useContext(ThemeCurrencyContext);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const toggleTheme = async () => {
    await updateSettings({
      currencyCode,
      theme: theme === 'DARK' ? 'LIGHT' : 'DARK',
    });
    setOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow fixed w-full z-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 dark:text-white transition-colors"
        >
          ExpenseManager
        </Link>

        {user && (
          <>
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
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                aria-label="Toggle light/dark mode"
                className="p-2 rounded focus:outline-none text-gray-600 dark:text-gray-300 transition-colors"
              >
                {theme === 'DARK' ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              <span className="px-2 py-1 border rounded text-gray-600 dark:text-gray-300 transition-colors">
                {currencyCode}
              </span>

              <span className="text-gray-600 dark:text-gray-300 transition-colors">
                Hi, {user.username}
              </span>

              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline focus:outline-none transition-colors"
              >
                Logout
              </button>
            </div>

            
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.2 }}
                  className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white dark:bg-gray-800 shadow-lg p-6 pt-12 z-50 md:hidden transition-colors"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-gray-700 dark:text-gray-200"
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>

                  <ul className="flex flex-col gap-4">
                    <li>
                      <NavLink to="/">Dashboard</NavLink>
                    </li>
                    <li>
                      <NavLink to="/expenses">Expenses</NavLink>
                    </li>
                    <li>
                      <NavLink to="/settings">Settings</NavLink>
                    </li>
                    <li>
                      <NavLink to="/settings/profile">Profile</NavLink>
                    </li>
                    <li>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                        aria-label="Toggle light/dark mode"
                      >
                        {theme === 'DARK' ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{theme === 'DARK' ? 'Light Mode' : 'Dark Mode'}</span>
                      </motion.button>
                    </li>
                    <li>
                      <div className="text-sm px-2 py-1 border rounded text-gray-600 dark:text-gray-300">
                        {currencyCode}
                      </div>
                    </li>
                    <li>
                      <div className="text-gray-600 dark:text-gray-300">Hi, {user.username}</div>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-red-500 hover:underline focus:outline-none"
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
