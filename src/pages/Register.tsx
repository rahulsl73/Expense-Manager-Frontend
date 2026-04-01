import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../api/api';

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const Register: React.FC = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .matches(
        passwordRules,
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      )
      .required('Password is required'),
  });

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl mb-4">Register</h1>
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setSubmitting(true);
          try {
            await api.post('/auth/signup', values);
            navigate('/login');
          } catch (err: any) {
            const data = err.response?.data;
            if (data) {
              // data is an object mapping field -> message
              const fieldErrors: Record<string, string> = {};
              if (data.email) {
                fieldErrors.email = data.email;
              }
              if (data.username) {
                fieldErrors.username = data.username;
              }
              if (data.error && !fieldErrors.email && !fieldErrors.username) {
                fieldErrors.email = data.error;
              }
              setErrors(fieldErrors);
            } else {
              // fallback
              setErrors({ email: 'Registration failed' });
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label>Username</label>
              <Field name="username" className="w-full border p-2" />
              <ErrorMessage name="username" component="div" className="text-red-500" />
            </div>
            <div>
              <label>Email</label>
              <Field name="email" type="email" className="w-full border p-2" />
              <ErrorMessage name="email" component="div" className="text-red-500" />
            </div>
            <div>
              <label>Password</label>
              <Field name="password" type="password" className="w-full border p-2" />
              <ErrorMessage name="password" component="div" className="text-red-500" />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 text-white p-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500">Login</Link>
      </p>
    </div>
  );
};

export default Register;
