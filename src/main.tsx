import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { store, persistor } from './store';
import { fetchProfile } from './store/slices/authSlice';
import { fetchSettings } from './store/slices/settingsSlice';
import './index.css';

async function handleBeforeLift(): Promise<void> {
  const stored = localStorage.getItem('userId');
  if (!stored) return;

  const userId = Number(stored);
  try {
    await store.dispatch(fetchProfile(userId)).unwrap();
    await store.dispatch(fetchSettings()).unwrap();
  } catch (err) {
    console.error('Bootstrap error', err);

  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<div className="p-6 text-center">Loading app…</div>}
        persistor={persistor}
        onBeforeLift={handleBeforeLift}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
