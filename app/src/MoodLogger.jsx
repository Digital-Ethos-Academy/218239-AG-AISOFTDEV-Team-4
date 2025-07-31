import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const MoodLogger = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);

  const moods = [
    { label: 'Very sad', emoji: '😢', value: 'very_sad', score: 1 },
    { label: 'Sad', emoji: '😟', value: 'sad', score: 2 },
    { label: 'Neutral', emoji: '😐', value: 'neutral', score: 3 },
    { label: 'Happy', emoji: '😊', value: 'happy', score: 4 },
    { label: 'Very happy', emoji: '😁', value: 'very_happy', score: 5 },
  ];

  const COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#6EE7B7'];

  const handleMoodClick = (mood) => setSelectedMood(mood);

  const fetchMoodHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/moods/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch mood history');
      const data = await res.json();
      setMoodHistory(data);
    } catch (err) {
      console.error('Error fetching moods:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      alert('Please select a mood.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/moods/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood.value,
          mood_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error('Failed to log mood');

      await fetchMoodHistory(); // Refresh after logging
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      console.error('Error logging mood:', err);
      alert('Error logging mood.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  // Prepare data for charts
  const moodScoreMap = Object.fromEntries(moods.map(m => [m.value, m.score]));

  const lineChartData = moodHistory.map(entry => ({
    date: new Date(entry.mood_date).toLocaleDateString(),
    moodScore: moodScoreMap[entry.mood] || 0,
  }));

  const moodDistributionMap = {};
  moodHistory.forEach(entry => {
    const mood = entry.mood;
    moodDistributionMap[mood] = (moodDistributionMap[mood] || 0) + 1;
  });

  const pieChartData = Object.entries(moodDistributionMap).map(([mood, value]) => ({
    name: moods.find(m => m.value === mood)?.label || mood,
    value,
  }));

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
              className={`transition transform ${
                selectedMood === mood ? 'opacity-100 scale-110' : 'opacity-60'
              }`}
              aria-label={mood.label}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full transition ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Logging...' : 'Log Mood'}
        </button>
      </div>

      {/* Analytics Panel */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">Mood Over Time</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineChartData}>
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Line type="monotone" dataKey="moodScore" stroke="#3B82F6" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>

        <h3 className="text-lg font-semibold mt-4">Mood Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              label
            >
              {pieChartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MoodLogger;
