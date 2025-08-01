import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const MoodLogger = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [journals, setJournals] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [userName, setUserName] = useState('');
  const [moodAlreadyLogged, setMoodAlreadyLogged] = useState(false);
  const navigate = useNavigate();

  const moods = [
    { label: 'Very sad', emoji: '😢', value: 'very_sad', score: 1 },
    { label: 'Sad', emoji: '😟', value: 'sad', score: 2 },
    { label: 'Neutral', emoji: '😐', value: 'neutral', score: 3 },
    { label: 'Happy', emoji: '😊', value: 'happy', score: 4 },
    { label: 'Very happy', emoji: '😁', value: 'very_happy', score: 5 },
  ];
  const COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#6EE7B7'];

  useEffect(() => {
    const name = localStorage.getItem('display_name');
    if (name) setUserName(name);
    fetchMoodHistory();
    fetchJournals();
  }, []);

  const handleMoodClick = (mood) => setSelectedMood(mood);

  const fetchMoodHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/moods/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch mood history');
      const data = await res.json();
      setMoodHistory(data);

      const today = new Date().toISOString().split('T')[0];
      const alreadyLogged = data.some(entry => entry.mood_date === today);
      setMoodAlreadyLogged(alreadyLogged);
    } catch (err) {
      console.error('Error fetching moods:', err);
    }
  };

  const fetchJournals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/journal/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch journals');
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
      setJournals(sorted);
      fetchFeedbackForJournals(sorted);
    } catch (err) {
      console.error('Error fetching journals:', err);
    }
  };

  const fetchFeedbackForJournals = async (journalEntries) => {
    const token = localStorage.getItem('token');
    for (const j of journalEntries) {
      try {
        const res = await fetch('http://localhost:8000/journal/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: j.content }),
        });
        if (res.ok) {
          const data = await res.json();
          setFeedbackMap(prev => ({ ...prev, [j.id]: data.feedback }));
        }
      } catch (err) {
        console.warn(`Feedback failed for journal ${j.id}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !selectedMood) return;

    try {
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

      if (!res.ok) throw new Error('Failed to submit mood');
      const data = await res.json();

      navigate('/journal', {
        state: {
          mood: data.mood.mood,
          promptText: data.prompt,
        },
      });
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Try again.');
    }
  };

  const moodScoreMap = Object.fromEntries(moods.map(m => [m.value, m.score]));

  const lineChartData = moodHistory.map(entry => ({
    date: new Date(entry.mood_date).toLocaleDateString(),
    moodScore: moodScoreMap[entry.mood] || 0,
  }));

  const moodDistributionMap = {};
  moodHistory.forEach(entry => {
    moodDistributionMap[entry.mood] = (moodDistributionMap[entry.mood] || 0) + 1;
  });

  const pieChartData = Object.entries(moodDistributionMap).map(([mood, value]) => ({
    name: moods.find(m => m.value === mood)?.label || mood,
    value,
  }));

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome, {userName} 👋
        </h1>
      </div>

      {/* Mood Logger */}
      <div className="col-span-full bg-white shadow-md rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Log Your Mood</h1>
        <p className="text-gray-600">How are you feeling today?</p>
        <div className="flex justify-between py-4 text-3xl">
          {moods.map((mood) => {
            const isSelected = selectedMood?.value === mood.value;
            return (
              <button
                key={mood.label}
                onClick={() => handleMoodClick(mood)}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 ${isSelected
                  ? 'border-blue-500 bg-blue-50 scale-110'
                  : 'border-transparent hover:border-gray-300'
                  } transition-transform`}
                aria-label={mood.label}
              >
                {mood.emoji}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedMood || moodAlreadyLogged}
          className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full transition ${!selectedMood || moodAlreadyLogged
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-700'
            }`}
        >
          {moodAlreadyLogged ? 'Mood Already Logged Today' : 'Log Mood'}
        </button>
      </div>

      {/* Analytics */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">Mood Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={lineChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <XAxis dataKey="date" />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(v) => moods.find(m => m.score === v)?.label}
              />
              <Tooltip formatter={(v) => moods.find(m => m.score === v)?.label} />
              <Line type="monotone" dataKey="moodScore" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">Mood Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
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

      {/* Journals */}
      <div className="col-span-full bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">Recent Journal Entries</h2>
        {journals.length === 0 ? (
          <p className="text-gray-500">No journal entries yet.</p>
        ) : (
          <div className="space-y-2">
            {(showAll ? journals : journals.slice(0, 3)).map((j) => (
              <div key={j.id} className="border p-3 rounded bg-gray-50 space-y-1">
                <p className="text-sm text-gray-400">
                  {new Date(j.entry_date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{j.content}</p>
                {feedbackMap[j.id] && (
                  <div className="text-sm text-blue-600 italic mt-1">
                    💬 {feedbackMap[j.id]}
                  </div>
                )}
              </div>
            ))}
            {journals.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-blue-600 hover:underline mt-2"
              >
                {showAll ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodLogger;
