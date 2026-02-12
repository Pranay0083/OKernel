-- Language Poll Table for OKernel Packages Page
-- Tracks votes for which language OKernel should support next

CREATE TABLE IF NOT EXISTS language_poll (
    id SERIAL PRIMARY KEY,
    language TEXT NOT NULL UNIQUE,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial languages
INSERT INTO language_poll (language, votes) VALUES
    ('javascript', 0),
    ('rust', 0),
    ('go', 0),
    ('java', 0),
    ('cpp', 0)
ON CONFLICT (language) DO NOTHING;

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_language_vote(lang TEXT)
RETURNS void AS $$
BEGIN
    UPDATE language_poll
    SET votes = votes + 1, updated_at = NOW()
    WHERE language = lang;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE language_poll ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read votes
CREATE POLICY "Allow public read access to language_poll"
    ON language_poll FOR SELECT
    USING (true);

-- Only allow voting through the RPC function (no direct updates)
CREATE POLICY "Disallow direct updates to language_poll"
    ON language_poll FOR UPDATE
    USING (false);

-- Grant execute on the function to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_language_vote(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_language_vote(TEXT) TO authenticated;
