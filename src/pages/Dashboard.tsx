import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../hooks';
import DashboardFilter, { type Interval } from '../components/DashboardFilter';
import {
  fetchSummary,
  fetchCategory,
  fetchTop,
  fetchTimeSeries,
} from '../store/slices/dashboardSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(s => s.auth.user);

  const settingsLoaded = useAppSelector(
    s => !!s.settings.settings && !s.settings.loadingFetch
  );
  const currency = useAppSelector(
    s => s.settings.settings?.currencyCode
  ) ?? 'USD';

  const {
    summary,
    category,
    top,
    timeseries,
    loadingSummary,
    loadingCategory,
    loadingTop,
    loadingTime,
    error,
  } = useAppSelector(s => s.dashboard);

  const [start, setStart] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0,10));
  const [n, setN] = useState(5);
  const [interval, setInterval] = useState<Interval>('day');

  const isLoading =
    loadingSummary || loadingCategory || loadingTop || loadingTime;

  const formatAmt = (v: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(v);

  const loadCharts = () => {
    const payload = { start, end };
    dispatch(fetchSummary(payload));
    dispatch(fetchCategory(payload));
    dispatch(fetchTop({ ...payload, n }));
    dispatch(fetchTimeSeries({ ...payload, interval }));
  };

  useEffect(() => {
    if (user && settingsLoaded && !summary && !isLoading && !error) {
      loadCharts();
    }
  }, [
    user,
    settingsLoaded,
    summary,
    isLoading,
    error,
    start,
    end,
    n,
    interval,
    dispatch,
  ]);

  return (
    <div className="space-y-8 p-4 bg-gray-100 dark:bg-gray-900 transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Dashboard
      </h2>

      <DashboardFilter
        start={start}
        end={end}
        n={n}
        interval={interval}
        onChangeStart={setStart}
        onChangeEnd={setEnd}
        onChangeN={setN}
        onChangeInterval={setInterval}
        onApply={loadCharts}
      />

      {error && (
        <div className="text-red-500 text-center">Error: {error}</div>
      )}

      {isLoading ? (
        <div className="p-4 text-center text-gray-700 dark:text-gray-300">
          Loading…
        </div>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Spent', value: formatAmt(summary.totalSpent) },
              { label: 'Expense Count', value: summary.expenseCount },
              { label: 'Avg. per Expense', value: formatAmt(summary.averageSpent) },
            ].map(item => (
              <div
                key={item.label}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow h-24"
              >
                <h4 className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </h4>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow h-64">
              <h3 className="mb-2 text-gray-800 dark:text-white">
                Total by Category
              </h3>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={category}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={50}
                    outerRadius={80}
                    label
                  >
                    {category.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatAmt} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow h-64">
              <h3 className="mb-2 text-gray-800 dark:text-white">
                Top {n} Transactions
              </h3>
              <ResponsiveContainer>
                <BarChart data={top} layout="vertical">
                  <XAxis type="number" tickFormatter={formatAmt} />
                  <YAxis dataKey="title" type="category" width={150} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                  <Tooltip formatter={formatAmt} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-2 p-4 bg-white dark:bg-gray-800 rounded shadow h-80">
              <h3 className="mb-2 text-gray-800 dark:text-white">
                Expenses by {interval}
              </h3>
              <ResponsiveContainer>
                <LineChart data={timeseries}>
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
      ) : null}
    </div>
  );
};

export default Dashboard;
