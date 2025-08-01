import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
  <div className='flex items-center justify-center mb-8'>
    <div className='bg-green-400 p-2 rounded-full shadow-md'>
      <span role='img' aria-label='logo' style={{ fontSize: '24px' }}>
        💚
      </span>
    </div>
    <h1 className='text-3xl font-bold text-gray-800 ml-3 tracking-tight'>MindfulDay</h1>
  </div>
);

const InputField = ({ type, id, label, placeholder, value, onChange }) => (
  <div className='mb-5'>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition'
      placeholder={placeholder}
      required
    />
  </div>
);

const LoginButton = ({ loading }) => (
  <button
    type='submit'
    disabled={loading}
    className={`w-full py-2 text-white font-semibold rounded-lg transition ${
      loading
        ? 'bg-green-300 cursor-not-allowed'
        : 'bg-green-500 hover:bg-green-600'
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

      navigate('/mood');
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md mx-auto mt-20'>
      <Logo />
      <h2 className='text-xl font-semibold text-center text-gray-700 mb-6'>
        Welcome back! Please log in.
      </h2>
      <form onSubmit={handleSubmit}>
        <InputField
          type='email'
          id='email'
          label='Email'
          placeholder='you@example.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type='password'
          id='password'
          label='Password'
          placeholder='••••••••'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoginButton loading={loading} />
      </form>
      <p className='mt-6 text-sm text-center text-gray-600'>
        Don’t have an account?{' '}
        <button
          onClick={() => navigate('/signup')}
          className='text-green-600 font-medium hover:underline'
        >
          Sign up here
        </button>
      </p>
    </div>
  );
};

export default LoginForm;

