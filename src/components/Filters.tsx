import React from 'react';
import { useFormik, type FormikHelpers } from 'formik';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Paper } from '@mui/material';

export interface FiltersProps {
  onFilter: (params: {
    page: number;
    size: number;
    start?: string;
    end?: string;
    category?: string;
  }) => void;
}

interface FilterValues {
  start: string;
  end: string;
  category: string;
}

const Filters: React.FC<FiltersProps> = ({ onFilter }) => {
  const formik = useFormik<FilterValues>({
    initialValues: { start: '', end: '', category: '' },
    onSubmit: (values: FilterValues, _helpers: FormikHelpers<FilterValues>): void => {
      onFilter({ page: 0, size: 10, ...values });
    },
  });

  return (
    <Paper
      elevation={2}
      className="p-4 mb-6 bg-white dark:bg-gray-800 transition-colors"
    >
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
          <TextField
            label="Start Date"
            type="date"
            name="start"
            value={formik.values.start}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          />

          <TextField
            label="End Date"
            type="date"
            name="end"
            value={formik.values.end}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          />

          <FormControl sx={{ minWidth: 140 }} className="bg-gray-50 dark:bg-gray-700 transition-colors">
            <InputLabel className="text-gray-700 dark:text-gray-300 transition-colors">Category</InputLabel>
            <Select
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              label="Category"
              className="text-gray-900 dark:text-gray-100 transition-colors"
            >
              <MenuItem value="">All Categories</MenuItem>
              {/* TODO: Map actual categories here */}
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Transport">Transport</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Shopping">Shopping</MenuItem>
              <MenuItem value="Rent">Rent</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Apply Filters
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default Filters;
