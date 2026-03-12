CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    text TEXT,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    likes INTEGER,
    image TEXT,
    flagged BOOLEAN DEFAULT FALSE
)