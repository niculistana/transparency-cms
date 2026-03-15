CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    details JSONB,
    dismissed BOOLEAN DEFAULT FALSE
)