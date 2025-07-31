import React, { useState } from 'react';
import LoginForm from './LoginForm';
import MoodLogger from './MoodLogger';
import JournalPrompt from './JournalPrompt';
import SignUpForm from './SignUpForm';

const App = () => {
  const [step, setStep] = useState('login');

  const handleLogin = () => setStep('mood');
  const handleMoodLogged = () => setStep('journal');
  const handleJournalSubmit = () => setStep('mood');
  const handleSignUp = () => setStep('signup');
  const handleGoToLogin = () => setStep('login');

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      {step === 'login' && (
        <LoginForm onLogin={handleLogin} onSignUpClick={handleSignUp} />
      )}
      {step === 'signup' && <SignUpForm onLoginClick={handleGoToLogin} />}
      {step === 'mood' && <MoodLogger onMoodLogged={handleMoodLogged} />}
      {step === 'journal' && <JournalPrompt onSubmit={handleJournalSubmit} />}
    </div>
  );
};

export default App;