import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from './slices/authSlice'
import settingsReducer from './slices/settingsSlice'
import expensesReducer from './slices/expensesSlice'
import dashboardReducer from './slices/dashboardSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  expenses: expensesReducer,
  dashboard: dashboardReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'], 
}

const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})


export const persistor = persistStore(store)


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
