import React from 'react';

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

const InputField = ({ type, id, label, placeholder }) => (
  <div className='mb-4'>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
      {label}
    </label>
    <input
      type={type}
      id={id}
      className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
      placeholder={placeholder}
      required
    />
  </div>
);

const LoginButton = () => (
  <button
    type='submit'
    className='w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  >
    Log in
  </button>
);

const SignUpLink = () => (
  <div className='mt-6 text-center'>
    <p className='text-sm text-gray-600'>
      Don’t have an account?{' '}
      <a href='#' className='text-blue-600 font-medium hover:underline'>
        Sign up
      </a>
    </p>
  </div>
);

const LoginForm = ({ onLogin }) => {
  const handleSubmit = e => {
    e.preventDefault();
    onLogin();
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
        />
        <InputField
          type='password'
          id='password'
          label='Password'
          placeholder='Enter your password'
        />
        <LoginButton />
      </form>
      <SignUpLink />
    </div>
  );
};

export default LoginForm;
