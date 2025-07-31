import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const MoodLogger = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { label: 'Very sad', emoji: '😢' },
    { label: 'Sad', emoji: '😟' },
    { label: 'Neutral', emoji: '😐' },
    { label: 'Happy', emoji: '😊' },
    { label: 'Very happy', emoji: '😁' },
  ];

  const handleMoodClick = (mood) => setSelectedMood(mood);

  const journalEntries = [
    { date: '2023-10-01', text: 'Feeling a bit down today, but trying to stay positive.' },
    { date: '2023-10-02', text: 'Had a good day, managed to complete my tasks and felt productive.' },
    { date: '2023-10-03', text: 'Struggled with anxiety today, but talked to a friend which helped.' }
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      alert(`Mood logged: ${selectedMood.label}`);
      onMoodLogged();
    } else {
      alert('Please select a mood.');
    }
  };

  // Example mood history for the chart
  const moodHistory = [
    { day: 'Mon', moodScore: 2 },
    { day: 'Tue', moodScore: 1 },
    { day: 'Wed', moodScore: 2 },
    { day: 'Thu', moodScore: 3 },
    { day: 'Fri', moodScore: 2 },
    { day: 'Sat', moodScore: 3 },
    { day: 'Sun', moodScore: 4 },
  ];

  const moodDistribution = [
    { name: 'Very sad', value: 2 },
    { name: 'Sad', value: 3 },
    { name: 'Neutral', value: 2 },
    { name: 'Happy', value: 5 },
    { name: 'Very happy', value: 4 },
  ];

  const COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#6EE7B7'];

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Mood Logger Panel */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Log Your Mood</h1>
        <p className="text-gray-600">How are you feeling today?</p>
        <div className="flex justify-between py-4 text-3xl">
          {moods.map((mood) => (
            <button
              key={mood.label}
              onClick={() => handleMoodClick(mood)}
              className={`transition transform ${selectedMood === mood ? 'opacity-100 scale-110' : 'opacity-60'
                }`}
              aria-label={mood.label}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full hover:bg-blue-700 transition"
        >
          Log Mood
        </button>

      </div>
      

      {/* Analytics Panel */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">Mood Over Time</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={moodHistory}>
            <XAxis dataKey="day" />
            <YAxis domain={[0, 5]} hide />
            <Tooltip />
            <Line type="monotone" dataKey="moodScore" stroke="#3B82F6" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>

        <h3 className="text-lg font-semibold mt-4">Mood Analytics</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={moodDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              label
            >
              {moodDistribution.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        {/* Recent Journals */}

      </div>
              <div className="bg-white shadow-md rounded-lg p-6 col-span-3">
          <h2 className="text-xl font-bold mb-4">Recent Journal Entries</h2>
          <ul className="space-y-4">
            {journalEntries.map((entry, index) => (
              <li key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">{entry.date}</p>
                <p className="text-gray-800">{entry.text}</p>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
};

export default MoodLogger;