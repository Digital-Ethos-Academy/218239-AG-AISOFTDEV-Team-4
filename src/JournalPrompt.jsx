import React from 'react';

const JournalPrompt = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4'>
      <div className='text-center mb-8'>
        <div className='mb-4'>
          <svg height='50' width='50' className='inline-block'>
            <circle cx='25' cy='25' r='20' fill='#34D399' />
            <circle cx='18' cy='18' r='3' fill='#fff' />
            <circle cx='32' cy='18' r='3' fill='#fff' />
            <path
              d='M18 32 c5 5 10 5 15 0'
              stroke='#fff'
              strokeWidth='2'
              fill='none'
            />
          </svg>
        </div>
        <h1 className='text-2xl font-bold text-gray-800'>MindfulDay</h1>
      </div>
      <div className='w-full max-w-md bg-white p-8 shadow-md rounded-xl'>
        <div className='flex justify-center mb-6'>
          <svg height='100' width='100'>
            <circle cx='50' cy='50' r='45' fill='#34D399' />
            <circle cx='35' cy='35' r='5' fill='#fff' />
            <circle cx='65' cy='35' r='5' fill='#fff' />
            <path
              d='M35 65 c10 10 20 10 30 0'
              stroke='#fff'
              strokeWidth='3'
              fill='none'
            />
          </svg>
        </div>
        <h2 className='text-xl font-semibold mb-4 text-center text-gray-800'>
          What made you feel happy today?
        </h2>
        <form
          className='space-y-4'
          onSubmit={e => {
            e.preventDefault();
            const response = e.target.elements.journal.value;
            alert(`Submitted response: ${response}`);
            e.target.reset();
          }}
        >
          <textarea
            name='journal'
            className='w-full border rounded p-4 text-gray-700'
            placeholder='Enter your response'
            aria-label='User response'
            rows='3'
            required
          />
          <button
            type='submit'
            className='w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition'
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default JournalPrompt;
