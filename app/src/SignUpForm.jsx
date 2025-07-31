import React from 'react';

const SignUpForm = ({ onLoginClick }) => {
  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100'>
      <div className='flex flex-col items-center mb-8'>
        <div className='text-3xl font-bold flex items-center mb-2'>
          <span className='text-teal-600 mr-2'>❤️</span>
          MindfulDay
        </div>
      </div>

      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Sign Up</h1>

        <form>
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2' htmlFor='name'>
              Name
            </label>
            <input
              type='text'
              id='name'
              placeholder='Enter your name'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2' htmlFor='email'>
              Email
            </label>
            <input
              type='email'
              id='email'
              placeholder='Enter your email'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            />
          </div>

          <div className='mb-6'>
            <label
              className='block text-sm font-medium mb-2'
              htmlFor='password'
            >
              Password
            </label>
            <input
              type='password'
              id='password'
              placeholder='Create a password'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            />
          </div>

          <button className='w-full py-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'>
            Sign up
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <button
            onClick={onLoginClick}
            className='text-blue-500 hover:underline'
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
