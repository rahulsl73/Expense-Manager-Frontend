import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [initialValues, setInitialValues] = useState<InitialValues | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/expenses/${id}`)
      .then(res => {
        const { id, title, amount, category, date, tags, note } = res.data;
        setInitialValues({ id, title, amount, category, date, tags, note });
      })
      .catch(() => alert('Failed to load expense'));
  }, [id]);

  if (!initialValues) {
    return (
      <p className="p-4 text-center text-gray-800 dark:text-gray-200 transition-colors">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
      <h2 className="text-2xl mb-4 text-gray-900 dark:text-gray-100 transition-colors">
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
