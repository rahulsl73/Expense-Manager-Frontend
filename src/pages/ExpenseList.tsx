import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadIcon } from 'lucide-react';
import { format, parseISO, formatISO } from 'date-fns';
import Filters, { type FilterParams } from '../components/Filters';
import Pagination from '../components/Pagination';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import api from '../api/api';

const ExpenseList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { list: expenses, loading, page, totalPages } = useAppSelector(s => s.expenses);
  const user = useAppSelector(s => s.auth.user);
  const settings = useAppSelector(s => s.settings.settings);
  const loadingSettings = useAppSelector(s => s.settings.loadingFetch);
  const currencyCode = settings?.currencyCode ?? 'USD';

  const now = new Date();
  const defaultStart = formatISO(new Date(now.getFullYear(), now.getMonth(), 1), { representation: 'date' });
  const defaultEnd = formatISO(now, { representation: 'date' });

  const [filters, setFilters] = useState<FilterParams>({
    page: 0, size: 10, start: defaultStart, end: defaultEnd, category: '',
  });

  useEffect(() => {
    if (!user || !settings || loadingSettings) return;

    dispatch(fetchExpenses({ params: filters }));
  }, [dispatch, filters, user, settings, loadingSettings]);

  const handleFilter = (vals: FilterParams) => {
    setFilters({ ...vals, page: 0, size: 10 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(f => ({ ...f, page: newPage }));
  };

  const downloadCsv = async () => {
    if (!user) {
      alert('Please log in to download CSV');
      return;
    }

    try {
      const { start, end, category } = filters;
      const resp = await api.get<Blob>(
        `/user/${user.id}/expenses/export`,
        { params: { start, end, category }, responseType: 'blob' }
      );
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${start}_${end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV:', err);
      alert('CSV download failed.');
    }
  };

  const formatAmt = (amt: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amt);

  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">Expenses</h1>
        <button
          onClick={() => navigate('/expenses/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition-colors"
        >
          Add Expense
        </button>
      </header>

      {/* Filters */}
      <Filters
        initialStart={defaultStart}
        initialEnd={defaultEnd}
        initialCategory=""
        onFilter={handleFilter}
      />

      {/* CSV Export */}
      <section className="flex justify-between items-center bg-white dark:bg-gray-800 rounded shadow p-4 mb-6 transition-colors">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Export CSV</h2>
        <button
          onClick={downloadCsv}
          title="Download CSV"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <DownloadIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
        </button>
      </section>

      {/* Expense List */}
      {loading ? (
        <div className="text-center py-20">
          <span className="text-gray-600 dark:text-gray-300">Loading expenses...</span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-gray-600 dark:text-gray-300">No expenses found.</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {expenses.map(e => (
            <div
              key={e.id}
              onClick={() => navigate(`/expenses/${e.id}`)}
              className="bg-white dark:bg-gray-800 rounded shadow p-5 cursor-pointer hover:shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{e.title}</h3>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatAmt(e.amount)}
                </span>
              </div>
              <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 gap-4">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded transition-colors">{e.category}</span>
                <span>{format(parseISO(e.date), 'PPP')}</span>
              </div>
              {e.tags.length > 0 && (
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  <strong>Tags:</strong> {e.tags.join(', ')}
                </p>
              )}
              {e.note && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">{e.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ExpenseList;
