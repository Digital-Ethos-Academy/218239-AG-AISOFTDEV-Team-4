import sqlite3
from datetime import datetime

def seed_demo_data(db_path, user_email):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Look up the user by email
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_email,))
        result = cursor.fetchone()
        if not result:
            print(f"No user found with email {user_email}")
            return

        user_id = result[0]
        print(f"Found user ID {user_id} for email {user_email}")

        # Insert prompts (if they don't already exist)
        prompts = [
            (1, "What made you feel this way today?"),
            (2, "Describe something that went well."),
            (3, "What’s one thing you’d like to improve tomorrow?")
        ]
        for prompt in prompts:
            cursor.execute(
                "INSERT OR IGNORE INTO prompts (id, prompt_text, created_at) VALUES (?, ?, ?)",
                (prompt[0], prompt[1], datetime.utcnow())
            )

        # Insert mood history
        mood_data = [
            ("happy", "2025-07-29"),
            ("neutral", "2025-07-30"),
            ("very_happy", "2025-07-31"),
            ("sad", "2025-08-01"),
            ("happy", "2025-08-02")
        ]
        for mood, date in mood_data:
            cursor.execute(
                "INSERT INTO moods (user_id, mood, mood_date, created_at) VALUES (?, ?, ?, ?)",
                (user_id, mood, date, datetime.utcnow())
            )

        # Insert journal entries
        journal_data = [
            (1, "2025-07-29", "Had a good morning walk and coffee. Felt energized."),
            (2, "2025-07-30", "Worked through some blockers. Progress was decent."),
            (3, "2025-07-31", "Excited for the weekend. Productivity high."),
            (1, "2025-08-01", "A bit drained today. Trying to rest more."),
            (2, "2025-08-02", "Went to the park. Felt peaceful and grounded.")
        ]
        for prompt_id, entry_date, content in journal_data:
            cursor.execute(
                "INSERT INTO journal (user_id, prompt_id, entry_date, content, created_at) VALUES (?, ?, ?, ?, ?)",
                (user_id, prompt_id, entry_date, content, datetime.utcnow())
            )

        conn.commit()
        print("Demo data seeded successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    db_path = "mental_health.db"
    demo_email = "demo1@example.com"
    seed_demo_data(db_path, demo_email)
