import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: displayName }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.detail || 'Error creating user');
        return;
      }

      const loginRes = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setErrorMsg('User created, but login failed.');
        return;
      }

      const { token, user_id, display_name } = await loginRes.json();

      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('display_name', display_name);

      navigate('/mood');
    } catch (err) {
      console.error(err);
      setErrorMsg('Unexpected error. Please try again.');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md mx-auto mt-20">
      <div className="text-center mb-6">
        <div className="inline-block bg-green-400 p-2 rounded-full shadow">
          <span role="img" aria-label="leaf" style={{ fontSize: '24px' }}>
            💚
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mt-2 tracking-tight">
          Create Your Account
        </h2>
      </div>

      {errorMsg && (
        <p className="text-red-600 text-center text-sm mb-4">{errorMsg}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-700">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Display Name</span>
          <input
            type="text"
            autoComplete="nickname"
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/" className="text-green-600 font-medium hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
