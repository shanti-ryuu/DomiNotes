-- PIN Authentication table
CREATE TABLE pin_auth (
  id SERIAL PRIMARY KEY,
  pin TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL
);

-- Folders table
CREATE TABLE folders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL
);

-- Note-Folder relationship table
CREATE TABLE note_folders (
  note_id BIGINT REFERENCES notes(id) ON DELETE CASCADE,
  folder_id BIGINT REFERENCES folders(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, folder_id)
);

-- Add indexes for better performance
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX folders_user_id_idx ON folders(user_id);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_auth ENABLE ROW LEVEL SECURITY;

-- Create policies that only allow users to see their own data
-- Note the ::text cast to fix the type mismatch error
CREATE POLICY "Users can only see their own notes" ON notes
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only see their own folders" ON folders
  FOR ALL USING (user_id = auth.uid()::text);

-- For the junction table, use a more complex policy
CREATE POLICY "Users can only see note-folder relationships for their notes" ON note_folders
  FOR ALL USING (
    note_id IN (SELECT id FROM notes WHERE user_id = auth.uid()::text)
  );

-- PIN auth table should be accessible to all authenticated users
CREATE POLICY "All authenticated users can access PIN auth" ON pin_auth
  FOR ALL USING (auth.role() = 'authenticated');
