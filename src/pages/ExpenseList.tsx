import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import Filters, { type FilterParams } from '../components/Filters';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { ThemeCurrencyContext } from '../contexts/ThemeCurrencyContext';
import { DownloadIcon } from 'lucide-react';
import { format, parseISO, formatISO } from 'date-fns';

interface Expense {
  id: number;
  title: string;
  amount: number; 
  category: string;
  date: string;
  tags: string[];
  note: string | null;
}

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterParams>({
    page: 0,
    size: 10,
    start: '',
    end: '',
    category: '',
  });

  const navigate = useNavigate();
  const { currencyCode, convert } = useContext(ThemeCurrencyContext);

  const now = new Date();
  const defaultStart = formatISO(new Date(now.getFullYear(), now.getMonth(), 1), { representation: 'date' });
  const defaultEnd = formatISO(now, { representation: 'date' });

  const fetchExpenses = async (p: FilterParams) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/user/${userId}/expenses`, {
        params: { page: p.page, size: p.size, start: p.start, end: p.end, category: p.category },
      });
      setExpenses(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init: FilterParams = {
      page: 0,
      size: 10,
      start: defaultStart,
      end: defaultEnd,
      category: '',
    };
    setFilters(init);
    fetchExpenses(init);
  }, [defaultStart, defaultEnd]);

  const handleFilter = (vals: FilterParams) => {
    const next = { ...vals, page: 0, size: 10 };
    setFilters(next);
    fetchExpenses(next);
  };

  const downloadCsv = async () => {
    try {
      const params = {
        start: filters.start || defaultStart,
        end: filters.end || defaultEnd,
        category: filters.category,
      };
      const userId= localStorage.getItem("userId");
      const resp = await api.get<Blob>(`/user/${userId}/expenses/export`, {
        params,
        responseType: 'blob',
      });
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${params.start}_${params.end}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV:', err);
    }
  };

  return (
    <div className="p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
          Expenses
        </h1>
        <button
          onClick={() => navigate('/expenses/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition-colors"
        >
          Add Expense
        </button>
      </header>

      <Filters
        initialStart={defaultStart}
        initialEnd={defaultEnd}
        initialCategory=""
        onFilter={handleFilter}
      />

      <section className="flex justify-between items-center bg-white dark:bg-gray-800 rounded shadow p-4 mb-6 transition-colors">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Export CSV
        </h2>
        <button
          onClick={downloadCsv}
          title="Download CSV"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <DownloadIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
        </button>
      </section>

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
          {expenses.map((e) => {
            const converted = convert(e.amount);
            return (
              <div
                key={e.id}
                onClick={() => navigate(`/expenses/${e.id}`)}
                className="bg-white dark:bg-gray-800 rounded shadow p-5 cursor-pointer hover:shadow-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {e.title}
                  </h3>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(converted)}
                  </span>
                </div>
                <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 gap-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded transition-colors">
                    {e.category}
                  </span>
                  <span>{format(parseISO(e.date), 'PPP')}</span>
                </div>
                {e.tags.length > 0 && (
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <strong>Tags:</strong> {e.tags.join(', ')}
                  </p>
                )}
                {e.note && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">
                    {e.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            const next = { ...filters, page: p, size: 10 };
            setFilters(next);
            fetchExpenses(next);
          }}
        />
      </div>
    </div>
  );
};

export default ExpenseList;