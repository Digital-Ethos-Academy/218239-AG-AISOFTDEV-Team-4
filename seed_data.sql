INSERT INTO users (email, password_hash, display_name) VALUES
('emma.smith@example.com', 'hash1', 'Emma Smith'),
('carlos.garcia@example.com', 'hash2', 'Carlos Garcia'),
('alex.johnson@example.com', 'hash3', 'Alex Johnson');

INSERT INTO moods (user_id, mood, mood_date) VALUES
(1, 'Stressed', '2025-07-24'),
(1, 'Productive', '2025-07-25'),
(2, 'Anxious', '2025-07-25'),
(2, 'Motivated', '2025-07-26'),
(3, 'Content', '2025-07-25');