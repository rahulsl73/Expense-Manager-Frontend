import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/expenses/${id}`);
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
      await api.delete(`/expenses/${id}`);
      navigate('/');
    }
  };

  const handleEdit = () => {
    navigate(`/expenses/${id}/edit`, { state: { expense } });
  };

  if (loading) {
    return (
      <p className="p-4 text-center text-gray-800 dark:text-gray-200 transition-colors">
        Loading...
      </p>
    );
  }

  if (!expense) {
    return (
      <p className="p-4 text-center text-gray-800 dark:text-gray-200 transition-colors">
        Expense not found.
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md mx-auto transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 transition-colors">
        Expense Detail
      </h2>

      <p className="mb-2 text-gray-700 dark:text-gray-300">
        <strong>Title:</strong> {expense.title}
      </p>
      <p className="mb-2 text-gray-700 dark:text-gray-300">
        <strong>Amount:</strong> ${expense.amount}
      </p>
      <p className="mb-2 text-gray-700 dark:text-gray-300">
        <strong>Category:</strong> {expense.category}
      </p>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        <strong>Date:</strong> {expense.date}
      </p>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        <strong>Tags:</strong> {expense.tags.join(', ') || '—'}
      </p>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        <strong>Note:</strong> {expense.note || '—'}
      </p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handleEdit}
          className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetail;
