import React from 'react';
import Navbar from './Navbar';


const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />
    <main className="p-4 max-w-4xl mx-auto pt-16">{children}</main>
  </div>
);

export default Layout;