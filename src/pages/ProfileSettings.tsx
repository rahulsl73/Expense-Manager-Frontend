import React from 'react';
import { useFormik, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { UserCircle2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateProfile } from '../store/slices/authSlice';

interface FormValues {
  email: string;
  monthlyBudget: number;
}

const ProfileSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading, error } = useAppSelector(s => s.auth);

  if (authLoading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      email: user.email,
      monthlyBudget: user.monthlyBudget,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      monthlyBudget: Yup.number().min(0, 'Must be ≥ 0').required('Required'),
    }),
    onSubmit: (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
      dispatch(updateProfile(values))
        .unwrap()
        .then(() => toast.success('Profile updated!'))
        .catch(msg => toast.error(msg))
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-500 text-white">
          <UserCircle2 size={32} />
        </div>
        <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h2>
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 mt-1 text-sm">{formik.errors.email}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            Monthly Budget
          </label>
          <input
            type="number"
            name="monthlyBudget"
            value={formik.values.monthlyBudget}
            onChange={formik.handleChange}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
          />
          {formik.touched.monthlyBudget && formik.errors.monthlyBudget && (
            <p className="text-red-500 mt-1 text-sm">{formik.errors.monthlyBudget}</p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className={`px-6 py-2 rounded text-white transition-colors ${
              formik.isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
