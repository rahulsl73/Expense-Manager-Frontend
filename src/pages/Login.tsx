import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../api/api';

interface AuthResponse {
  token: string;
  userId: number;
  email: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl mb-4">Login</h1>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={Yup.object({
          username: Yup.string().required(),
          password: Yup.string().required()
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await api.post<AuthResponse>('/auth/login', values);
            const { token, userId, email } = res.data;
     
            login(token, userId, email);
            navigate('/');
          } catch (err) {
            console.error(err);
         
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block">Username</label>
              <Field name="username" className="w-full border p-2" />
              <ErrorMessage name="username" component="div" className="text-red-500" />
            </div>
            <div>
              <label className="block">Password</label>
              <Field name="password" type="password" className="w-full border p-2" />
              <ErrorMessage name="password" component="div" className="text-red-500" />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white p-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
