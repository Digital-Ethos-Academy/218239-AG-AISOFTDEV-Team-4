import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const moodEmojiMap = {
  very_sad: '😢',
  sad: '😟',
  neutral: '😐',
  happy: '😊',
  very_happy: '😁',
};

const JournalPrompt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { promptId, promptText, mood } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = e.target.elements.journal.value;
    const token = localStorage.getItem('token');

    try {
      // Submit journal
      const res = await fetch('http://localhost:8000/journal/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt_id: promptId,
          entry_date: new Date().toISOString().split('T')[0],
          content,
        }),
      });

      if (!res.ok) throw new Error('Failed to save journal');
      const saved = await res.json();

      // Fetch AI feedback
      const feedbackRes = await fetch('http://localhost:8000/journal/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const feedbackData = await feedbackRes.json();

      // Store feedback in localStorage by journal ID
      const feedbackMap = JSON.parse(localStorage.getItem('journal_feedback') || '{}');
      feedbackMap[saved.id] = feedbackData.feedback;
      localStorage.setItem('journal_feedback', JSON.stringify(feedbackMap));

      e.target.reset();
      navigate('/mood');
    } catch (err) {
      console.error('Journal error:', err);
      alert('Failed to submit journal entry');
    }
  };


  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-800'>MindfulDay</h1>
        {mood && (
          <div className='text-4xl mt-2' aria-label={`Mood: ${mood}`}>
            {moodEmojiMap[mood]}
          </div>
        )}
      </div>

      <div className='w-full max-w-md bg-white p-8 shadow-md rounded-xl'>
        <h2 className='text-xl font-semibold mb-4 text-center text-gray-800'>
          {promptText || 'What’s on your mind today?'}
        </h2>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <textarea
            name='journal'
            className='w-full border rounded p-4 text-gray-700'
            placeholder='Enter your response'
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
