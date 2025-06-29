import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import api from '../api/api';
import ExpenseForm from './ExpenseForm';

interface InitialValues {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  tags: string[];
  note: string | null;
}

const EditExpense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);

  const [initialValues, setInitialValues] = useState<InitialValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id || isNaN(Number(id))) {
      setError('Invalid expense ID');
      setLoading(false);
      return;
    }

    const expenseId = Number(id);

    const load = async () => {
      setLoading(true);
      try {
        const resp = await api.get<InitialValues>(
          `/user/${user.id}/expenses/${expenseId}`
        );
        setInitialValues(resp.data);
      } catch (err: any) {
        console.error('Failed to load expense', err);
        setError(err.response?.data?.message || 'Failed to load expense');
        setTimeout(() => {
          navigate('/expenses');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, id, navigate]);

  if (loading) {
    return <p className="p-4 text-center">Loading expense…</p>;
  }

  if (error) {
    return (
      <p className="p-4 text-center text-red-500">
        {error}. Redirecting...
      </p>
    );
  }

  if (!initialValues) {
    return null; 
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
      <h2 className="text-2xl mb-4 text-gray-900 dark:text-gray-100">
        Edit Expense
      </h2>
      <ExpenseForm
        initialValues={initialValues}
        onSuccess={() => navigate('/expenses')}
      />
    </div>
  );
};

export default EditExpense;
