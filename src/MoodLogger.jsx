import React, { useState } from 'react';

const MoodLogger = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { label: 'Very sad', emoji: '😢' },
    { label: 'Sad', emoji: '😟' },
    { label: 'Neutral', emoji: '😐' },
    { label: 'Happy', emoji: '😊' },
    { label: 'Very happy', emoji: '😁' },
  ];

  const handleMoodClick = mood => setSelectedMood(mood);

  const handleSubmit = () => {
    if (selectedMood) {
      alert(`Mood logged: ${selectedMood.label}`);
      onMoodLogged();
    } else {
      alert('Please select a mood.');
    }
  };

  return (
    <div className='max-w-sm mx-auto bg-white shadow-md rounded-lg p-6 space-y-4'>
      <h1 className='text-xl font-bold'>Log Your Mood</h1>
      <p className='text-gray-600'>How are you feeling today?</p>
      <div className='flex justify-around py-4'>
        {moods.map(mood => (
          <button
            key={mood.label}
            onClick={() => handleMoodClick(mood)}
            className={`text-2xl ${
              selectedMood === mood ? 'opacity-100' : 'opacity-50'
            }`}
            aria-label={mood.label}
          >
            {mood.emoji}
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full'
        disabled={!selectedMood}
      >
        Log Mood
      </button>
    </div>
  );
};

export default MoodLogger;
