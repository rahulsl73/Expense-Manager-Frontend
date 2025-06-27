import React from 'react';
import { useFormik, type FormikHelpers } from 'formik';

export interface FilterParams {
  page: number;
  size: number;
  start: string;
  end: string;
  category: string;
}

export interface FiltersProps {
  initialStart: string;
  initialEnd: string;
  initialCategory: string;
  onFilter: (params: FilterParams) => void;
}

interface FilterValues {
  start: string;
  end: string;
  category: string;
}

const Filters: React.FC<FiltersProps> = ({
  initialStart,
  initialEnd,
  initialCategory,
  onFilter,
}) => {
  const formik = useFormik<FilterValues>({
    initialValues: {
      start: initialStart,
      end: initialEnd,
      category: initialCategory,
    },
    onSubmit: (values: FilterValues, _helpers: FormikHelpers<FilterValues>) => {
      onFilter({
        page: 0,
        size: 10,
        start: values.start,
        end: values.end,
        category: values.category,
      });
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-6 transition-colors"
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">
            Start Date
          </label>
          <input
            type="date"
            name="start"
            value={formik.values.start}
            onChange={formik.handleChange}
            className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded transition-colors"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">
            End Date
          </label>
          <input
            type="date"
            name="end"
            value={formik.values.end}
            onChange={formik.handleChange}
            className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">
            Category
          </label>
          <select
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Shopping">Shopping</option>
            <option value="Rent">Rent</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4 sm:mt-0 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};

export default Filters;
