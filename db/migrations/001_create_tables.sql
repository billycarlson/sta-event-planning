-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT
);

-- events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location TEXT,
  type TEXT,
  status TEXT CHECK (status IN ('idea','in_development','confirmed','archived')) DEFAULT 'idea',
  speakers TEXT,
  sponsors TEXT,
  budget NUMERIC,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id),
  due_date DATE,
  status TEXT
);

-- notes
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT,
  timestamp TIMESTAMP
);

-- media
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  file_name TEXT,
  file_type TEXT,
  drive_file_id TEXT,
  drive_url TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP
);
