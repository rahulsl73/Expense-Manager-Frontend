import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface User {
  id: number;
  username: string;
  email: string;
  monthlyBudget: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: undefined,
};

export const login = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async (creds, { rejectWithValue }) => {
    try {
      const { data: auth } = await api.post<{ userId: number; email: string }>(
        '/auth/login',
        creds
      );
      localStorage.setItem('userId', String(auth.userId));

      const { data: profile } = await api.get<Omit<User,'id'>>(
        `/user/${auth.userId}/profile`
      );

      return {
        id: auth.userId,
        username: profile.username,
        email: profile.email,
        monthlyBudget: profile.monthlyBudget
      };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchProfile = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    const stored = localStorage.getItem('userId');
    if (!stored) return rejectWithValue('Not authenticated');
    const userId = Number(stored);

    try {
      const { data: profile } = await api.get<Omit<User,'id'>>(
        `/user/${userId}/profile`
      );
      return {
        id: userId,
        username: profile.username,
        email: profile.email,
        monthlyBudget: profile.monthlyBudget
      };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk<
  User,
  { email: string; monthlyBudget: number },
  { rejectValue: string }
>(
  'auth/updateProfile',
  async ({ email, monthlyBudget }, { rejectWithValue }) => {
    const stored = localStorage.getItem('userId');
    if (!stored) return rejectWithValue('Not authenticated');

    try {
      const { data } = await api.put<User>(
        `/user/${stored}/profile`,
        { email, monthlyBudget }
      );
      return data;
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = undefined;
      localStorage.removeItem('userId');
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProfile.pending, state => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, state => {
        state.loading = false;
        state.user = null;
      })

      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
