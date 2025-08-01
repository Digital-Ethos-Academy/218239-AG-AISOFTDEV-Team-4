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
      // Step 1: Create user
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

      // Step 2: Login after signup
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

      // Step 3: Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('display_name', display_name);

      // Step 4: Redirect to mood page
      navigate('/mood');
    } catch (err) {
      console.error(err);
      setErrorMsg('Unexpected error. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-3">
          <span className="text-sm">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="w-full p-2 border rounded mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm">Display Name</span>
          <input
            type="text"
            autoComplete="nickname"
            className="w-full p-2 border rounded mt-1"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full p-2 border rounded mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Create Account
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
