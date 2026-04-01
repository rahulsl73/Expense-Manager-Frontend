import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import type {
  Summary,
  CategoryData,
  TopTx,
  LineData,
  Interval,
} from '../../store/types'
import type { RootState } from '../index.ts'

export const fetchSummary = createAsyncThunk<
  Summary,
  { start: string; end: string },
  { state: RootState; rejectValue: string }
>(
  'dashboard/fetchSummary',
  async ({ start, end }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id
    if (!userId) return rejectWithValue('User not authenticated')
    try {
      const { data } = await api.get<Summary>(
        `/user/${userId}/expenses/stats/summary`,
        { params: { start, end } }
      )
      return data
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch summary')
    }
  }
)

export const fetchCategory = createAsyncThunk<
  CategoryData[],
  { start: string; end: string },
  { state: RootState; rejectValue: string }
>(
  'dashboard/fetchCategory',
  async ({ start, end }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id
    if (!userId) return rejectWithValue('User not authenticated')
    try {
      const { data } = await api.get<Record<string, number>>(
        `/user/${userId}/expenses/stats/category`,
        { params: { start, end } }
      )
      return Object.entries(data).map(([category, value]) => ({ category, value }))
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch category data')
    }
  }
)

export const fetchTop = createAsyncThunk<
  TopTx[],
  { start: string; end: string; n: number },
  { state: RootState; rejectValue: string }
>(
  'dashboard/fetchTop',
  async ({ start, end, n }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id
    if (!userId) return rejectWithValue('User not authenticated')
    try {
      const { data } = await api.get<{ title: string; amount: number }[]>(
        `/user/${userId}/expenses/stats/top`,
        { params: { start, end, n } }
      )
      return data.map(tx => ({ title: tx.title, amount: tx.amount }))
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch top transactions')
    }
  }
)

export const fetchTimeSeries = createAsyncThunk<
  LineData[],
  { start: string; end: string; interval: Interval },
  { state: RootState; rejectValue: string }
>(
  'dashboard/fetchTimeSeries',
  async ({ start, end, interval }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id
    if (!userId) return rejectWithValue('User not authenticated')
    try {
      const { data } = await api.get<{ date: string; total: number }[]>(
        `/user/${userId}/expenses/stats/timeseries`,
        { params: { start, end, interval } }
      )
      return data.map(pt => ({ period: pt.date, amount: pt.total }))
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch time series')
    }
  }
)

interface DashboardState {
  summary: Summary | null
  category: CategoryData[]
  top: TopTx[]
  timeseries: LineData[]

  loadingSummary: boolean
  loadingCategory: boolean
  loadingTop: boolean
  loadingTime: boolean

  error?: string
}

const initialState: DashboardState = {
  summary: null,
  category: [],
  top: [],
  timeseries: [],
  loadingSummary: false,
  loadingCategory: false,
  loadingTop: false,
  loadingTime: false,
  error: undefined,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Summary
      .addCase(fetchSummary.pending, state => {
        state.loadingSummary = true
        state.error = undefined
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loadingSummary = false
        state.summary = action.payload
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loadingSummary = false
        state.error = action.payload
      })

      // Category
      .addCase(fetchCategory.pending, state => {
        state.loadingCategory = true
        state.error = undefined
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loadingCategory = false
        state.category = action.payload
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loadingCategory = false
        state.error = action.payload
      })

      // Top
      .addCase(fetchTop.pending, state => {
        state.loadingTop = true
        state.error = undefined
      })
      .addCase(fetchTop.fulfilled, (state, action) => {
        state.loadingTop = false
        state.top = action.payload
      })
      .addCase(fetchTop.rejected, (state, action) => {
        state.loadingTop = false
        state.error = action.payload
      })

      // Time Series
      .addCase(fetchTimeSeries.pending, state => {
        state.loadingTime = true
        state.error = undefined
      })
      .addCase(fetchTimeSeries.fulfilled, (state, action) => {
        state.loadingTime = false
        state.timeseries = action.payload
      })
      .addCase(fetchTimeSeries.rejected, (state, action) => {
        state.loadingTime = false
        state.error = action.payload
      })
  },
})

export default dashboardSlice.reducer
