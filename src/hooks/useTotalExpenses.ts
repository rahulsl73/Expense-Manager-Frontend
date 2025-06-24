import api from '../api/api'

export const useTotalExpenses = () => {
  const uid = Number(localStorage.getItem('userId'))
  return async (): Promise<number> => {
    const res = await api.get<{ total: number }>(
      '/expenses/stats/summary',
      { headers: { 'User-Id': String(uid) } }
    )
    return res.data.total
  }
}
