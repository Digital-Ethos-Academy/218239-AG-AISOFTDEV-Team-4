import React, { useState } from 'react';
import LoginForm from './LoginForm';
import MoodLogger from './MoodLogger';
import JournalPrompt from './JournalPrompt';

const App = () => {
  const [step, setStep] = useState('login'); // 'login' → 'mood' → 'journal'

  const handleLogin = () => setStep('mood');
  const handleMoodLogged = () => setStep('journal');

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      {step === 'login' && <LoginForm onLogin={handleLogin} />}
      {step === 'mood' && <MoodLogger onMoodLogged={handleMoodLogged} />}
      {step === 'journal' && <JournalPrompt />}
    </div>
  );
};

export default App;
