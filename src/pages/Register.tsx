import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../api/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl mb-4">Register</h1>
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        validationSchema={Yup.object({ username: Yup.string().min(3).required(), email: Yup.string().email().required(), password: Yup.string().min(6).required() })}
        onSubmit={async (values) => {
          await api.post('/auth/signup', values);
          navigate('/login');
        }}
      >
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
          <button type="submit" className="w-full bg-green-500 text-white p-2">Register</button>
        </Form>
      </Formik>
      <p className="mt-4">
        Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
      </p>
    </div>
  );
};
export default Register;