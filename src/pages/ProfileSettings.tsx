import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import api from '../api/api';
import { toast } from 'react-toastify';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Profile {
  email: string;
  monthlyBudget: number;
}

const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const uid = user?.id;

  const [initial, setInitial] = useState<Profile>({ email: '', monthlyBudget: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    api
      .get<Profile>('/users/profile', { headers: { 'User-Id': String(uid) } })
      .then(res => setInitial({
        email:          res.data.email,
        monthlyBudget:  res.data.monthlyBudget
      }))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [uid]);

  const formik = useFormik<Profile>({
    enableReinitialize: true,
    initialValues:      initial,
    validationSchema:   Yup.object({
      email:          Yup.string().email('Invalid email').required('Required'),
      monthlyBudget:  Yup.number().min(0, 'Must be ≥ 0').required('Required'),
    }),
    onSubmit: async values => {
      if (!uid) {
        toast.error('No user logged in');
        return;
      }
      try {
        await updateProfile(values.email, values.monthlyBudget);
        toast.success('Profile updated!');
      } catch {
        toast.error('Failed to update profile');
      }
    },
  });

  if (loading) {
    return <Typography variant="body1" align="center">Loading…</Typography>;
  }

  return (
    <Paper elevation={3} className="max-w-lg mx-auto p-6">
      <Box display="flex" alignItems="center" flexDirection="column" mb={2}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
          <UserCircle2 size={48} />
        </Avatar>
        <Typography variant="h5" mt={1}>Profile Settings</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={!!(formik.touched.email && formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          type="number"
          label="Monthly Budget"
          name="monthlyBudget"
          value={formik.values.monthlyBudget}
          onChange={formik.handleChange}
          error={!!(formik.touched.monthlyBudget && formik.errors.monthlyBudget)}
          helperText={formik.touched.monthlyBudget && formik.errors.monthlyBudget}
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileSettings;
