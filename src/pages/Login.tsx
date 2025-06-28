import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl mb-4">Login</h1>

      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={Yup.object({
          username: Yup.string().required('Username is required'),
          password: Yup.string().required('Password is required'),
        })}
        onSubmit={async (
          values,
          { setSubmitting, setFieldError }
        ) => {
          setSubmitting(true);
          try {
            await login(values.username, values.password);
            navigate('/');
          } catch (err: any) {
            setFieldError(
              'username',
              err.response?.status === 401
                ? 'Invalid username or password'
                : 'Login failed'
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block mb-1">Username</label>
              <Field
                name="username"
                placeholder="Enter your username"
                className="w-full border p-2 rounded"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-500 mt-1"
              />
            </div>

            <div>
              <label className="block mb-1">Password</label>
              <Field
                name="password"
                type="password"
                placeholder="Enter your password"
                className="w-full border p-2 rounded"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full p-2 rounded text-white ${
                isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>

      <p className="mt-4 text-center">
        Don’t have an account?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
