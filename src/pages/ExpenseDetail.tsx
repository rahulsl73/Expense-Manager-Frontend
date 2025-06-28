import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { format, parseISO } from 'date-fns';
import { Edit3, Trash2 } from 'lucide-react';

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
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Expense>(`/user/${userId}/expenses/${id}`);
        setExpense(res.data);
      } catch {
        alert('Failed to load expense');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await api.delete(`/user/${userId}/expenses/${id}`);
      navigate('/');
    }
  };

  const handleEdit = () => {
    navigate(`/expenses/${id}/edit`, { state: { expense } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-16">
        <span className="text-gray-600 dark:text-gray-300">Expense not found.</span>
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
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Amount</span>
            <p className="text-lg mt-1 text-gray-900 dark:text-gray-100">
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(expense.amount)}
            </p>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Category</span>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{expense.category}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Date</span>
            <p className="mt-1 text-gray-900 dark:text-gray-100">
              {format(parseISO(expense.date), 'PPP')}
            </p>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Tags</span>
            <p className="mt-1 text-gray-900 dark:text-gray-100">
              {expense.tags.length ? expense.tags.join(', ') : '—'}
            </p>
          </div>
        </div>
        {expense.note && (
          <div className="mt-4">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Note</span>
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
