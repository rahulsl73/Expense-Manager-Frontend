import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import type { RootState } from '../../store';

export interface Settings {
  currencyCode: string;
  theme: 'LIGHT' | 'DARK';
}

interface SettingsState {
  settings: Settings | null;
  loadingFetch: boolean;
  loadingSave: boolean;
  error?: string;
  currencies: string[];
}

const initialState: SettingsState = {
  settings: null,
  loadingFetch: false,
  loadingSave: false,
  error: undefined,
  currencies: ['USD','EUR','GBP','INR','JPY','CAD','AUD'],
};

export const fetchSettings = createAsyncThunk<
  Settings, void, { state: RootState; rejectValue: string }
>(
  'settings/fetch',
  async (_, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return rejectWithValue('User not authenticated');
    const { data } = await api.get<Settings>(`/user/${userId}/settings`);
    return data;
  }
);

export const saveSettings = createAsyncThunk<
  Settings, Settings, { state: RootState; rejectValue: string }
>(
  'settings/save',
  async (newSettings, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return rejectWithValue('User not authenticated');
    const { data } = await api.put<Settings>(`/user/${userId}/settings`, newSettings);
    return data;
  }
);

export const convertExpenses = createAsyncThunk<
  void, { from: string; to: string }, { state: RootState; rejectValue: string }
>(
  'settings/convertExpenses',
  async ({ from, to }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return rejectWithValue('User not authenticated');
    await api.put(`/user/${userId}/expenses/convert`, { fromCurrency: from, toCurrency: to });
  }
);

const slice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchSettings.pending, state => {
      state.loadingFetch = true;
      state.error = undefined;
    });
    builder.addCase(fetchSettings.fulfilled, (state, { payload }) => {
      state.loadingFetch = false;
      state.settings = payload;
    });
    builder.addCase(fetchSettings.rejected, (state, { payload, error }) => {
      state.loadingFetch = false;
      state.error = payload || error.message;
    });

    builder.addCase(saveSettings.pending, state => {
      state.loadingSave = true;
      state.error = undefined;
    });
    builder.addCase(saveSettings.fulfilled, (state, { payload }) => {
      state.loadingSave = false;
      state.settings = payload;
    });
    builder.addCase(saveSettings.rejected, (state, { payload, error }) => {
      state.loadingSave = false;
      state.error = payload || error.message;
    });

    builder.addCase(convertExpenses.pending, state => {
      state.loadingSave = true;
      state.error = undefined;
    });
    builder.addCase(convertExpenses.fulfilled, state => {
      state.loadingSave = false;
    });
    builder.addCase(convertExpenses.rejected, (state, { payload, error }) => {
      state.loadingSave = false;
      state.error = payload || error.message;
    });
  }
});

export default slice.reducer;
