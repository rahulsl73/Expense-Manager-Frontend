import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { format, parseISO } from 'date-fns';
import { Edit3, Trash2 } from 'lucide-react';
import { useAppSelector } from '../hooks';

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  tags: string[];
  note: string | null;
}

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (!id || isNaN(Number(id))) {
      alert('Invalid expense ID');
      navigate('/expenses', { replace: true });
      return;
    }

    const fetchExpense = async () => {
      setLoading(true);
      try {
        const resp = await api.get<Expense>(
          `/user/${user.id}/expenses/${id}`
        );
        setExpense(resp.data);
      } catch (err) {
        console.error('Failed to load expense', err);
        alert('Failed to load expense');
        navigate('/expenses', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [user, id, navigate]);

  const handleDelete = async () => {
    if (!user || !expense) return;
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await api.delete(`/user/${user.id}/expenses/${expense.id}`);
      navigate('/expenses');
    }
  };

  const handleEdit = () => {
    if (expense) {
      navigate(`/expenses/${expense.id}/edit`, { state: { expense } });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-600 dark:text-gray-300">
          Loading...
        </span>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-16">
        <span className="text-gray-600 dark:text-gray-300">
          Expense not found.
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {expense.title}
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Amount">
            {new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: 'USD',
            }).format(expense.amount)}
          </Detail>
          <Detail label="Category">{expense.category}</Detail>
          <Detail label="Date">
            {format(parseISO(expense.date), 'PPP')}
          </Detail>
          <Detail label="Tags">
            {expense.tags.length ? expense.tags.join(', ') : '—'}
          </Detail>
        </div>

        {expense.note && (
          <div className="mt-4">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Note
            </span>
            <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {expense.note}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={handleEdit}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" /> Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetail;

const Detail: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <span className="font-semibold text-gray-700 dark:text-gray-300">
      {label}
    </span>
    <p className="mt-1 text-gray-900 dark:text-gray-100">{children}</p>
  </div>
);
