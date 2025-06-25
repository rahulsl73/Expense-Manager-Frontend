import React, { useContext, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import api from '../api/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';

interface ExpenseFormProps {
  onSuccess: () => void;
  initialValues?: {
    id?: number;
    title: string;
    amount: number;
    category: string;
    date: string;
    tags: string[];
    note: string | null;
  };
}

interface FormValues {
  title: string;
  amount: number;
  category: string;
  date: string;
  tags: string;
  note: string;
}

interface SummaryResponse {
  totalSpent: number;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, initialValues }) => {
  const isEdit = Boolean(initialValues?.id);
  const { user } = useContext(AuthContext);
  const [remaining, setRemaining] = useState<number>(0);
  const [loadingRem, setLoadingRem] = useState<boolean>(true);

  
  const getCurrentMonthRange = (): { start: string; end: string } => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return { start: `${year}-${month}-01`, end: `${year}-${month}-${day}` };
  };

  
  const fetchRemaining = async () => {
    if (!user) return;
    setLoadingRem(true);
    try {
      const { start, end } = getCurrentMonthRange();
      const res = await api.get<SummaryResponse>('/expenses/stats/summary', {
        headers: { 'User-Id': String(user.id) },
        params: { start, end },
      });
      setRemaining(user.monthlyBudget - res.data.totalSpent);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoadingRem(false);
    }
  };

  useEffect(() => {
    fetchRemaining();
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 shadow rounded transition-colors">
      <h2 className="text-xl mb-4 text-gray-900 dark:text-gray-100 transition-colors">
        {isEdit ? 'Edit Expense' : 'Add Expense'}
      </h2>

      <Formik<FormValues>
        initialValues={
          initialValues
            ? {
                title: initialValues.title,
                amount: initialValues.amount,
                category: initialValues.category,
                date: initialValues.date,
                tags: initialValues.tags.join(','),
                note: initialValues.note ?? '',
              }
            : { title: '', amount: 0, category: '', date: '', tags: '', note: '' }
        }
        validationSchema={Yup.object({
          title: Yup.string().required('Required'),
          amount: Yup.number().required('Required').positive('Must be positive'),
          category: Yup.string().required('Required'),
          date: Yup.string().required('Required'),
        })}
        onSubmit={async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
          setSubmitting(true);
          if (!user) {
            toast.error('No user logged in');
            setSubmitting(false);
            return;
          }

          if (!isEdit && remaining <= 0) {
            toast.error('Your budget is exhausted for this month.');
            setSubmitting(false);
            return;
          }

          if (!isEdit && values.amount > remaining) {
            toast.error(
              `Amount exceeds remaining budget of ${remaining.toFixed(2)}`
            );
            setSubmitting(false);
            return;
          }


          const payload = {
            title: values.title,
            amount: values.amount,
            category: values.category,
            date: values.date,
            tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
            note: values.note.trim() || null,
            user: { id: user.id },
          };

          try {
            const headers = { 'User-Id': String(user.id) };
            if (isEdit) {
              await api.put(`/expenses/${initialValues!.id}`, payload, { headers });
              toast.success('Expense updated!');
            } else {
              await api.post('/expenses', payload, { headers });
              toast.success('Expense added!');
            }
            await fetchRemaining();
            onSuccess();
          } catch (err) {
            console.error(err);
            toast.error(`Failed to ${isEdit ? 'update' : 'add'} expense.`);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {[
              { name: 'title', label: 'Title', type: 'text' },
              { name: 'amount', label: 'Amount', type: 'number' },
              { name: 'category', label: 'Category', type: 'select' },
              { name: 'date', label: 'Date', type: 'date' },
            ].map(field => (
              <div key={field.name}>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <Field name={field.name} as="select" className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Rent">Rent</option>
                    <option value="Other">Other</option>
                  </Field>
                ) : (
                  <Field name={field.name} type={field.type} className="w-full p-2 border rounded" />
                )}
                <ErrorMessage name={field.name} component="div" className="text-red-500 mt-1" />
              </div>
            ))}

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Tags (comma separated)
              </label>
              <Field name="tags" type="text" className="w-full p-2 border rounded" />
              <ErrorMessage name="tags" component="div" className="text-red-500 mt-1" />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Note
              </label>
              <Field name="note" as="textarea" className="w-full p-2 border rounded" rows={3} />
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                loadingRem || 
                (!isEdit && remaining <= 0)      
              }
              className={`w-full p-2 text-white rounded ${
                isSubmitting || loadingRem || (!isEdit && remaining <= 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {!isEdit && remaining <= 0
                ? 'Budget exhausted'
                : isEdit
                  ? 'Update'
                  : 'Add'}
            </button>


            {!isEdit && remaining > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remaining budget: {remaining.toFixed(2)}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ExpenseForm;
