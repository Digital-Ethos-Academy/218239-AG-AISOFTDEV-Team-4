import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import MoodLogger from './MoodLogger';
import JournalPrompt from './JournalPrompt';
import SignUpForm from './SignUpForm';

const App = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/mood" element={<MoodLogger />} />
        <Route path="/journal" element={<JournalPrompt />} />
      </Routes>
    </div>
  );
};

export default App;
