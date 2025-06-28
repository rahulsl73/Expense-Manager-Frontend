import api from '../api/api'

export const useTotalExpenses = () => {
  return async (): Promise<number> => {
    const res = await api.get<{ total: number }>(
      '/expenses/stats/summary',
    )
    return res.data.total
  }
}
