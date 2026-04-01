import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import type { Expense } from '../../store/types'
import type { RootState } from '../../store'  

interface ExpensesResponse {
  content: Expense[]
  number: number
  totalPages: number
}

interface FetchArgs {
  params: {
    page: number
    size: number
    start?: string
    end?: string
    category?: string
  }
}

export const fetchExpenses = createAsyncThunk<
  ExpensesResponse,
  FetchArgs,
  { state: RootState; rejectValue: string }
>(
  'expenses/fetch',
  async ({ params }, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id
    if (!userId) {
      return rejectWithValue('User not authenticated')
    }

    try {
      const { data } = await api.get<ExpensesResponse>(
        `/user/${userId}/expenses`,
        { params }
      )
      return data
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || 'Failed to fetch expenses'
      )
    }
  }
)

interface ExpensesState {
  list: Expense[]
  loading: boolean
  page: number
  totalPages: number
  error?: string
}

const initialState: ExpensesState = {
  list: [],
  loading: false,
  page: 0,
  totalPages: 1,
  error: undefined,
}

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchExpenses.pending, state => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.content
        state.page = action.payload.number
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
  },
})

export default expensesSlice.reducer
