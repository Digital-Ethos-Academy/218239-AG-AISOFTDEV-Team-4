import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
  <div className='flex items-center mb-8'>
    <div className='bg-teal-500 p-2 rounded-full'>
      <span role='img' aria-label='logo' style={{ fontSize: '24px' }}>
        💚
      </span>
    </div>
    <h1 className='text-3xl font-bold text-gray-800 ml-2'>MindfulDay</h1>
  </div>
);

const InputField = ({ type, id, label, placeholder, value, onChange }) => (
  <div className='mb-4'>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
      placeholder={placeholder}
      required
    />
  </div>
);

const LoginButton = ({ loading }) => (
  <button
    type='submit'
    disabled={loading}
    className={`w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition ${
      loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
    }`}
  >
    {loading ? 'Logging in...' : 'Log in'}
  </button>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('display_name', data.display_name);
      localStorage.setItem('user_id', data.user_id);

      navigate('/mood'); // go to mood page on success
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
      <Logo />
      <h2 className='text-2xl font-bold text-center mb-6'>Login</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          type='email'
          id='email'
          label='Email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type='password'
          id='password'
          label='Password'
          placeholder='Enter your password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoginButton loading={loading} />
      </form>
      <p className='mt-6 text-center text-sm text-gray-600'>
        Don’t have an account?{' '}
        <button
          onClick={() => navigate('/signup')}
          className='text-blue-600 font-medium hover:underline'
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
