import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import ExpenseForm from './ExpenseForm';
import { AuthContext } from '../contexts/AuthContext';

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
  const { user } = useContext(AuthContext);
  const [initialValues, setInitialValues] = useState<InitialValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.get<InitialValues>(
      `/user/${user.id}/expenses/${id}`
    )
    .then(res => setInitialValues(res.data))
    .catch(err => {
      console.error('Failed to load expense', err);
      alert('Failed to load expense');
      navigate('/expenses');
    })
    .finally(() => setLoading(false));
  }, [user, id, navigate]);

  if (loading || !initialValues) {
    return <p className="p-4 text-center">Loading expense…</p>;
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
