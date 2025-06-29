import React from 'react';
import AppRouter from './routes/AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => (
  <>
    <AppRouter />
    <ToastContainer position="top-right" autoClose={3000} />
  </>
);

export default App;
