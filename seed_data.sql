-- Insert prompts (if not already inserted)
INSERT OR IGNORE INTO prompts (id, prompt_text) VALUES
  (1, 'What made you feel this way today?'),
  (2, 'Describe something that went well.'),
  (3, 'What’s one thing you’d like to improve tomorrow?');

-- Insert mood history for user 4
INSERT INTO moods (user_id, mood, mood_date)
VALUES 
  (2, 'happy', '2025-07-29'),
  (2, 'neutral', '2025-07-30'),
  (2, 'very_happy', '2025-07-31'),
  (2, 'sad', '2025-08-01'),
  (2, 'happy', '2025-08-02');

-- Insert journal entries for user 4
INSERT INTO journal (user_id, prompt_id, entry_date, content)
VALUES 
  (2, 1, '2025-07-29', 'Had a good morning walk and coffee. Felt energized.'),
  (2, 2, '2025-07-30', 'Worked through some blockers. Progress was decent.'),
  (2, 3, '2025-07-31', 'Excited for the weekend. Productivity high.'),
  (2, 1, '2025-08-01', 'A bit drained today. Trying to rest more.'),
  (2, 2, '2025-08-02', 'Went to the park. Felt peaceful and grounded.');
