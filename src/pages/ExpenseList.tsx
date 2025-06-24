import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { ThemeCurrencyContext } from '../contexts/ThemeCurrencyContext';
import { Box, Typography, Button, Card, CardContent, IconButton, Paper, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  tags: string[];
  note: string | null; 
}

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const navigate = useNavigate();
  const { currencyCode } = useContext(ThemeCurrencyContext);

  const fetchExpenses = async ({ page, size, start, end, category }: any) => {
    const res = await api.get('/expenses', { params: { page, size, start, end, category } });
    setExpenses(res.data.content);
    setTotalPages(res.data.totalPages);
    setPage(res.data.number);
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchExpenses({ page: 0, size: 10, start: '1900-01-01', end: today, category: '' });
  }, []);

  const handleFilter = (vals: any) => {
    setFilters(vals);
    fetchExpenses({ page: 0, size: 10, ...vals });
  };

  const downloadCsv = async () => {
    try {
      const params = {
        start: filters.start ?? '1900-01-01',
        end:   filters.end   ?? new Date().toISOString().split('T')[0],
        category: filters.category ?? ''
      };

      const resp = await api.get<Blob>('/expenses/export', {
        params,
        responseType: 'blob'
      });

      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${params.start}_${params.end}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error('Failed to download CSV:', e);
    }
};


  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" className="text-2xl text-gray-900 dark:text-gray-100 transition-colors" >Expenses</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/expenses/new')}>
          Add Expense
        </Button>
      </Box>

      <Filters onFilter={handleFilter} />

      <Paper elevation={1} sx={{ p: 1, mb: 2 }}>
         <Typography variant="h4" className="text-2xl text-gray-900  transition-colors" >Export CSV</Typography>
        <Box display="flex" justifyContent="flex-end">
          
          <IconButton onClick={downloadCsv} title="Download CSV">
            <DownloadIcon />
          </IconButton>
        </Box>
      </Paper>

      <Stack spacing={2}>
        {expenses.map((e) => (
          <Card
            key={e.id}
            onClick={() => navigate(`/expenses/${e.id}`)}
            sx={{ cursor: 'pointer' }}
          >
            <CardContent>
              <Typography variant="h6">{e.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {e.category} • {e.date}
              </Typography>
              <Typography variant="body2">
                <strong>Tags:</strong> {e.tags.join(', ') || '—'}
              </Typography>
              <Typography variant="body2">
                <strong>Note:</strong> {e.note || '—'}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: currencyCode,
                }).format(e.amount)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box mt={4}>
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => fetchExpenses({ ...filters, page: p, size: 10 })} />
      </Box>
    </Box>
  );
};

export default ExpenseList;