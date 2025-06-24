import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext'; 
import { ThemeCurrencyProvider } from './contexts/ThemeCurrencyContext';
function App() {

  return (
    <BrowserRouter>
    <AuthProvider>
      <ThemeCurrencyProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover />
     </ThemeCurrencyProvider>
    </AuthProvider>
  </BrowserRouter>
  )
}

export default App
