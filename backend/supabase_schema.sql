-- Supabase Database Schema for Guestbook and AI Session Logging
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Guestbook Signatures Table
CREATE TABLE IF NOT EXISTS guestbook_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL DEFAULT '✨',
    image_data TEXT NOT NULL, -- Base64 encoded image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Sessions Table
CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100), -- Optional user identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Interactions Table (logs prompts and responses)
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(50) DEFAULT 'gpt-4',
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook_signatures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_updated_at ON ai_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session_id ON ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at DESC);

-- Row Level Security Policies (Optional - for additional security)
-- Enable RLS
ALTER TABLE guestbook_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to guestbook signatures
CREATE POLICY "Allow public read access to guestbook signatures" ON guestbook_signatures
    FOR SELECT USING (true);

-- Allow public insert access to guestbook signatures
CREATE POLICY "Allow public insert access to guestbook signatures" ON guestbook_signatures
    FOR INSERT WITH CHECK (true);

-- Allow public access to AI sessions (for logging)
CREATE POLICY "Allow public access to ai_sessions" ON ai_sessions
    FOR ALL USING (true);

-- Allow public access to AI interactions (for logging)
CREATE POLICY "Allow public access to ai_interactions" ON ai_interactions
    FOR ALL USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_guestbook_signatures_updated_at 
    BEFORE UPDATE ON guestbook_signatures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_sessions_updated_at 
    BEFORE UPDATE ON ai_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
-- INSERT INTO guestbook_signatures (name, emoji, image_data) VALUES 
-- ('Test User', '🎨', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
