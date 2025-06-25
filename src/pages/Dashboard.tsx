import React, { useEffect, useState, useContext } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/api';
import { ThemeCurrencyContext } from '../contexts/ThemeCurrencyContext';
import DashboardFilter, { type Interval } from '../components/DashboardFilter';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface CategoryData { category: string; value: number }
interface TopTx { title: string; amount: number }
interface LineData { period: string; amount: number }
interface Summary { totalSpent: number; expenseCount: number; averageSpent: number }

const Dashboard: React.FC = () => {
  const { currencyCode, loading } = useContext(ThemeCurrencyContext);
  const userId = Number(localStorage.getItem('userId'));

  const [start, setStart] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [n, setN] = useState<number>(5);
  const [interval, setInterval] = useState<Interval>('day');

  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topTransactions, setTopTransactions] = useState<TopTx[]>([]);
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [chartsLoaded, setChartsLoaded] = useState(false);

  const formatAmt = (v: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(v);

  const fetchCharts = async () => {
    setChartsLoaded(false);
    try {
      const headers = { 'User-Id': String(userId) };
      const params = { start, end, n, interval };

      const [sumRes, catRes, topRes, lineRes] = await Promise.all([
        api.get<Summary>('/expenses/stats/summary', { headers, params }),
        api.get<Record<string, number>>('/expenses/stats/category', { headers, params }),
        api.get<any[]>('/expenses/stats/top', { headers, params }),
        api.get<any[]>('/expenses/stats/timeseries', { headers, params }),
      ]);

      setSummary(sumRes.data);
      setCategoryData(Object.entries(catRes.data).map(([category, value]) => ({ category, value })));
      setTopTransactions(topRes.data.map(tx => ({ title: tx.title, amount: tx.amount })));
      setLineData(lineRes.data.map(pt => ({ period: pt.date, amount: pt.total })));
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartsLoaded(true);
    }
  };

  useEffect(() => {
    if (!loading) fetchCharts();
  }, [loading]);

  return (
    <div className="space-y-8 p-4 bg-gray-100 dark:bg-gray-900 transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">Dashboard</h2>

      {/* Filters */}
      <DashboardFilter
        start={start}
        end={end}
        n={n}
        interval={interval}
        onChangeStart={setStart}
        onChangeEnd={setEnd}
        onChangeN={setN}
        onChangeInterval={setInterval}
        onApply={fetchCharts}
      />

      {/* Loading state */}
      {(loading || !chartsLoaded) ? (
        <div className="p-4 text-center text-gray-700 dark:text-gray-300 transition-colors">Loading…</div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Spent', value: formatAmt(summary.totalSpent) },
                { label: 'Expense Count', value: summary.expenseCount },
                { label: 'Avg. per Expense', value: formatAmt(summary.averageSpent) },
              ].map(item => (
                <div key={item.label} className="p-4 bg-white dark:bg-gray-800 rounded shadow h-24 transition-colors">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{item.label}</h4>
                  <p className="text-xl font-bold text-gray-800 dark:text-white transition-colors">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Donut Chart */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow h-64 transition-colors">
              <h3 className="mb-2 text-gray-800 dark:text-white transition-colors">Total Expenses By Category</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={50}
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatAmt} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow h-64 transition-colors">
              <h3 className="mb-2 text-gray-800 dark:text-white transition-colors">Top {n} Transactions</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTransactions} layout="vertical">
                  <XAxis type="number" tickFormatter={formatAmt} />
                  <YAxis dataKey="title" type="category" width={150} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                  <Tooltip formatter={formatAmt} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="md:col-span-2 p-4 bg-white dark:bg-gray-800 rounded shadow h-80 transition-colors">
              <h3 className="mb-2 text-gray-800 dark:text-white transition-colors">Total Expenses by {interval.charAt(0).toUpperCase() + interval.slice(1)}</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={formatAmt} />
                  <Tooltip formatter={formatAmt} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
